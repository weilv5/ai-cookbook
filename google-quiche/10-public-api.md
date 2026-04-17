# Google QUICHE 公共 API 与集成指南

QUICHE 的 API 是 C++ 面向对象风格，基于回调，这一章整理核心 API 和集成要点。

## 连接生命周期 API

### `QuicClientConnection::Create()` —— 创建客户端连接

```cpp
static std::unique_ptr<QuicConnection> Create(
    QuicConnectionId server_connection_id,
    QuicSocketAddress self_address,
    QuicSocketAddress peer_address,
    Delegate* delegate,
    CryptoHandshakerInterface* crypto,
    const QuicConfig& config,
    ParsedQuicVersion version,
    bool is_client);
```

**什么时候用：** 客户端发起新连接时创建。

- `delegate` 是你实现的回调接口，QUICHE 有事件了通知你
- `crypto` 是 TLS 握手对象，一般用 `SSLCryptoHandshake`

---

### `ProcessUdpPacket()` —— 处理收到的 UDP 数据包

```cpp
void ProcessUdpPacket(
    QuicSocketAddress self_address,
    QuicSocketAddress peer_address,
    const quiche::QuicheStringPiece& packet);
```

**核心入口**：你从 UDP socket 收到包，就调用这个喂给 QUICHE。

QUICHE 处理完会调用你的 Delegate 回调。

---

### `SerializeNextPacket()` —— 打包下一个待发送数据包

```cpp
QuicPacketResult SerializeNextPacket(
    char* buffer,
    size_t buffer_len);

struct QuicPacketResult {
    size_t packet_length;  // 打包好的长度，0 表示没数据可发
    QuicErrorCode error;
};
```

你循环调用这个，每次打出一个 UDP 包，然后你 sendto 出去。

一直打到返回 `packet_length = 0` 就停。

---

### `CanWrite()` —— 当前能不能发数据

```cpp
bool CanWrite() const;
```

拥塞窗口满了你就不能发了，等下一次 ACK 来了再发。

---

### `OnTimeout()` —— 处理超时

```cpp
void OnTimeout(QuicTime now);
```

你的定时器到点了，必须调用这个，QUICHE 做丢包检测和空闲超时。

---

### `next_timeout()` —— 查询下一次超时时间

```cpp
QuicTime next_timeout() const;
```

你可以用这个告诉你的定时器什么时候该唤醒，不用频繁空轮询。

---

### `Close()` —— 关闭连接

```cpp
void Close(QuicErrorCode error, const std::string& details);
```

主动关闭连接，发 CONNECTION_CLOSE 给对端。

---

## 流操作 API

### `QuicSession::CreateOutgoingStream()` —— 创建新的出站流

```cpp
QuicStream* CreateOutgoingStream();
```

HTTP/3 就是每个请求一个流，发请求前调用这个新建流。

---

### `QuicStream::Write` —— 写数据到流

```cpp
size_t Write(quiche::QuicheStringPiece data, bool fin);
```

- `fin = true` 表示这是最后一块数据，写完关闭发送方向
- 返回实际写了多少字节，如果窗口满了返回 0，你等会再写

---

### `QuicStream::Read` —— 从流读数据

```cpp
size_t Read(char* buffer, size_t buffer_len, bool* fin);
```

- 读到数据返回字节数，放你 buffer 里
- `*fin` 输出 true 表示对端发完了，所有数据读完了

---

### `QuicStream::Finish` —— 标记发送完成

```cpp
void Finish();
```

等价于 `Write({}, true)`，告诉对端我发完了。

---

### `QuicStream::Reset` —— 重置关闭流带错误码

```cpp
void Reset(QuicRstStreamErrorCode error);
```

不正常关闭，发 RST_STREAM 给对端。

---

## HTTP/3 API

### `Http3ClientSession` —— 客户端 HTTP/3 会话

```cpp
Http3ClientSession(
    QuicConnection* connection,
    Visitor* visitor);
```

QUIC 握手完成后，创建这个对象管理 HTTP/3。

---

### `Http3ClientSession::NewStream` —— 新建请求流

```cpp
Http3Stream* NewStream();
```

---

### `Http3Stream::SendHeaders` —— 发送请求头

```cpp
void SendHeaders(const std::vector<Header>& headers, bool fin);
```

头编码会自动用 QPACK，你给我明文头就行。

---

### `Http3Stream::SendBody` —— 发送请求 body

```cpp
void SendBody(quiche::QuicheStringPiece body, bool fin);
```

---

### 回调接口 `Http3ClientSession::Visitor`

你要实现这几个回调：

```cpp
class Visitor {
    // 头收到了
    virtual void OnHeadersComplete(Http3Stream* stream,
                                   std::vector<Header> headers) = 0;
    // body 数据来了
    virtual void OnDataAvailable(Http3Stream* stream) = 0;
    // 整个请求完成了
    virtual void OnFinish(Http3Stream* stream) = 0;
    // 错误了
    virtual void OnError(Http3Stream* stream, QuicErrorCode error) = 0;
};
```

