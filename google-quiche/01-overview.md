# Google QUICHE 项目概览

QUICHE = **QUIC + HTTP/3 + Envoy**，是 Google 从 Chromium 中抽出来的独立 QUIC + HTTP/3 协议实现，现在用于 Chromium、Envoy、Android 等项目。

## 项目信息

- **官方地址**: https://github.com/google/quiche
- **编程语言**: C++
- **出处**: 从 Chromium 代码库抽离出来，保持和 Chromium 主分支同步更新
- **主要维护者**: Google
- **支持标准**:
  - QUIC: 最新 IETF RFC 9000 系列
  - HTTP/3: RFC 9114
  - QPACK: RFC 9204
- **主要使用者**: Chromium 浏览器、Envoy 代理、Android 系统

## 设计目标

Google QUICHE 的设计目标：

1. **符合标准** → 严格实现 IETF QUIC 规范，和 Chromium 同步更新，保证互操作性
2. **高性能** → 服务器和客户端都能跑，支撑 Google 大规模流量
3. **可集成** → 可以独立编译，方便集成到其他项目（比如 Envoy）
4. **可测试** → 有完整单元测试、集成测试、fuzz 测试

## 整体架构分层

```mermaid
flowchart TD
    A[集成方: Envoy / Chromium / ...] -->|调用| B[QUICHE]

    subgraph QUICHE
        C[HTTP/3 层] --> D[QPACK]
        C --> E[QUIC 传输层]
        E --> F[拥塞控制 / 丢包恢复]
        E --> G[TLS 握手 (BoringSSL)]
        E --> H[会话缓存 / 连接迁移]
    end

    B --> I[网络 IO 由集成方实现]
```

## 目录结构

```
quiche/
├── quic/
│   ├── core/          # QUIC 核心数据结构和连接状态
│   ├── congestion/    # 拥塞控制算法实现
│   ├── crypto/        # TLS 加密集成
│   ├── frames/        # 各种帧编解码
│   ├── http/          # HTTP/3 实现
│   ├── session/       # 会话管理
│   ├── stream/        # 流处理
│   └── tools/         # 测试工具
├── common/            # 公共工具代码
├── api/               # 对外 API 抽象接口
└── platform/          # 平台抽象，方便移植
```

## Google QUICHE vs Cloudflare quiche

| 特性 | Google QUICHE | Cloudflare quiche |
|------|---------------|-------------------|
| 语言 | C++ | Rust |
| 出处 | 来自 Chromium，久经大规模流量考验 | 从头写的独立实现 |
| 主要用户 | Chromium, Envoy | Nginx-quic, 其他集成项目 |
| 完整度 | 非常完整，所有QUIC特性都支持 | 完整，积极维护中 |
| 集成难度 | 需要适配平台抽象层 | C API 很容易集成 |

## 核心设计特点

### 1. 事件驱动，基于回调

QUICHE 本身不做 IO，通过回调接口 `Delegate` 让集成方处理网络读写和定时器。和 Cloudflare quiche 的"调用者驱动"思想一致。

### 2. 平台抽象层

所有和操作系统相关的调用都抽成 `Platform` 接口，方便移植到不同操作系统。

### 3. 内存优化

针对高性能服务器场景做了很多内存优化：
- 对象池复用
- 预分配缓冲区
- 减少堆分配

### 4. 完备的拥塞控制实现

支持多种拥塞控制算法：BBRv1, BBRv2, Cubic, Reno 都有。

---

下一章：[功能模块划分](./02-modules.md)
