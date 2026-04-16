# quiche 公共 API 速查

quiche 对外 API 非常简洁，这一章整理常用 API 的作用和调用时机。

## 连接生命周期 API

### `quiche::connect()` —— 客户端创建新连接

```rust
pub fn connect(
    scid: &ConnectionId,
    server_name: Option<&str>,
    config: &mut Config,
) -> Result<Connection, Error>
```

**什么时候用：** 客户端发起新连接时调用。

**做什么：**
- 初始化连接状态
- 生成第一个 Initial 数据包
- 返回 Connection 对象

---

### `quiche::accept()` —— 服务器接受新连接

```rust
pub fn accept(
    scid: &ConnectionId,
    config: &mut Config,
) -> Result<Connection, Error>
```

**什么时候用：** 服务器收到客户端第一个 Initial 包后，创建新连接对象。

---

### `connection.close()` —— 关闭连接

```rust
pub fn close(
    &mut self,
    error: Error,
    buf: &mut [u8],
) -> Result<usize, Error>
```

**什么时候用：** 应用想主动关闭连接时调用。

**返回：** 生成要发送的 CONNECTION_CLOSE 数据包，你自己发出去。

---

## 收发数据包 API

### `connection.recv()` —— 处理收到的 UDP 数据包

```rust
pub fn recv(
    &mut self,
    buf: &[u8],
    now: Instant,
) -> Result<Vec<StreamId>, Error>
```

**什么时候用：** 你从 UDP socket 收到一个数据包，喂给 quiche 处理。

**返回：** 有新数据可读的流 ID 列表。

**要点：**
- 你只需要把完整 UDP 数据报整个扔进来
- quiche 自己解析包头、解密、分发到各个流
- 返回哪些流有新数据可以读了

---

### `connection.send()` —— 打包出待发送的 UDP 数据包

```rust
pub fn send(
    &mut self,
    buf: &mut [u8],
    now: Instant,
) -> Result<usize, Error>
```

**什么时候用：** 你有数据要发，想让 quiche 打包出一个 UDP 数据包。

**返回：** 打包好的字节长度，你把这 `len` 字节通过 UDP 发出去。

**要点：**
- 一次 `send()` 调用打包出**一个**完整 UDP 数据报
- quiche 会尽可能把数据装满，提高效率
- 如果没数据可发，返回 0

---

## 流操作 API

### `connection.stream_open()` —— 打开新流

```rust
pub fn stream_open(
    &mut self,
    send: bool,
    recv: bool,
) -> Result<StreamId, Error>
```

**什么时候用：** 你要打开一个新流发送数据。

**参数：** `send = true` 表示你要发，`recv = true` 表示你要收。打开双向流传两个 true。

**返回：** 新分配的 stream_id。

---

### `connection.stream_write()` —— 写数据到流

```rust
pub fn stream_write(
    &mut self,
    stream_id: StreamId,
    buf: &[u8],
    fin: bool,
) -> Result<usize, Error>
```

**什么时候用：** 给某个流写应用数据。

**参数：**
- `fin = true` 表示这是最后一块数据，写完就关闭发送方向
- 如果还有数据要写，`fin = false`

**返回：** 实际写了多少字节。如果窗口满了返回 `Err(Error::Done)` 表示写不动了，等会再写。

---

### `connection.stream_read()` —— 从流读数据

```rust
pub fn stream_read(
    &mut self,
    stream_id: StreamId,
    buf: &mut [u8],
) -> Result<(usize, bool), Error>
```

**什么时候用：** 流有数据可读了，读出来给应用。

**返回：** `(读了多少字节, fin)`，`fin = true` 表示对端已经关闭发送方向，所有数据读完了。

如果没数据可读返回 `Err(Error::Done)`。

---

### `connection.stream_finish()` —— 标记发送完成

```rust
pub fn stream_finish(
    &mut self,
    stream_id: StreamId,
) -> Result<(), Error>
```

等价于 `stream_write(stream_id, &[], true)`，就是告诉对端我发完了。

---

### `connection.stream_reset()` —— 重置关闭流

```rust
pub fn stream_reset(
    &mut self,
    stream_id: StreamId,
    error_code: u64,
) -> Result<(), Error>
```

**什么时候用：** 想要立刻不正常关闭流，携带错误码给对端。

---

## 超时相关 API

### `connection.on_timeout()` —— 处理超时事件

```rust
pub fn on_timeout(
    &mut self,
    now: Instant,
) -> Result<(), Error>
```

**什么时候用：** 你的定时器触发了，调用这个让 quiche 处理超时。

**做什么：**
- 检测 idle 超时，太久没通信关闭连接
- 检测 PTO 超时，标记丢包，安排重传
- 需要重传会自动排到发送队列，下次 send 就能发

---

### `connection.next_timeout()` —— 查询下一次超时时间

```rust
pub fn next_timeout(&self) -> Option<Instant>
```

**什么时候用：** 你需要知道再过多久要唤醒处理超时，好设置你的定时器。

**返回：** `None` 表示现在没有待处理的超时。

---

## 状态查询 API

### `connection.is_handshaking()` —— 握手还在进行吗？

```rust
pub fn is_handshaking(&self) -> bool
```

---

### `connection.is_established()` —— 握手完成了，可以发应用数据了吗？

