# 网络抓包分析入门指南

> 从零开始理解网络抓包,手把手教你用 Wireshark 分析流量

## 📖 目录

- [什么是网络抓包?](#什么是网络抓包)
- [为什么需要抓包?](#为什么需要抓包)
- [Wireshark 简介](#wireshark-简介)
- [软件安装](#软件安装)
- [三步理解 TCP 三次握手与四次挥手](#三步理解-tcp-三次握手与四次挥手)
- [Wireshark 界面详解](#wireshark-界面详解)
- [过滤器使用技巧](#过滤器使用技巧)
- [常见协议分析](#常见协议分析)
- [实战案例](#实战案例)
- [常见问题](#常见问题)
- [深入理解 TCP 数据传输](#深入理解-tcp-数据传输)
- [数据包重传机制](#数据包重传机制)
- [数据分片与重组](#数据分片与重组)
- [UDP 协议详解](#udp-协议详解)
- [QUIC 协议详解](#quic-协议详解)
- [QUIC 小报文分析](#quic-小报文分析)

---

## 什么是网络抓包?

**抓包**(Packet Capture)就是"偷看"网络传输的数据。

想象一下:你在网上购物,快递员需要经过很多中转站才能把货送到你手里。**抓包**就是在这些中转站偷偷查看每个快递里装的是什么。

计算网络同理,数据在传输过程中会经过很多"站点"(路由器、服务器等),抓包就是在这些地方截获并查看数据内容。

```
你的电脑 <---> 路由器 <---> 服务器
              ↑
         抓包位置(可以在这里看到所有经过的数据)
```

### 形象的比喻

| 场景 | 现实例子 | 网络对应 |
|------|---------|---------|
| 快递检查 | 拆开包裹看里面是什么 | 解码数据包看内容 |
| 快递单 | 包含发送人、收货人、物品信息 | 包含源IP、目标IP、端口、协议 |
| 包跟踪 | 查快递从哪来到哪去 | 追踪请求的完整路径 |

---

## 为什么需要抓包?

抓包是网络工程师和开发者的"透视镜":

### 🔍 排查网络问题
- 网页打不开?抓包看请求卡在哪一步
- API 调用失败?看看返回了什么错误
- 加载速度慢?分析哪个请求耗时长

### 🛡️ 安全分析
- 检测是否有恶意软件偷偷向外发数据
- 查看是否有敏感信息被明文传输
- 分析网络攻击的原理

### 🔬 协议学习
- 直观理解 HTTP/TCP/DNS 等协议的工作流程
- 验证你对协议的理解是否正确

---

## Wireshark 简介

**Wireshark** 是最流行的开源网络协议分析器,有"网络界 X光机"之称。

### Wireshark 的特点

| 优点 | 说明 |
|------|------|
| ✅ 免费开源 | 完全免费,支持 Windows/Mac/Linux |
| ✅ 功能强大 | 支持 1000+ 协议分析 |
| ✅ 实时抓包 | 可以实时监控网络流量 |
| ✅ 过滤器丰富 | 精准定位你需要的数据 |
| ✅ 社区活跃 | 丰富的教程和插件支持 |

### Wireshark vs 其他工具

| 工具 | 适用场景 | 难度 |
|------|---------|------|
| **Wireshark** | 深度协议分析 | 中等 |
| Charles | HTTP/HTTPS 抓包 | 简单 |
| tcpdump | Linux 命令行抓包 | 较难 |
| Chrome DevTools | 前端调试 | 简单 |

---

## 软件安装

### macOS 安装

```bash
# 方法一:官网下载
# 访问 https://www.wireshark.org/download.html

# 方法二:Homebrew 安装(推荐)
brew install wireshark
brew install --cask wireshark
```

> ⚠️ **注意**:Wireshark 需要管理员权限才能抓包。macOS 上安装后需要额外配置。

### Windows 安装

1. 访问 [Wireshark 官网](https://www.wireshark.org/download.html)
2. 下载 Windows 安装包 (.exe)
3. 运行安装,一路 Next 即可
4. 安装时选择安装 WinPCAP/Npcap(抓包必需)

### 快速验证

安装完成后,打开 Wireshark,你应该能看到类似这样的界面:

```
┌─────────────────────────────────────────────────────────┐
│  Wireshark - 网络抓包分析工具                              │
├─────────────────────────────────────────────────────────┤
│  [开始抓包按钮]                                           │
│                                                          │
│  接口列表:                                               │
│    ├─ Wi-Fi (正在监控)                                   │
│    ├─ 蓝牙适配器                                          │
│    └─ Loopback (本地回环)                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 三步理解 TCP 三次握手与四次挥手

这是面试必问、网络问题排查必备的知识点!

### 三次握手(建立连接)

想象成打电话:

```
A(客户端):喂,你在吗?          [SYN]
     ↓
B(服务器):我在!你在吗?         [SYN-ACK]
     ↓
A(客户端):我在!开始聊吧!       [ACK]
     ↓
✅ 连接建立成功,开始传输数据
```

| 步骤 | Wireshark 显示 | 含义 |
|------|---------------|------|
| 1 | `SYN` | 客户端:请求建立连接 |
| 2 | `SYN-ACK` | 服务器:我准备好了,确认 |
| 3 | `ACK` | 客户端:好的,开始吧 |

在 Wireshark 中看三次握手:

```
No.  Time        Source          Destination   Protocol  Info
1    0.000000    192.168.1.100   192.168.1.1   TCP       80 → 54321 [SYN] ...
2    0.001000    192.168.1.1     192.168.1.100  TCP       54321 → 80 [SYN, ACK] ...
3    0.001500    192.168.1.100   192.168.1.1   TCP       80 → 54321 [ACK] ...
```

### 四次挥手(断开连接)

想象成挂电话:

```
A:我话说完了,准备挂断          [FIN]
   ↓
B:好的,我知道了!              [ACK]
   ↓(等一等,我还有话要说)
B:我也没了,挂了吧              [FIN]
   ↓
A:好的,再见!                  [ACK]
   ↓
✅ 连接断开
```

| 步骤 | Wireshark 显示 | 含义 |
|------|---------------|------|
| 1 | `FIN` | 一方:我要关闭连接了 |
| 2 | `ACK` | 另一方:收到,我知道了 |
| 3 | `FIN` | 另一方:我也准备好了 |
| 4 | `ACK` | 原发送方:好的,再见 |

---

## Wireshark 界面详解

Wireshark 有三个核心窗口,理解它们就掌握了 80% 的用法:

```
┌─────────────────────────────────────────────────────────────────┐
│  过滤器栏 (Display Filter)                                        │
│  输入: http.request.method == "GET"                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  【窗口1:数据包列表】                                             │
│  ──────────────────────────────────────────────────────────────  │
│  No.   Time     Source        Destination   Protocol  Length    │
│  1     0.000    192.168.1.100 104.xx.xx.xx  TLSv1.2   1234       │
│  2     0.001    104.xx.xx.xx  192.168.1.100 TLSv1.2   2345       │
│  3     0.002    192.168.1.100 192.168.1.1   DNS       89         │
│  ...                                                             │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  【窗口2:数据包详情】 (选中数据包后显示)                            │
│  ──────────────────────────────────────────────────────────────  │
│  Frame 54: 1234 bytes on wire                                    │
│  └─ Ethernet II, Src: Apple_xx:xx:xx                           │
│     └─ Internet Protocol Version 4                              │
│        └─ Transmission Control Protocol                        │
│           └─ [握手/挥手分析]                                      │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  【窗口3:数据包字节】 (原始数据)                                   │
│  ──────────────────────────────────────────────────────────────  │
│  0000  48 54 54 50 2f 31 2e 31 20 34 30 34 20 4e 6f 74 20  HTTP/1.1 404 Not
│  0010  46 6f 75 6e 64 0d 0a                                 Found..           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 窗口1:数据包列表(Packet List)

显示所有捕获的数据包概览:

| 列名 | 说明 |
|------|------|
| **No.** | 数据包序号 |
| **Time** | 抓包时间(秒) |
| **Source** | 源地址(发送方) |
| **Destination** | 目标地址(接收方) |
| **Protocol** | 协议类型(TCP/UDP/HTTP/DNS等) |
| **Length** | 包长度 |
| **Info** | 简要信息 |

### 窗口2:数据包详情(Packet Details)

点击某个数据包后,这里显示详细信息,按层级展开:

```
Frame 54                                                  # 第54个数据包
├─ Ethernet II           # 二层:MAC地址
├─ Internet Protocol v4  # 三层:IP协议
│  ├─ Source: 192.168.1.100
│  └─ Destination: 104.21.56.78
├─ Transmission Control Protocol  # 四层:TCP协议
│  ├─ Src Port: 54321
│  └─ Dst Port: 443
└─ Secure Sockets Layer  # 五层:TLS加密
   └─ Application Data
```

### 窗口3:数据包字节(Packet Bytes)

原始十六进制数据,选中详情中的某一项,对应的字节会高亮。

---

## 过滤器使用技巧

过滤器是 Wireshark 的精髓!掌握过滤,事半功倍。

### 两类过滤器

| 类型 | 作用 | 示例 |
|------|------|------|
| **Capture Filter(抓包过滤器)** | 决定抓哪些包,不抓哪些 | `port 80` 只抓 80 端口 |
| **Display Filter(显示过滤器)** | 在已抓的包中筛选显示 | `http.request` 只看 HTTP 请求 |

### 常见显示过滤器

#### 按协议过滤
```
http              # 只看 HTTP 协议的包
dns               # 只看 DNS 查询
tcp               # 只看 TCP 包
udp               # 只看 UDP 包
```

#### 按地址过滤
```
ip.addr == 192.168.1.100        # 跟这个 IP 有关的包
ip.src == 192.168.1.100         # 这个 IP 发送的包
ip.dst == 104.21.56.78          # 发往这个 IP 的包
```

#### 按端口过滤
```
tcp.port == 443      # 443 端口的 TCP 流量
udp.port == 53      # 53 端口的 UDP 流量(DNS)
http.port == 8080    # HTTP 8080 端口
```

#### 按内容过滤
```
http.request.method == "GET"     # GET 请求
http.request.method == "POST"    # POST 请求
http.host == "api.example.com"   # 指定域名的请求
tcp.flags.syn == 1               # SYN 包(握手请求)
tcp.flags.fin == 1               # FIN 包(挥手请求)
```

#### 组合过滤
```
# 使用 and / or 连接多个条件
ip.addr == 192.168.1.100 and http    # 该 IP 的 HTTP 包
tcp.port == 80 or tcp.port == 443     # 80 或 443 端口
not dns                              # 排除 DNS 包
```

### 过滤器小技巧

1. **自动补全**:输入时 Wireshark 会提示正确的语法
2. **颜色标记**:不同协议默认有不同颜色(绿色HTTP、浅蓝TCP、黑色错误等)
3. **保存过滤器**:可以在过滤器栏点击保存,方便下次使用

---

## 常见协议分析

### HTTP 协议

#### 请求结构
```
GET /api/user HTTP/1.1                    # 请求行
Host: api.example.com                    # 请求头
User-Agent: Mozilla/5.0
Content-Type: application/json

{"name": "张三"}                          # 请求体(POST才有)
```

#### 响应结构
```
HTTP/1.1 200 OK                           # 状态行
Content-Type: application/json
Content-Length: 123

{"code": 0, "data": {...}}                # 响应体
```

#### Wireshark 中的 HTTP 信息
```
Hypertext Transfer Protocol
    GET /api/user HTTP/1.1\r\n
    Host: api.example.com\r\n
    User-Agent: Mozilla/5.0\r\n
    Accept: application/json\r\n
```

### DNS 协议(域名解析)

DNS 负责把域名解析成 IP 地址。

```
你输入: www.example.com
DNS 回答: 解析成 93.184.216.34
```

#### Wireshark 中的 DNS 查询
```
Domain Name System (query)
    Transaction ID: 0x1234
    Questions: 1
    Answer RRs: 0
    www.example.com
        Type: A (Host Address)
        Class: IN
```

### TLS/HTTPS 加密

HTTPS = HTTP + TLS,现在的网站大多数都用这个。

```
http                    # 抓不到内容(已加密)
tls                     # 可以看到 TLS 握手信息
```

#### TLS 握手过程
```
1. Client Hello    →  客户端:我支持这些加密算法
2. Server Hello   ←  服务器:我选这个算法
3. Certificate    ←  服务器:这是我的证书
4. Key Exchange   ←  服务器:这是我公钥
5. (加密传输)       双方:用密钥加密通信
```

---

## 实战案例

### 案例1:分析一次网页访问

**目标**:查看访问 `www.example.com` 的全过程

**步骤**:
1. 在过滤器输入 `http.host contains example`
2. 访问网站
3. 分析数据包

**你会看到**:
```
DNS 查询       →  查询 www.example.com 的 IP
TCP 三次握手   →  建立连接
HTTP 请求      →  GET /index.html
HTTP 响应      →  200 OK,HTML 内容
资源请求       →  CSS、JS、图片
TCP 四次挥手   →  断开连接
```

### 案例2:分析接口调用失败

**场景**:前端调用 API 报 500 错误

**步骤**:
1. 过滤器输入 `http.response.status_code == 500`
2. 找到请求,查看详情
3. 在响应体中找到错误信息

**你会看到**:
```
HTTP/1.1 500 Internal Server Error
{"error": "数据库连接失败"}
```

### 案例3:排查网站加载慢

**目标**:找出哪个请求最慢

**步骤**:
1. 过滤器输入 `http`
2. 查看 Time 列
3. 时间最长的就是瓶颈

---

## 常见问题

### Q1: 抓不到包怎么办?

**检查清单**:
- [ ] 是否以管理员/root 身份运行 Wireshark?
- [ ] 是否选择了正确的网卡(Wi-Fi/以太网)?
- [ ] 抓包过滤器是否排除了目标流量?
- [ ] 防火墙是否阻止了抓包工具?

### Q2: HTTPS 内容为什么看不到?

HTTPS 是加密的,Wireshark 本身看不到内容。

**解决方案**:
1. 在浏览器安装 WebTrust 根证书
2. 使用 Chrome DevTools 的 Network 面板
3. 配置浏览器导出 SSL Keys,供 Wireshark 解密

### Q3: 抓包文件太大怎么办?

**技巧**:
- 使用抓包过滤器限制范围:`port 80`
- 设置包大小限制:`snaplen 100`
- 使用环形缓冲区:`ring buffer files: 10`
- 及时停止抓包,不需要时立刻停止

### Q4: 如何分析手机 App 的流量?

**方法**:
1. 手机和电脑连接同一 Wi-Fi
2. 在路由器设置端口镜像(Port Mirroring)
3. 或者使用 Charles/Fiddler 作为代理

---

## 下一步学习

- 📚 [Wireshark 官方文档](https://docs.wireshark.org/)
- 🎥 [Wireshark 视频教程 - Bilibili](https://www.bilibili.com/video/BV18a411Y7Xm/)
- 🔧 学会使用 `tcpdump` 命令行抓包
- 📊 学习 IO 图表和流量统计功能

---

## 总结

| 知识点 | 关键点 |
|--------|--------|
| **抓包原理** | 通过网络接口复制数据 |
| **三次握手** | SYN → SYN-ACK → ACK |
| **四次挥手** | FIN → ACK → FIN → ACK |
| **三个窗口** | 列表、详情、字节 |
| **过滤器** | 按协议/地址/端口/内容筛选 |

> 💡 **记住**：抓包是解决问题的手段，不是目的。拿到数据后，要懂得分析才是关键！

---

## 深入理解 TCP 数据传输

三次握手只是建立了连接，真正的数据传输才刚开始。

### TCP 数据传输的全貌

```
建立连接 (三次握手)
      ↓
发送数据 (中间N个数据包)
      ↓
      ├─ 数据包 1: Seq=1, Len=1000, ACK=1
      ├─ 数据包 2: Seq=1001, Len=1000, ACK=1
      ├─ 数据包 3: Seq=2001, Len=1000, ACK=1
      └─ ...
      ↓
确认回复 (ACK)
      ↓
断开连接 (四次挥手)
```

### Seq（序列号）和 ACK（确认号）

这是 TCP 最核心的两个概念：

| 字段 | 含义 | 说明 |
|------|------|------|
| **Seq** | Sequence Number（序列号） | 我这份数据从哪个字节开始 |
| **ACK** | Acknowledgment Number（确认号） | 我已经收到了哪些字节，下一个期望收到什么 |
| **Len** | Length（数据长度） | 这条消息有多少字节 |

### 形象的例子

想象寄信：

```
你寄第1封信 (100页)  → 信上写"第1-100页"
对方回: "收到第100页了，请发第101页开始的内容"  → ACK = 101

你寄第2封信 (100页)  → 信上写"第101-200页"
对方回: "收到第200页了，请发第201页开始的内容"  → ACK = 201

...以此类推
```

### Wireshark 中的数据传输

```
No.  Time     Source         Destination  Protocol  Length  Info
10   0.010    192.168.1.100 104.21.56.78  TCP       1450   80 → 54321 [ACK] Seq=1 Ack=1 Win=502
11   0.011    104.21.56.78  192.168.1.100 HTTP      1024   GET /api/data HTTP/1.1
12   0.012    192.168.1.100 104.21.56.78  TCP       54     54321 → 80 [ACK] Seq=1 Ack=1025
13   0.013    104.21.56.78  192.168.1.100 TCP       1450   [ACK] Seq=1025 Ack=1 Win=500
14   0.014    104.21.56.78  192.168.1.100 TCP       1450   [PSH, ACK] Seq=2473 Ack=1
15   0.015    192.168.1.100 104.21.56.78  TCP       54     54321 → 80 [ACK] Seq=1 Ack=3923
```

### 理解 Wireshark 中的 Seq 和 Ack

在 Wireshark 中，默认会显示**相对序列号**（从0开始），而不是真实的字节偏移。

| 列名 | 说明 |
|------|------|
| `Seq` | 相对序列号（方便阅读） |
| `Next Seq` | 下一个期望的序列号 (= Seq + Len) |
| `Ack` | 已确认收到的字节 |

#### 看一个实际例子

```
数据包 1: Seq=0, Len=1000    → 我发送第0-999字节，共1000字节
数据包 2: Seq=1000, Len=1000 → 我发送第1000-1999字节
数据包 3: Seq=2000, Len=1000 → 我发送第2000-2999字节

收到 ACK: Ack=3000          → 对端确认收到了3000字节
                     (意味着 0-2999 都已收到)
```

### TCP Flags 详解

TCP 包有不同的"旗标"，代表不同的含义：

| Flag | 全称 | 含义 |
|------|------|------|
| **SYN** | Synchronize | 请求建立连接 |
| **ACK** | Acknowledgment | 确认收到数据 |
| **FIN** | Finish | 请求关闭连接 |
| **RST** | Reset | 强制重置连接 |
| **PSH** | Push | 推送数据，催促应用层尽快读取 |
| **URG** | Urgent | 紧急数据（很少用） |

#### 常见组合

- `[SYN]` - 握手请求
- `[SYN, ACK]` - 握手响应
- `[ACK]` - 纯确认
- `[PSH, ACK]` - 推送数据+确认（HTTP响应常用）
- `[FIN, ACK]` - 挥手请求+确认
- `[RST, ACK]` - 重置连接（出错了）

### 滑动窗口（Flow Control）

滑动窗口是 TCP 的"流量控制"机制，防止发送方太快、接收方跟不上。

```
滑动窗口示意：

已发送并确认   |   已发送未确认   |   允许发送   |   不允许发送
(0-999)       |   (1000-1999)   |  (2000-2999)|   (3000+)
              ↑                ↑
           ACK=1000        窗口大小=1000
```

**窗口大小**告诉对方："你还可以发这么多数据给我，别超了。"

在 Wireshark 中看窗口：

```
TCP Segment Len: 1448
    Seq: 1    Next Seq: 1449
    [TCP Payload: 1448 bytes]
    Flags: [ACK]
    Window size: 65535  ← 对方还能收这么多字节
```

---

## 数据包重传机制

网络不稳定时，包会丢失。TCP 必须处理这个问题。

### 为什么会重传？

```
发送方 → [数据包] → [网络] → [接收方]
                    ↑
              这里丢了！
```

常见原因：
- 网络拥塞，路由器丢弃了包
- 接收方缓冲区满，通知窗口为0
- 中间链路不稳定

### 超时重传（RTO Retransmission Timeout）

最基本的方式：等太久没收到 ACK，就重发。

```
发包 1      →  发送
等...       →  没收到 ACK
等...       →  还没收到
等...       →  超时了！重发！
发包 1 (重传) → 重发
    ↓
收到 ACK   →  终于确认了
```

#### 如何判断是重传包？

Wireshark 会自动标记重传包：

```
过滤器: tcp.analysis.retransmission

No.  Time     Info
10   0.100    192.168.1.100 → 104.xx.xx.xx  TCP 80 → 54321 [SYN]
11   0.200    192.168.1.100 → 104.xx.xx.xx  TCP 80 → 54321 [SYN]  🔴 [TCP Retransmission]
```

### 快速重传（Fast Retransmit）

更聪明的方式：收到3个重复 ACK，就立刻重传，不用等超时。

```
发包 1, 2, 3, 4, 5
        ↑
      包3丢了
        ↓
收到 ACK 2 (重复)  → "我还等着包3"
收到 ACK 2 (重复)  → "我真的还等着包3"
收到 ACK 2 (重复)  → "包3呢？？快重传！"
        ↓
立刻重传包 3
```

#### Wireshark 中的快速重传

```
过滤器: tcp.analysis.fast_retransmission

No.  Time     Info
15   0.050    [TCP Dup ACK] 104.xx.xx.xx → 192.xx.xx.xx  54321→80  ACK=1000
16   0.055    [TCP Dup ACK] 104.xx.xx.xx → 192.xx.xx.xx  54321→80  ACK=1000
17   0.060    [TCP Dup ACK] 104.xx.xx.xx → 192.xx.xx.xx  54321→80  ACK=1000
18   0.062    🔴 [TCP Fast Retransmit] 192.xx.xx.xx → 104.xx.xx.xx  TCP 80→54321
```

### Wireshark 重传相关过滤器汇总

| 过滤器 | 说明 |
|--------|------|
| `tcp.analysis.retransmission` | 超时重传的包 |
| `tcp.analysis.fast_retransmission` | 快速重传的包 |
| `tcp.analysis.spurious_retransmission` | 虚假重传（对方其实收到了） |
| `tcp.analysis.duplicate_ack` | 重复 ACK |
| `tcp.analysis.lost_segment` | 丢失的包 |

### 重传问题的常见原因

| 原因 | 表现 | 解决方案 |
|------|------|----------|
| 网络慢 | 重传多，延迟高 | 优化网络、选优质线路 |
| 服务器忙 | 响应慢，ACK 延迟 | 服务端扩容、增加资源 |
| MTU 不匹配 | 分片丢失导致重传 | 调整 MTU，设置合理的 MSS |
| 丢包率高 | 大量重传 | 检查网络质量，排除攻击 |

---

## 数据分片与重组

### IP 分片（Fragmentation）

**问题**：一个大的数据包超过了网络的 MTU（最大传输单元），怎么办？

**答案**：分片！把大包拆成多个小包。

#### MTU 是什么？

MTU = Maximum Transmission Unit，单次传输的最大单元。

| 网络类型 | MTU 大小 |
|----------|----------|
| 以太网 | 1500 字节 |
| PPPoE | 1492 字节 |
| 局域网 (Wi-Fi) | 1500 字节 |
| Loopback | 65535 字节 |

#### 分片示例

假设要发送 4000 字节的数据，但 MTU 是 1500：

```
原始数据: [Header][        4000 字节数据          ]

分片 1: [IP Header: Offset=0, MF=1][1500 字节数据]
分片 2: [IP Header: Offset=1480, MF=1][1500 字节数据]
分片 3: [IP Header: Offset=2960, MF=0][1000 字节数据]
         ↑                             ↑
      偏移量                      MF=0 表示最后一个分片
```

#### IP Header 中的分片字段

```
Identification: 0x1234      # 分片标识，同一个包的多个分片 ID 相同
Flags: 0x01                 # 0x01=MF(更多分片)，0x00=最后一个分片
Fragment Offset: 0          # 偏移量，单位 8 字节
```

### Wireshark 中看 IP 分片

```
过滤器: ip.flags MF == 1    # 查看所有分片包
过滤器: ip.flags MF == 0    # 查看最后一个分片
过滤器: ip.fragment        # 查看所有分片
```

**分片示例**：

```
No.  Time     Source         Destination  Protocol  Length  Info
1    0.000    192.168.1.100 93.184.216.34 IP       1514   93.184.216.34 → 192.168.1.100  🔴 Fragmented IP

查看详情：
Internet Protocol Version 4
    Identification: 0x1234 (4660)
    Flags: 0x01 (More Fragments)
        0... .... = Reserved bit: Not set
        .1.. .... = More fragments: Set  ← 还有更多分片
        ..0. .... = Don't fragment: Not set
    Fragment Offset: 0                    ← 从 0 开始
    Time to Live: 64

Data (1480 bytes)                         ← 只带 1480 字节（去掉IP头）
```

### 为什么要重组？

如果只抓到一个分片，数据是不完整的：

```
分片 1: [IP][数据 0-1479]
分片 2: [IP][数据 1480-2959]
分片 3: [IP][数据 2960-3999]

只拿到分片 1 和 3 → 无法还原完整数据
必须集齐所有分片 → 才能重组
```

### TCP 的分片 vs IP 的分片

很多人搞混，记住：

| 层次 | 分片方式 | 谁做 | 说明 |
|------|----------|------|------|
| **TCP** | Segment（段） | 传输层，TCP自己完成 | 根据 MSS 分段，**不丢包，自动重传** |
| **IP** | Fragment（分片） | 网络层，IP协议 | 根据 MTU 分片，**可能丢包，不重传** |

**最佳实践**：

```
MTU = 1500
IP Header = 20 字节
TCP Header = 20 字节
                 ↓
MSS (Max Segment Size) = 1500 - 20 - 20 = 1460 字节

每次 TCP 发送不超过 1460 字节，就不会触发 IP 分片
```

### MTU/MSS 问题排查

#### 常见问题：分片导致连接失败

**场景**：VPN 连接成功但无法传输数据

**原因**：PMTU（路径MTU发现）问题，路径上某个节点MTU更小

**解决**：
1. Wireshark 过滤器 `ip.flags.DF == 0 and ip.fragment.offset > 0` 找分片包
2. 排查是否有大量分片丢失
3. 客户端设置 `TCP MSS Clamping`

---

## 实用分析技巧

### 查看完整 TCP 流

右键某个数据包 → Follow → TCP Stream，可以看完整的请求-响应对话：

```
过滤后的 TCP 流：

Frame 10-15 (HTTP 请求)
═══════════════════════════════════════════
GET /api/data HTTP/1.1
Host: api.example.com
User-Agent: curl/7.68.0
Accept: */*


Frame 16-20 (HTTP 响应)
═══════════════════════════════════════════
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 1234

{"code": 0, "data": [...]}
```

### 时间分析（Time Sequence）

Wireshark → 统计 → TCP 流图形 → 时间序列：

可以看到：
- 横轴 = 时间
- 竖轴 = Seq（传输的数据量）
- **斜率陡** = 传输快
- **水平线** = 停顿（可能在等 ACK 或重传）

### RTT（往返时延）分析

RTT = Round Trip Time，发出去到收到 ACK 的时间。

```
统计数据 → TCP 流图形 → RTT 图表

RTT 突然变大 → 网络拥塞
RTT 稳定低 → 网络状态良好
```

---

*文档版本：v1.1*
*更新时间：2026-04-21*
*更新内容：新增 TCP 数据传输、重传机制、分片重组详解*
*贡献者:AI-Cookbook Team*

---

## UDP 协议详解

UDP（User Datagram Protocol）是"无连接"的传输层协议，特点就一个字：**快**。

### TCP vs UDP 对比

| 特性 | TCP | UDP |
|------|-----|-----|
| **连接方式** | 需先建立连接（三次握手） | 无连接，直接发 |
| **可靠性** | 可靠，不丢包 | 不可靠，可能丢包 |
| **顺序性** | 保证顺序 | 不保证顺序 |
| **速度** | 相对慢 | 快 |
| **流量控制** | 有（滑动窗口） | 无 |
| **拥塞控制** | 有 | 无 |
| **报文边界** | 字节流 | 保留报文边界 |
| **头部大小** | 20-60 字节 | 8 字节 |

### 为什么游戏、视频通话用 UDP？

想象打视频电话：

```
TCP 方式：
发音频包1 → 等确认 → 发音频包2 → 等确认 → 发音频包3 → 等确认...
问题：等 ACK 的时间就是延迟！

UDP 方式：
发音频包1 → 发音频包2 → 发音频包3 → 发音频包4...
不管对方收没收到，一直发
问题：偶尔丢一帧问题不大，但卡在那等确认就真卡死了
```

### UDP 的使用场景

| 场景 | 为什么用 UDP |
|------|---------------|
| **DNS 查询** | 就问一句答一句，丢了重问就行 |
| **视频/直播** | 偶尔花屏比卡住强 |
| **游戏同步** | 宁可偶尔卡一下不能动不动就卡死 |
| **VoIP 电话** | 实时性 > 可靠性 |
| **QUIC** | 现代 HTTP/3 的底层 |

### UDP 头部结构

```
┌──────────┬──────────┬───────────────┐
│  Source   │  Dest    │               │
│   Port    │   Port   │    Length     │
│  (2字节)  │  (2字节)  │    (2字节)    │
├──────────┴──────────┴───────────────┤
│              Checksum (2字节)         │
├──────────────────────────────────────┤
│           Payload (应用数据)          │
└──────────────────────────────────────┘
```

### Wireshark 中的 UDP

```
过滤器: udp

No.  Time     Source          Destination   Protocol  Length  Info
1    0.000    192.168.1.100   8.8.8.8        DNS       59      Standard query A example.com
2    0.015    8.8.8.8         192.168.1.100  DNS       131     Standard query response A 93.184.216.34
```

### UDP 详情解析

```
User Datagram Protocol
    Src Port: 65342                   # 源端口（客户端随机选的）
    Dst Port: 53                       # 目标端口（DNS 服务器）
    Length: 39                         # UDP 头+数据总长度
    Checksum: 0x4d47 [correct]         # 校验和

Domain Name System (query)
    Transaction ID: 0xabcd
    Questions: 1
    www.example.com
        Type: A (Host Address)
        Class: IN
```

### UDP 的"够用就好"哲学

UDP 就干一件事：**把数据从一端送到另一端**，不保证、不确认、不重传。

```
发送方：发发发！
接收方：收到收到收到（或者假装没收到）

如果丢包了？
- 应用自己决定怎么办
- 重传？上层协议决定
- 不管？也是上层决定
```

---

## QUIC 协议详解

QUIC（Quick UDP Internet Connections）是 Google 提的新协议，HTTP/3 的底层。

### 为什么需要 QUIC？

TCP 的问题：

```
建立 HTTP/2 连接：
1. TCP 三次握手        → 1-2 RTT
2. TLS 握手（1-RTT）  → 1-2 RTT
3. HTTP 请求          → 终于可以发数据了！

总耗时：2-3 RTT 才能开始干活！
```

QUIC 的解决：

```
建立 QUIC 连接：
1. 一次握手搞定所有（连接 + TLS + 认证）

总耗时：0-1 RTT 就能发数据！
```

### QUIC 的核心优势

| 优势 | 说明 |
|------|------|
| **0-RTT / 1-RTT 建连** | 比 TCP+TLS 快 1-2 个往返 |
| **连接迁移** | Wi-Fi 切 4G 不掉线（基于 Connection ID） |
| **独立流控** | 多路复用不互相阻塞 |
| **丢包只影响一个流** | HTTP/2 一个包丢影响所有流 |
| **更好的拥塞控制** | 用户空间实现，迭代快 |

### QUIC 握手过程

```
客户端                                          服务端
   │
   │  ──────── Initial (握手开始) ────────────────▶
   │  ├─ Connection ID (客户端生成)
   │  ├─ TLS ClientHello
   │
   │◀─────── Initial (服务端响应) ────────────────│
   │  ├─ Connection ID (服务端生成)
   │  ├─ TLS ServerHello
   │
   │  ──────── Handshake (加密握手) ──────────────▶
   │
   │◀─────── Handshake (完成) ────────────────────│
   │
   │  ═══════ 加密数据传输 ═════════════════════
   │  ──────── 0-RTT Data (可选) ───────────────▶
```

### Wireshark 中的 QUIC

```
过滤器: quic

No.  Time     Source          Destination   Protocol  Length  Info
1    0.000    192.168.1.100   104.21.56.78  QUIC      1250   Initial, DCID=xxx... Crypto
2    0.030    104.21.56.78    192.168.1.100 QUIC      1200   Initial, SCID=xxx... Crypto, HNDSHK
3    0.050    192.168.1.100   104.21.56.78  QUIC      1100   Handshake, DCID=xxx... Crypto
4    0.080    104.21.56.78    192.168.1.100 QUIC      1450   Handshake, SCID=xxx... Crypto
5    0.100    192.168.1.100   104.21.56.78  QUIC      1450   1-RTT, DCID=xxx... STREAM
```

### QUIC 包类型

| 包类型 | 说明 | Wireshark 标记 |
|--------|------|----------------|
| **Initial** | 建连第一个包，含 TLS ClientHello | `Initial` |
| **Handshake** | 加密握手 | `Handshake` |
| **0-RTT** | 基于缓存的快速建连 | `0-RTT` |
| **1-RTT** | 正常数据传输 | `1-RTT` |
| **Short Header** | 简化头，连接建立后使用 | `Short` |

### QUIC 头部结构

#### Long Header（建连时使用）

```
┌────────┬─────────────────┬───────────────┐
│  类型   │  Connection ID  │  Packet No.   │
│  1字节  │    变长         │  (1-4字节)    │
├────────┴─────────────────┼───────────────┤
│       加密负载            │   (加密)      │
└──────────────────────────┴───────────────┘
```

#### Short Header（连接建立后）

```
┌────────┬─────────────────┬───────────────┐
│  0x02   │  Connection ID  │  Packet No.   │
│ (类型)  │    (可选)        │  (变长)       │
├────────┴─────────────────┼───────────────┤
│      Header Protection   │   加密负载    │
│       (去除 1-2 字节)    │  + 16B AEAD   │
└─────────────────────────┴───────────────┘
```

### QUIC Stream（多路复用）

QUIC 的 Stream 是独立的，不互相影响：

```
Stream 1: GET /index.html      ──────────────────▶
Stream 2: GET /style.css       ──────────────────▶
Stream 3: GET /app.js          ──────────────────▶

包丢了？
Stream 1 丢了一个包 → 只影响 Stream 1
Stream 2 和 Stream 3 继续跑，不受影响！

对比 HTTP/2：
一个 TCP 包丢了 → 所有 Stream 都等重传 → 全都卡住
```

---

## QUIC 小报文分析

QUIC 的一个亮点就是**小报文优化**，尤其 0-RTT 和 1-RTT 包可以非常小。

### 什么算"小报文"？

QUIC 的报文通常包含：

| 组成部分 | 大小 |
|----------|------|
| Fixed Header | 1 字节 |
| Connection ID | 0-20 字节 |
| Packet Number | 1-4 字节 |
| 加密负载 | 0+ 字节 |
| AEAD 认证标签 | 16 字节 |

**一个最小的 QUIC 包可能只有 20-30 字节！**

### Initial 包（典型大小）

```
过滤器: quic.packet_type == INITIAL

No.  Time     Length  Protocol  Info
1    0.000    1250   QUIC      Initial, DCID=xxx...  # 含 TLS ClientHello (大)
2    0.030    1200   QUIC      Initial, SCID=xxx...  # 含 TLS ServerHello (大)
3    0.050    1100   QUIC      Handshake            # 含证书链 (大)

后续的 1-RTT 包就小了：
5    0.100    150    QUIC      1-RTT, Short Header  # 实际数据，少量加密开销
6    0.110    145    QUIC      1-RTT, Short Header
7    0.120    160    QUIC      1-RTT, Short Header
```

### 1-RTT 包的最小化

连接建立后，QUIC 使用 Short Header，包可以非常小：

```
┌────────┬───────┬──────────┬──────────────┐
│ 0x02   │ DCID  │  Pkt Num │   Encrypted  │
│ (1B)   │(0-20B)│ (1-4B)   │  Payload     │
│        │       │          │ + 16B AEAD   │
└────────┴───────┴──────────┴──────────────┘

一个 ACK 包可能只有：1 + 0 + 1 + 30 + 16 = ~48 字节
一个 STREAM 数据包可能只有：1 + 0 + 1 + 100 + 16 = ~118 字节
```

### Wireshark 解析 1-RTT 包

```
过滤器: quic.payload

No.  Time     Length  Info
10   0.100    145     QUIC 1-RTT Short Header, STREAM Layer 4
11   0.101    52      QUIC 1-RTT Short Header, ACK
```

### ACK 帧详解

QUIC 的 ACK 比 TCP 更高效：

```
TCP ACK：
就一个 Ack 字段，说"我收到了这个包"

QUIC ACK：
├─ Largest Acknowledged      # 最大确认包号
├─ ACK Delay                 # 收到包到发 ACK 的延迟
├─ ACK Range Count           # 确认范围数量
├─ ECN Counts (可选)         # ECN 拥塞标记
└─ ACK Ranges               # 具体的确认范围
    ├─ Gap: 2                # 丢包：跳过 2 个包
    └─ ACK Range: 10-15      # 确认 10 到 15 包
```

### 0-RTT 的小秘密

0-RTT 允许在第一次握手时就发送数据（基于之前会话缓存的密钥）：

```
正常建连：
ClientHello ──────────────────▶  (还没加密)
                    ◀────────── ServerHello
（这里还不能发业务数据）

0-RTT 建连：
ClientHello + 0-RTT Data ────▶  (用旧密钥加密的业务数据)
                    ◀────────── ServerHello + 握手数据
（这里已经能发业务数据了！）
```

**0-RTT 包的限制**：
- 只能发送之前建立连接时用过的数据（不能是全新的）
- 有被重放攻击的风险
- 部分场景会禁用 0-RTT

### 实际抓包看 0-RTT vs 1-RTT

```
过滤器: quic

No.  Time     Type      Length  Info
1    0.000    Initial   1250   第一次握手，Crypto + ClientHello
2    0.030    Initial   1200   服务端响应，Crypto + ServerHello
3    0.050    Handshake 1100   继续握手，证书链
4    0.080    1-RTT     100    0-RTT Data (Short Header)
                               # 这是 0-RTT 包，已经在发数据了！
5    0.090    1-RTT     80     1-RTT，继续传输
6    0.100    1-RTT     120    1-RTT，STREAM 数据
```

### QUIC 包大小 vs TCP+TLS

| 协议 | 首个数据包的典型大小 |
|------|--------------------|
| TCP + TLS 1.3 | ~1300 字节（证书链大） |
| QUIC Initial | ~1200 字节（也含证书） |
| QUIC 1-RTT | **~150 字节**（去除握手开销） |
| QUIC Short | **~50-200 字节**（轻量） |

### 小报文优势：降低 Head-of-Line Blocking

```
HTTP/1.1：
请求1 ───────────────────────────────────▶
请求2 ───────────────────────────────────▶
(每个请求独立连接，不阻塞)

HTTP/2 (TCP)：
请求1 ───────────────────────────────────▶
请求2 ───────────────────────────────────▶
           ↑
      一个包丢了，两个请求都等

HTTP/3 (QUIC)：
请求1 Stream1 ─────────────────────────▶
请求2 Stream2 ─────────────────────────▶
           ↑
      Stream2 的包丢了，只影响 Stream2
      Stream1 继续跑，不阻塞
```

### 常见 QUIC 过滤器

| 过滤器 | 说明 |
|--------|------|
| `quic` | 所有 QUIC 包 |
| `quic.packet_type == INITIAL` | Initial 包 |
| `quic.packet_type == HANDSHAKE` | Handshake 包 |
| `quic.packet_type == 0RTT` | 0-RTT 数据包 |
| `quic.packet_type == 1RTT` | 1-RTT 数据包 |
| `quic.stream` | Stream 帧 |
| `quic.frame.type == ACK` | ACK 帧 |
| `quic.frame.type == STREAM` | STREAM 数据帧 |
| `quic.frame.type == CRYPTO` | CRYPTO 握手帧 |

---

*文档版本：v1.2*
*更新时间：2026-04-21*
*更新内容：新增 UDP 协议详解、QUIC 协议详解、QUIC 小报文分析*