---

## Delegate 回调接口（必须实现）

`QuicConnection::Delegate` 你必须实现：

```cpp
class Delegate {
    // 握手完成
    virtual void OnHandshakeComplete() = 0;
    // 有流数据可读了
    virtual void OnStreamDataAvailable(QuicStreamId id) = 0;
    // 连接关闭了
    virtual void OnConnectionClosed(QuicErrorCode error,
                                    const std::string& details) = 0;
    // 可以发送数据了
    virtual void OnCanWrite() = 0;
    ...
};
```

QUICHE 是事件驱动，所有事件都通过回调通知你。

---

## 典型客户端集成完整代码骨架

```cpp
// 1. 你实现 Delegate 回调
class MyDelegate : public QuicConnection::Delegate {
    void OnHandshakeComplete() override {
        // 握手完成，可以发请求了
        http3_session = new Http3ClientSession(connection, this);
        stream = http3_session->NewStream();
        std::vector<Header> headers = {
            {":method", "GET"},
            {":scheme", "https"},
            {":authority", "example.com"},
            {":path", "/"},
        };
        stream->SendHeaders(headers, true);
        connection->OnCanWrite();  // 触发发送
    }

    void OnStreamDataAvailable(QuicStreamId id) override {
        // 有数据可读，读出来处理
        char buf[4096];
        bool fin;
        size_t n = stream->Read(buf, sizeof(buf), &fin);
        process_response(buf, n);
        if (fin) {
            // 请求完成
        }
    }

    void OnConnectionClosed(...) override {
        // 连接关闭，清理
    }
};

// 2. 初始化
QuicConfig config;
auto crypto = std::make_unique<SSLCryptoHandshake>(...);
auto connection = QuicClientConnection::Create(
    server_cid, self_addr, peer_addr, &delegate, crypto.release(),
    config, ParsedQuicVersion::RFCv1(), true);

// 3. 事件循环
while (!done) {
    // 等待网络事件或超时
    // ...

    if (udp_readable) {
        n = recvfrom(sock, buf, sizeof(buf), ...);
        connection->ProcessUdpPacket(self_addr, peer_addr,
            quiche::QuicheStringPiece(buf, n));
    }

    if (timeout_expired) {
        connection->OnTimeout(QuicTime::Now());
    }

    if (connection->CanWrite()) {
        while (true) {
            auto result = connection->SerializeNextPacket(out_buf, sizeof(out_buf));
            if (result.packet_length == 0) break;
            sendto(sock, out_buf, result.packet_length, ...);
        }
    }
}
```

就是这么个流程，不复杂，核心就是**你喂包进来，QUICHE 处理完调你回调，你打包发出去**。

## 编译集成要点

### CMake 编译 QUICHE

```sh
git clone https://github.com/google/quiche.git
cd quiche
mkdir build && cd build
cmake .. -DQUICHE_BORINGSSL_PATH=/path/to/boringssl
make -j$(nproc)
```

依赖 BoringSSL，你得先把 BoringSSL 编译好。

### 链接你的项目

```cmake
find_package(quiche REQUIRED)
target_link_libraries(your_target quiche::quiche)
```

## 平台移植

如果要移植到新平台：

1. 实现 `platform/` 下的平台抽象接口（内存分配、时间、日志）
2. 提供 BoringSSL 链接
3. 剩下核心代码不用改

## 常见问题

**Q: 为什么收不到数据？**
A: 检查你是不是收到包忘记调用 `ProcessUdpPacket()` 了。

**Q: 为什么发不出去？**
A: 检查拥塞窗口是不是满了，等 ACK 就好了，或者流量控制窗口满了，对端没读。

**Q: 为什么连接总是超时？**
A: 检查你的防火墙有没有放 UDP 443 端口，有些公司网络屏蔽 UDP。

**Q: 支持连接迁移吗？**
A: 支持，只要客户端地址变了，你继续喂包进来，QUICHE 处理连接迁移。

---

## 文档目录

| 文件 | 内容 |
|------|------|
| [01-overview.md](./01-overview.md) | 项目简介和整体架构 |
| [02-modules.md](./02-modules.md) | 功能模块划分与职责 |
| [03-data-structures.md](./03-data-structures.md) | 核心数据结构详解 |
| [04-connection-statemachine.md](./04-connection-statemachine.md) | 连接状态机与状态转移 |
| [05-packet-processing.md](./05-packet-processing.md) | 数据包完整处理流程 |
| [06-congestion-control.md](./06-congestion-control.md) | 拥塞控制多种算法实现 |
| [07-tls-integration.md](./07-tls-integration.md) | TLS 1.3 握手集成 |
| [08-http3-qpack.md](./08-http3-qpack.md) | HTTP/3 协议与 QPACK 头压缩 |
| [09-integration-flow.md](./09-integration-flow.md) | 完整功能调用链从头到尾 |
| **10-public-api.md** ← 你在这里 | 公共 API 整理和集成指南 |

---

项目地址：https://github.com/google/quiche
