# Cronet DNS 优化机制

DNS 解析是网络请求第一站，DNS 延迟占总请求延迟很大比例。Cronet 做了很多 DNS 优化。

## 基础 DNS 流程

基础流程很标准：

```
新域名第一次请求 →
    查询本地缓存 →
    没命中 → 异步发起解析 →
    拿到 IP → 存缓存 → 继续连接
```

## DNS 缓存

Cronet 自己维护 DNS 缓存，不依赖系统 DNS 缓存：

```cpp
class HostResolver {
    // LRU 缓存，key 是域名，value 是 IP 列表
    LRUCache<string, AddressList> cache_;
    // 默认超时：TTL 来自 DNS 响应，没给 TTL 用默认 1 小时
};
```

缓存好处：
- 同一个域名第二次请求，不用再走网络解析 → 省几十到上百毫秒
- 缓存满了 LRU 淘汰旧域名，控制内存

## DNS 预解析（预取）

预解析就是提前预判用户要访问什么域名，提前解析好，等用户点进去直接用。

### 什么时候用？

- 用户正在看列表页，你知道点进去肯定要访问 `example.com`
- 你预判用户下一步会去哪个域名
- 导航栏输入一半，你预判域名

### 用法 (Android)

```java
CronetEngine engine = ...;
engine.prebind("https://example.com");
// 或者
engine.getHostResolver().resolve(host);
```

做了预解析之后，用户点进去：
- DNS 已经缓存好了 → 直接拿 IP 连接
- 省掉 DNS 解析延迟，快很多

## DNS-over-HTTPS (DoH)

Cronet 原生支持 DoH：

- DNS 查询走 HTTPS 加密，不会被中间运营商窃听和污染
- 和 HTTP 请求走同一个连接，不用新建 UDP 53 端口连接
- 隐私更好，有时候更快

配置：

```java
CronetEngine.Builder builder = new CronetEngine.Builder(context)
    .setDnsHttpsServer("https://dns.google/dns-query");
```

## 并发尝试多个 IP

域名解析返回多个 IP，哪个快用哪个：

Cronet 做法：
```
解析得到多个 IP →
    同时尝试多个 IP →
    哪个先连接成功用哪个 →
    关掉其他没成功的 →
    给用户最快结果
```

比串行试快很多，尤其有些 IP 丢包。

## 常见 DNS 相关问题处理

| 问题 | Cronet 处理 |
|------|-------------|
| 解析失败 | 尝试下一个 IP，全部失败才报错 |
| TTL 过期 | 异步后台刷新，不阻塞当前请求 |
| 网络切换 | 清空 DNS 缓存，重新解析 |

## 优化效果

做好 DNS 优化：

| 场景 | 平均延迟 |
|------|----------|
| 未缓存 | 50-200ms |
| 缓存命中 | <10ms |
| 预解析 | <10ms |

DNS 优化做好了，首屏就能快很多。

---

上一章：[HTTP 缓存](./07-cache.md)
下一章：[连接池和复用](./09-connection-pool.md)
