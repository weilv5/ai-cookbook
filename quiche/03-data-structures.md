# quiche 核心数据结构

这一章梳理 quiche 中最重要的几个数据结构，理解了这些结构，就能理解代码组织。

## 顶级结构: `Connection`

这是整个 QUIC 连接的根对象，所有东西都挂在这里：

```rust
pub struct Connection {
    // 连接 ID: 本端和对端
    scid: ConnectionId,
    dcid: ConnectionId,

    // 状态机
    state: State,

    // 版本协商
    version: Version,

    // 各个流的集合: 按 stream ID 索引
    send_streams: StreamMap<Stream>,
    recv_streams: StreamMap<Stream>,

    // 发送队列
    sent_packets: SentPackets,  // 已发送还未确认的包
    retx_queue: RetxQueue,      // 需要重传的包

    // 恢复相关
    recovery: Recovery,

    // 流量控制
    flow_ctrl: FlowControl,

    // TLS 握手
    tls: Box<dyn Tls>,
    crypto: CryptoLevel,

    // 对端 CID 旋转
    connection_ids: ConnectionIds,

    // 路径验证
    path: PathState,

    // 统计信息
    stats: Stats,
}
```

**一句话理解**: 整个连接所有状态都在这一个结构体里，没有全局变量，设计很清晰。

---

## 流结构: `Stream`

每个 QUIC 流对应一个 `Stream` 对象：

```rust
pub struct Stream {
    stream_id: StreamId,

    // 发送方向
    send: Option<SendStream>,
    // 接收方向
    recv: Option<RecvStream>,

    // 状态标志
    is_readable: bool,
    is_writable: bool,
    is_fin_sent: bool,
    is_fin_recvd: bool,
    is_closed: bool,
}

pub struct SendStream {
    // 应用写入的数据还没被打包发送
    buf: Buffer<[u8]>,
    // 已经发送还没被确认的字节范围
    pending: Range<u64>,
    // 被对端确认的偏移量
    acked: u64,
    // 对端流量控制窗口
    max_data: u64,
    // 标记是否要发 FIN
    fin: bool,
    // 被阻塞原因
    blocked: bool,
}

pub struct RecvStream {
    // 收到还没被应用读走的数据
    buf: Buffer<[u8]>,
    // 下一个期望收到的偏移量
    next_offset: u64;
    // 最大可以接收的偏移量（流量控制）
    max_data: u64,
    // 已经被对端关闭
    fin: bool,
    // 是否有新数据可读
    stopped: bool,
}
```

**关键点：**
- 一个 `Stream` 可以同时包含发送和接收（双向流）
- 应用写入数据到 `send.buf` → quiche 打包发送 → 确认后前移 `acked` 指针
- 收到数据放到 `recv.buf` → 应用读取后清空缓冲区

---

## 已发送包存储: `SentPacket`

quiche 需要保存所有已发送但还没被确认的包，用于重传：

```rust
pub struct SentPacket {
    // 包编号
    pn: PacketNumber,
    // 发送时间
    time: Instant,
    // 携带的字节数（用于带宽计算）
    sent_bytes: usize,
    // 是否被 acked
    acked: bool,
    // 哪些帧需要重传
    frames: Vec<RetransmittableFrame>,
    // 加密等级
    level: CryptoLevel,
    // in_flight 是否计入拥塞控制
    in_flight: bool,
}

pub enum RetransmittableFrame {
    Stream { stream_id: StreamId, offset: u64, length: usize, fin: bool },
    Crypto { level: CryptoLevel, offset: u64, length: usize },
    // ...
}
```

**为什么要保存帧信息？**
QUIC 重传不是简单重传整个原数据包，因为你可以把多个流的数据重插到一个新数据包里，叫**数据包核能**。所以要保存每个帧的原始信息。

---

## 恢复模块数据结构: `Recovery`

```rust
pub struct Recovery {
    // 拥塞控制算法
    congestion: Box<dyn CongestionController>,

    // 最大确认包编号
    largest_acked_pn: PacketNumber,
    // 最早未确认包编号
    earliest_unacked_pn: PacketNumber,
    // 丢包检测: 哪个 pn 被认为丢失
    lost_packets: Vec<SentPacket>,

    // RTT 测量
    latest_rtt: Duration,
    smoothed_rtt: Duration,
    rttvar: Duration,
    min_rtt: Duration,

    // PTO 计算
    pto_count: u32,
    // 点对点传输的测量
    ...
}
```

---

## 流量控制: `FlowControl`