```rust
pub fn is_established(&self) -> bool
```

---

### `connection.is_closed()` —— 连接已经关闭了吗？

```rust
pub fn is_closed(&self) -> bool
```

---

### `connection.peer_ack_delay_exponent()` — 对端 ACK 延迟参数

返回对端配置的 ACK 延迟参数，用于计算超时。

---

## HTTP/3 API

### `h3::Connection::new()` —— 创建 HTTP/3 连接

```rust
pub fn new() -> Self
```

在 QUIC 握手完成后，创建 HTTP/3 连接对象。

---

### `h3::Connection::poll()` —— 处理 HTTP/3 事件

```rust
pub fn poll(
    &mut self,
    conn: &mut quiche::Connection,
) -> Result<Event, Error>
```

**什么时候用：** QUIC 连接告诉你有数据可读了，你 poll HTTP/3 得到 HTTP 事件。

**返回事件类型：**
- `Event::Headers` —— 收到完整 HTTP 头
- `Event::Data` —— 收到 HTTP body 数据
- `Event::Finished` —— 整个请求/响应完成
- `Event::Reset` —— 流被重置

---

### `h3::Connection::send_headers()` —— 发送 HTTP 头

```rust
pub fn send_headers(
    &mut self,
    stream_id: StreamId,
    headers: &[Header],
    conn: &mut quiche::Connection,
) -> Result<(), Error>
```

编码 HTTP 头，写到流里发送出去。

---

### `h3::Connection::send_data()` —— 发送 HTTP body

```rust
pub fn send_data(
    &mut self,
    stream_id: StreamId,
    data: &[u8],
    conn: &mut quiche::Connection,
) -> Result<usize, Error>
```

发送 HTTP body 数据。

---

## C API 对应（给 C/C++ 集成用）

quiche 也提供了 C 绑定，所有上面 API 都有对应 C 版本：

| Rust API | C API |
|----------|-------|
| `quiche::connect` | `quiche_connect()` |
| `quiche::accept` | `quiche_accept()` |
| `connection.recv` | `quiche_conn_recv()` |
| `connection.send` | `quiche_conn_send()` |
| `connection.stream_write` | `quiche_conn_stream_write()` |
| `connection.stream_read` | `quiche_conn_stream_read()` |
| `connection.on_timeout` | `quiche_conn_on_timeout()` |
| `connection.next_timeout` | `quiche_conn_next_timeout()` |
| `connection.close` | `quiche_conn_close()` |

头文件在 `bindings/quiche.h`，很容易看懂。

## API 设计特点

1. **无隐藏全局状态** —— 所有状态都在 Connection 对象里，你创建多个连接互不干扰
2. **不碰 IO** —— 所有输入输出都靠调用者给缓冲区，quiche 不 open socket
3. **不碰定时器** —— 你告诉它当前时间，它告诉你什么时候需要再唤醒
4. **返回值清晰** —— 错误码都是明确的 `Error::XXX`，你知道哪里错了
5. **零拷贝友好** —— 直接读写你提供的缓冲区，不用 quiche 分配

## 典型调用顺序（客户端）

```c
// 1. 创建配置
quiche_config *config = quiche_config_new(QUICHHE_VERSION_DRAFT);
quiche_config_set_application_protos(config, "h3");

// 2. 创建连接
uint8_t scid[QUICHE_MAX_CONN_ID_LEN];
generate_random(scid, 16);
quiche_conn *conn = quiche_connect("example.com", scid, 16, config);

// 事件循环
while (!done) {
    // 下一次超时是什么时候
    if (quiche_conn_next_timeout(conn) != 0) {
        // 设置你的定时器
    }

    // 如果有包来了，收了喂给 quiche
    n = recvfrom(sock, buf, sizeof(buf), ...);
    if (n > 0) {
        quiche_conn_recv(conn, buf, n, now());
    }

    // 看看哪些流有数据可读
    for (每个可读流) {
        len = quiche_conn_stream_read(conn, stream_id, buf, sizeof(buf), &fin);
        // 处理数据...
    }

    // 我们有数据要发，写进流
    if (有数据要发) {
        stream_id = quiche_conn_stream_open(conn, true, true);
        quiche_conn_stream_write(conn, stream_id, data, len, fin);
    }

    // 打包出要发送的包
    while ((n = quiche_conn_send(conn, out_buf, sizeof(out_buf), now())) > 0) {
        sendto(sock, out_buf, n, ...);
    }

    // 超时处理
    if (超时触发) {
        quiche_conn_on_timeout(conn, now());
    }

    if (quiche_conn_is_closed(conn)) {
        done = true;
    }
}

// 清理
quiche_conn_free(conn);
quiche_config_free(config);
```

就是这么简单！整个 API 不到 30 个函数，很容易记住。

---

## 目录

- [项目概览](./01-overview.md)
- [功能模块划分](./02-modules.md)
- [核心数据结构](./03-data-structures.md)
- [连接状态机](./04-connection-statemachine.md)
- [HTTP/3 流处理](./05-stream-processing.md)
- [流量控制](./06-flow-control.md)
- [拥塞控制](./07-congestion-control.md)
- [TLS 1.3 处理](./08-tls-processing.md)
- [功能串联流程](./09-integration-flow.md)
- **公共 API 速查** ← 你在这里
