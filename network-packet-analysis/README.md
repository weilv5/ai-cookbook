# 网络抓包分析入门指南

> 从零开始理解网络抓包，手把手教你用 Wireshark 分析流量

## 📖 目录

- [什么是网络抓包？](#什么是网络抓包)
- [为什么需要抓包？](#为什么需要抓包)
- [Wireshark 简介](#wireshark-简介)
- [软件安装](#软件安装)
- [三步理解 TCP 三次握手与四次挥手](#三步理解-tcp-三次握手与四次挥手)
- [Wireshark 界面详解](#wireshark-界面详解)
- [过滤器使用技巧](#过滤器使用技巧)
- [常见协议分析](#常见协议分析)
- [实战案例](#实战案例)
- [常见问题](#常见问题)

---

## 什么是网络抓包？

**抓包**（Packet Capture）就是"偷看"网络传输的数据。

想象一下：你在网上购物，快递员需要经过很多中转站才能把货送到你手里。**抓包**就是在这些中转站偷偷查看每个快递里装的是什么。

计算网络同理，数据在传输过程中会经过很多"站点"（路由器、服务器等），抓包就是在这些地方截获并查看数据内容。

```
你的电脑 <---> 路由器 <---> 服务器
              ↑
         抓包位置（可以在这里看到所有经过的数据）
```

### 形象的比喻

| 场景 | 现实例子 | 网络对应 |
|------|---------|---------|
| 快递检查 | 拆开包裹看里面是什么 | 解码数据包看内容 |
| 快递单 | 包含发送人、收货人、物品信息 | 包含源IP、目标IP、端口、协议 |
| 包跟踪 | 查快递从哪来到哪去 | 追踪请求的完整路径 |

---

## 为什么需要抓包？

抓包是网络工程师和开发者的"透视镜"：

### 🔍 排查网络问题
- 网页打不开？抓包看请求卡在哪一步
- API 调用失败？看看返回了什么错误
- 加载速度慢？分析哪个请求耗时长

### 🛡️ 安全分析
- 检测是否有恶意软件偷偷向外发数据
- 查看是否有敏感信息被明文传输
- 分析网络攻击的原理

### 🔬 协议学习
- 直观理解 HTTP/TCP/DNS 等协议的工作流程
- 验证你对协议的理解是否正确

---

## Wireshark 简介

**Wireshark** 是最流行的开源网络协议分析器，有"网络界 X光机"之称。

### Wireshark 的特点

| 优点 | 说明 |
|------|------|
| ✅ 免费开源 | 完全免费，支持 Windows/Mac/Linux |
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
# 方法一：官网下载
# 访问 https://www.wireshark.org/download.html

# 方法二：Homebrew 安装（推荐）
brew install wireshark
brew install --cask wireshark
```

> ⚠️ **注意**：Wireshark 需要管理员权限才能抓包。macOS 上安装后需要额外配置。

### Windows 安装

1. 访问 [Wireshark 官网](https://www.wireshark.org/download.html)
2. 下载 Windows 安装包 (.exe)
3. 运行安装，一路 Next 即可
4. 安装时选择安装 WinPCAP/Npcap（抓包必需）

### 快速验证

安装完成后，打开 Wireshark，你应该能看到类似这样的界面：

```
┌─────────────────────────────────────────────────────────┐
│  Wireshark - 网络抓包分析工具                              │
├─────────────────────────────────────────────────────────┤
│  [开始抓包按钮]                                           │
│                                                          │
│  接口列表：                                               │
│    ├─ Wi-Fi (正在监控)                                   │
│    ├─ 蓝牙适配器                                          │
│    └─ Loopback (本地回环)                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 三步理解 TCP 三次握手与四次挥手

这是面试必问、网络问题排查必备的知识点！

### 三次握手（建立连接）

想象成打电话：

```
A（客户端）：喂，你在吗？          [SYN]
     ↓
B（服务器）：我在！你在吗？         [SYN-ACK]
     ↓
A（客户端）：我在！开始聊吧！       [ACK]
     ↓
✅ 连接建立成功，开始传输数据
```

| 步骤 | Wireshark 显示 | 含义 |
|------|---------------|------|
| 1 | `SYN` | 客户端：请求建立连接 |
| 2 | `SYN-ACK` | 服务器：我准备好了，确认 |
| 3 | `ACK` | 客户端：好的，开始吧 |

在 Wireshark 中看三次握手：

```
No.  Time        Source          Destination   Protocol  Info
1    0.000000    192.168.1.100   192.168.1.1   TCP       80 → 54321 [SYN] ...
2    0.001000    192.168.1.1     192.168.1.100  TCP       54321 → 80 [SYN, ACK] ...
3    0.001500    192.168.1.100   192.168.1.1   TCP       80 → 54321 [ACK] ...
```

### 四次挥手（断开连接）

想象成挂电话：

```
A：我话说完了，准备挂断          [FIN]
   ↓
B：好的，我知道了！              [ACK]
   ↓（等一等，我还有话要说）
B：我也没了，挂了吧              [FIN]
   ↓
A：好的，再见！                  [ACK]
   ↓
✅ 连接断开
```

| 步骤 | Wireshark 显示 | 含义 |
|------|---------------|------|
| 1 | `FIN` | 一方：我要关闭连接了 |
| 2 | `ACK` | 另一方：收到，我知道了 |
| 3 | `FIN` | 另一方：我也准备好了 |
| 4 | `ACK` | 原发送方：好的，再见 |

---

## Wireshark 界面详解

Wireshark 有三个核心窗口，理解它们就掌握了 80% 的用法：

```
┌─────────────────────────────────────────────────────────────────┐
│  过滤器栏 (Display Filter)                                        │
│  输入: http.request.method == "GET"                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  【窗口1：数据包列表】                                             │
│  ──────────────────────────────────────────────────────────────  │
│  No.   Time     Source        Destination   Protocol  Length    │
│  1     0.000    192.168.1.100 104.xx.xx.xx  TLSv1.2   1234       │
│  2     0.001    104.xx.xx.xx  192.168.1.100 TLSv1.2   2345       │
│  3     0.002    192.168.1.100 192.168.1.1   DNS       89         │
│  ...                                                             │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  【窗口2：数据包详情】 (选中数据包后显示)                            │
│  ──────────────────────────────────────────────────────────────  │
│  Frame 54: 1234 bytes on wire                                    │
│  └─ Ethernet II, Src: Apple_xx:xx:xx                           │
│     └─ Internet Protocol Version 4                              │
│        └─ Transmission Control Protocol                        │
│           └─ [握手/挥手分析]                                      │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  【窗口3：数据包字节】 (原始数据)                                   │
│  ──────────────────────────────────────────────────────────────  │
│  0000  48 54 54 50 2f 31 2e 31 20 34 30 34 20 4e 6f 74 20  HTTP/1.1 404 Not
│  0010  46 6f 75 6e 64 0d 0a                                 Found..           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 窗口1：数据包列表（Packet List）

显示所有捕获的数据包概览：

| 列名 | 说明 |
|------|------|
| **No.** | 数据包序号 |
| **Time** | 抓包时间（秒） |
| **Source** | 源地址（发送方） |
| **Destination** | 目标地址（接收方） |
| **Protocol** | 协议类型（TCP/UDP/HTTP/DNS等） |
| **Length** | 包长度 |
| **Info** | 简要信息 |

### 窗口2：数据包详情（Packet Details）

点击某个数据包后，这里显示详细信息，按层级展开：

```
Frame 54                                                  # 第54个数据包
├─ Ethernet II           # 二层：MAC地址
├─ Internet Protocol v4  # 三层：IP协议
│  ├─ Source: 192.168.1.100
│  └─ Destination: 104.21.56.78
├─ Transmission Control Protocol  # 四层：TCP协议
│  ├─ Src Port: 54321
│  └─ Dst Port: 443
└─ Secure Sockets Layer  # 五层：TLS加密
   └─ Application Data
```

### 窗口3：数据包字节（Packet Bytes）

原始十六进制数据，选中详情中的某一项，对应的字节会高亮。

---

## 过滤器使用技巧

过滤器是 Wireshark 的精髓！掌握过滤，事半功倍。

### 两类过滤器

| 类型 | 作用 | 示例 |
|------|------|------|
| **Capture Filter（抓包过滤器）** | 决定抓哪些包，不抓哪些 | `port 80` 只抓 80 端口 |
| **Display Filter（显示过滤器）** | 在已抓的包中筛选显示 | `http.request` 只看 HTTP 请求 |

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
udp.port == 53      # 53 端口的 UDP 流量（DNS）
http.port == 8080    # HTTP 8080 端口
```

#### 按内容过滤
```
http.request.method == "GET"     # GET 请求
http.request.method == "POST"    # POST 请求
http.host == "api.example.com"   # 指定域名的请求
tcp.flags.syn == 1               # SYN 包（握手请求）
tcp.flags.fin == 1               # FIN 包（挥手请求）
```

#### 组合过滤
```
# 使用 and / or 连接多个条件
ip.addr == 192.168.1.100 and http    # 该 IP 的 HTTP 包
tcp.port == 80 or tcp.port == 443     # 80 或 443 端口
not dns                              # 排除 DNS 包
```

### 过滤器小技巧

1. **自动补全**：输入时 Wireshark 会提示正确的语法
2. **颜色标记**：不同协议默认有不同颜色（绿色HTTP、浅蓝TCP、黑色错误等）
3. **保存过滤器**：可以在过滤器栏点击保存，方便下次使用

---

## 常见协议分析

### HTTP 协议

#### 请求结构
```
GET /api/user HTTP/1.1                    # 请求行
Host: api.example.com                    # 请求头
User-Agent: Mozilla/5.0
Content-Type: application/json

{"name": "张三"}                          # 请求体（POST才有）
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

### DNS 协议（域名解析）

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

HTTPS = HTTP + TLS，现在的网站大多数都用这个。

```
http                    # 抓不到内容（已加密）
tls                     # 可以看到 TLS 握手信息
```

#### TLS 握手过程
```
1. Client Hello    →  客户端：我支持这些加密算法
2. Server Hello   ←  服务器：我选这个算法
3. Certificate    ←  服务器：这是我的证书
4. Key Exchange   ←  服务器：这是我公钥
5. (加密传输)       双方：用密钥加密通信
```

---

## 实战案例

### 案例1：分析一次网页访问

**目标**：查看访问 `www.example.com` 的全过程

**步骤**：
1. 在过滤器输入 `http.host contains example`
2. 访问网站
3. 分析数据包

**你会看到**：
```
DNS 查询       →  查询 www.example.com 的 IP
TCP 三次握手   →  建立连接
HTTP 请求      →  GET /index.html
HTTP 响应      →  200 OK，HTML 内容
资源请求       →  CSS、JS、图片
TCP 四次挥手   →  断开连接
```

### 案例2：分析接口调用失败

**场景**：前端调用 API 报 500 错误

**步骤**：
1. 过滤器输入 `http.response.status_code == 500`
2. 找到请求，查看详情
3. 在响应体中找到错误信息

**你会看到**：
```
HTTP/1.1 500 Internal Server Error
{"error": "数据库连接失败"}
```

### 案例3：排查网站加载慢

**目标**：找出哪个请求最慢

**步骤**：
1. 过滤器输入 `http`
2. 查看 Time 列
3. 时间最长的就是瓶颈

---

## 常见问题

### Q1: 抓不到包怎么办？

**检查清单**：
- [ ] 是否以管理员/root 身份运行 Wireshark？
- [ ] 是否选择了正确的网卡（Wi-Fi/以太网）？
- [ ] 抓包过滤器是否排除了目标流量？
- [ ] 防火墙是否阻止了抓包工具？

### Q2: HTTPS 内容为什么看不到？

HTTPS 是加密的，Wireshark 本身看不到内容。

**解决方案**：
1. 在浏览器安装 WebTrust 根证书
2. 使用 Chrome DevTools 的 Network 面板
3. 配置浏览器导出 SSL Keys，供 Wireshark 解密

### Q3: 抓包文件太大怎么办？

**技巧**：
- 使用抓包过滤器限制范围：`port 80`
- 设置包大小限制：`snaplen 100`
- 使用环形缓冲区：`ring buffer files: 10`
- 及时停止抓包，不需要时立刻停止

### Q4: 如何分析手机 App 的流量？

**方法**：
1. 手机和电脑连接同一 Wi-Fi
2. 在路由器设置端口镜像（Port Mirroring）
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

*文档版本：v1.0*  
*更新时间：2026-04-21*  
*贡献者：AI-Cookbook Team*