```rust
pub struct FlowControl {
    // 连接级接收窗口: 我能接收多少总数据
    recv_window: u64,
    recv_acked: u64,
    // 连接级发送窗口: 对端允许我发多少
    send_window: u64,
    send_used: u64,
    // 各个流的接收窗口更新需要发送吗
    need_send_flowctl_update: bool,
}
```

每个 `Stream` 自己维护流级的流量控制窗口。

---

## 拥塞控制接口

```rust
pub trait CongestionController {
    // 包被确认时调用，更新带宽估计
    fn on_ack(&mut self, sent_bytes: usize, rtt: Duration, ...);
    // 包丢失时调用
    fn on_lost(&mut self, lost_bytes: usize, ...);
    // 获取当前可以发送多少字节
    fn window(&self) -> usize;
    // 获取 pacing 速率
    fn pacing_rate(&self) -> u64;
    // ...
}

pub struct BbrCongestionController {
    // BBR 状态: Startup / Drain / ProbeBW / ProbeRTT
    state: BbrState,
    // 带宽测量
    bw_hi: Bandwidth,
    bw_lo: Bandwidth,
    // 最小 RTT
    min_rtt: Duration,
    // BDP
    target_cwnd: usize,
    ...
}
```

**设计亮点**：用 trait 把拥塞控制抽象出来，想换算法就换，不用改核心代码。

---

## HTTP/3 连接结构: `h3::Connection`

```rust
pub struct Connection {
    // 控制流
    control_stream: ControlStream,
    // QPACK 编码器和解码器流
    qpack_encoder: QpackEncoder,
    qpack_decoder: QpackDecoder,
    // 流 -> HTTP 映射
    streams: HashMap<StreamId, StreamInfo>,
    // 等待发送的头区块
    pending_headers: VecDeque<PendingHeaders>,
    // 连接错误
    error: Option<Error>,
}

pub struct StreamInfo {
    pub stream_type: StreamType,
    pub state: StreamState,
    ...
}
```

HTTP/3 把每个 HTTP 请求/响应映射到一个 QUIC 流，在 QUIC 流上面套 HTTP 语义。

---

## QPACK 相关结构

```rust
pub struct Encoder {
    // 静态表只读
    static_table: &'static StaticTable,
    // 动态表可写
    dynamic_table: DynamicTable,
    // 插入计数器
    insert_count: u64,
}

pub struct Decoder {
    // 对应对端的动态表状态
    dynamic_table: DynamicTable,
    // 已知的最大插入数
    known_received_count: u64,
}
```

**关键点理解**：
- 连接两端各自有一个编码器和一个解码器
- 我这边编码器维护我这边的动态表，用来压缩发给你的头
- 我这边解码器维护你那边编码器的动态表状态，用来解压你发给我的头

---

## TLS 抽象接口

```rust
pub trait Tls {
    // 握手输入
    fn provide_data(&mut self, level: CryptoLevel, buf: &[u8]) -> Result<()>;
    // 握手输出
    fn take_data(&mut self, level: CryptoLevel, buf: &mut Vec<u8>) -> Result<usize>;
    // 握手是否完成
    fn is_handshaken(&self) -> bool;
    // 导出密钥
    fn export_keying_material(&self, ...) -> Result<()>;
    // 获取 early secret 用于0-RTT
    fn get_early_secrets(&mut self, ...) -> Result<()>;
    ...
}
```

quiche 不自己做 TLS，把 TLS 抽象成接口，默认实现用 BoringSSL。

---

## 内存管理特点

1. **大部分结构在连接创建时预分配，或者用 Vec 动态增长**
2. **发送缓冲区和接收缓冲区用 `slice::Buffer` 实现**，这是一个类似环形缓冲区的设计，支持偏移量自动前移
3. **没有复杂的共享所有权**，因为整个连接都是单线程处理，不需要 Mutex（线程安全由调用者保证）

## 结构关系总图

```mermaid
classDiagram
    Connection "1" --> "*" Stream
    Connection "1" --> "1" Recovery
    Recovery "1" --> "1" CongestionController
    Connection "1" --> "1" FlowControl
    Connection "1" --> "1" Tls
    Connection "1" --> "*" SentPacket
    Stream "1" --> "0..1" SendStream
    Stream "1" --> "0..1" RecvStream
    h3::Connection "1" --> "1" QpackEncoder
    h3::Connection "1" --> "1" QpackDecoder
    h3::Connection "1" --> "*" StreamInfo
```

---

上一章：[功能模块划分](./02-modules.md)
下一章：[连接状态机](./04-connection-statemachine.md)
