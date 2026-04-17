# Cronet HTTP/3 QUIC 集成

Cronet 是最早大规模商用 QUIC/HTTP/3 的客户端网络库，对 QUIC 支持非常完善，这一章讲讲集成细节。

## 整体架构

Cronet 直接集成 **Google QUICHE**，就是我们上一篇整理的：

```
Cronet → 依赖 Google QUICHE → 依赖 BoringSSL
```

复用 QUICHE 做 QUIC 编解码、拥塞控制、状态机，Cronet 做上层会话管理和集成。

## 模块结构

```cpp
class QuicSessionPool {
    // 保存所有活跃 QUIC 会话，按服务器地址索引
    std::map<HostPortPair, std::list<QuicSession*>> sessions_;
    // 配置
    QuicConfig config_;
};

class QuicChromiumClientSession : public QuicSession {
    // 底层 QUIC 连接（QUICHE）
    std::unique_ptr<QuicConnection> connection_;
    // 对端地址
    IPEndPoint peer_address_;
    // 所有活跃流
    std::map<QuicStreamId, QuicChromiumClientStream*> streams_;
};

class QuicChromiumClientStream : public QuicStream {
    // 对上 HTTP 层接口
    Stream::Delegate* delegate_;
};
```

结构清晰，Cronet 只是把 QUICHE 包装成 Chromium net 要求的接口。

---

## QUIC 会话复用

和 TCP 连接池一样，Cronet 也有 QUIC 会话池：

```
同一个 host:port 新请求进来 →
    查找会话池有没有已经建立好的 QUIC 会话 →
        有 → 复用会话，新开一个流 → 不用重新握手
        没有 → 新建 QUIC 会话 → 握手 → 新流
```

好处：
- 同一个域名多个请求多路复用到一个 QUIC 连接
- 不用每个请求新建连接，省握手延迟
- 比 HTTP/1.1 多个连接好，比 HTTP/2 无队头阻塞

---

## 握手流程（客户端）

```
新建 QUIC 会话 →
    ↓
    如果有之前会话的会话票证 →
        尝试 0-RTT 握手 →
        导出 early 密钥 →
        第一个包就能发请求头 →
        不用等服务器回包 → 省一个 RTT
    ↓
    如果没有票证，或者 0-RTT 失败 →
        走正常 1-RTT 握手 → 一个 RTT 就能完成握手，比 TLS 1.2 好
```

0-RTT 限制：只能幂等请求（GET）用，POST 不能用，防重放攻击。

---

## 连接迁移支持

QUIC 最大的好处就是连接迁移，客户端 IP 变了连接不断：

什么时候 IP 会变？
- 手机从 Wifi 切到 4G/5G
- 从一个基站切到另一个基站
- NAT 超时换端口

Cronet 怎么处理：
```
客户端 IP 变了 → 服务器还是同一个连接ID →
    识别出还是原来那个连接 →
    不用重新握手 → 请求继续 →
    用户完全感受不到断网重连
```

这对移动端体验提升非常大，切换网络不中断请求，不会失败重来了。

---

## HTTP/3 请求流程

一个 HTTP/3 GET 请求在 Cronet 里怎么走：

```
UrlRequest 开始 → DNS 解析 → 拿到 IP →
    ↓
    找 QUIC 会话池 → 有没有会话 →
    ↓
    新建会话 → 握手（0-RTT or 1-RTT）→
    ↓
    新建 QUIC 流 →
    ↓
    QPACK 编码请求头 → 写入流 →
    ↓
    QUICHE 打包成 QUIC 数据包 → 发送 →
    ↓
    服务器发回响应头 → QPACK 解码 →
    ↓
    通知 OnResponseStarted →
    ↓
    接收 body 数据 → 通知 OnReadCompleted →
    ↓
    读完 body → 流关闭 → 会话还活着，放回池子里复用
```

对比 TCP TLS 新建连接：
- 0-RTT QUIC: 第一个RTT就能拿到响应 → 比 2-RTT TCP TLS 快整整一个RTT
- 连接迁移不中断 → 体验好太多

---

## 降级 fallback 机制

QUIC 不是 100% 总能成，有些网络会 UDP 丢包或者拦截：

Cronet 降级逻辑：
```
QUIC 握手失败 →
    ↓
    记录这个 host 暂时不能用 QUIC →
    ↓
    降级走 TCP HTTP/2 →
    ↓
    过一段时间再重试 QUIC
```

保证极端情况下请求还能完成，不会彻底失败。

---

## 开关和配置

Cronet 默认打开 QUIC，你可以配置：

```java
CronetEngine.Builder builder = new CronetEngine.Builder(context)
    .enableQuic(true)  // 默认就是 true
    .addQuicHint("example.com", 443, 443)  // 告诉 Cronet 这个主机支持 QUIC
    .build();
```

为什么要 `addQuicHint`？因为 DNS 没有 HTTPS SVCB 记录的时候，Cronet 不知道这个服务器开了 QUIC，你提前说一声，可以直接试 QUIC，不用先试 TCP。

---

## 拥塞控制

Cronet QUIC 默认用 BBRv2，和 QUICHE 默认一致：

```
BBRv2 → 基于带宽测量，不是基于丢包 → 长肥管道性能更好
```

也可以切 Cubic，编译的时候改配置就行。

---

## 为什么 Cronet + HTTP/3 快？

1. **0-RTT 握手** → 省一个 RTT，第一个请求就快
2. **无队头阻塞** → 一个请求丢包不影响其他请求
3. **连接迁移** → 移动网络切换不中断，少很多失败重试
4. **连接复用** → 多个请求共享一个 QUIC连接，不用多次握手
5. **BBRv2 拥塞控制** → 移动端丢包多，BBRv2 比 Cubic 表现好

---

## 和 TCP HTTP/2 性能对比

| 场景 | QUIC HTTP/3 | TCP HTTP/2 |
|------|-------------|-------------|
| 空连接首次请求 | 1-RTT (0-RTT 更快) | 2-RTT |
| 队头阻塞 | 无 | 有 (TCP层) |
| 连接迁移 | 支持 | 不支持 |
| 移动端切换网络 | 不中断 | 断连接重连 |
| 头部压缩 | QPACK | HPACK |

实际测试，同一个网站 QUIC 比 HTTP/2 快 10-30%，移动网络更明显。

---

## 统计和监控

Cronet 会收集 QUIC 统计：

- 握手成功率
- 0-RTT 成功率
- 连接迁移成功率
- 平均 RTT
- 丢包率

你可以拿到这些统计数据打日志，监控网络质量。

---

上一章：[完整请求流程](./05-full-flow.md)
下一章：[缓存实现](./07-cache.md)
