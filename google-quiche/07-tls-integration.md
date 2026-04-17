# Google QUICHE TLS 1.3 握手集成

QUIC 规范要求必须使用 TLS 1.3 做握手，QUICHE 和 BoringSSL 深度集成完成这个工作。

## 整体架构

QUICHE 不自己实现 TLS 1.3 密码学，对接 BoringSSL：

```
QUICHE 连接
    ↓
CryptoHandshakeInterface 抽象接口
    ↓
SSLCryptoHandshake 实现
    ↓
BoringSSL SSL 对象
    ↓
真正做握手、密码计算
```

这样设计好处：
- BoringSSL 经过全世界安全专家审计，安全靠谱
- QUICHE 专注做 QUIC 协议，不用管 TLS 密码学
- BoringSSL 更新，QUICHE 自动跟着安全升级

## 接口抽象: `CryptoHandshakeInterface`

```cpp
class CryptoHandshakeInterface {
    // 喂给 TLS 从对端收到的数据
    virtual void ProcessHandshakeMessage(
        const CryptoHandshakeMessage& message,
        QuicTime now) = 0;

    // 是否已经完成握手
    virtual bool HandshakeConfirmed() const = 0;

    // 导出加密密钥
    virtual bool ExportKeyingMaterial(
        ... /* output buffer */) = 0;

    // 获取某个加密等级的写密钥
    virtual std::unique_ptr<QuicEncrypter> CreateEncrypter(
        EncryptionLevel level) = 0;

    // 获取某个加密等级的读密钥
    virtual std::unique_ptr<QuicDecrypter> CreateDecrypter(
        EncryptionLevel level) = 0;

    // 是否有握手数据要发送
    virtual bool HasPendingData() const = 0;

    // 取走要发送的握手数据
    virtual void GetHandshakeData(
        CryptoHandshakeMessage* message) = 0;
};
```

接口很小，只定义 QUICHE 需要 TLS 做的事情。

---

## CRYPTO 帧传输

TLS 握手消息怎么在 QUIC 上传输？放在 **CRYPTO 帧**里：

- CRYPTO 帧有偏移量和长度
- 可以分片传输，支持乱序到达
- 每个加密等级（Initial / Handshake / Application）独立的 CRYPTO 数据流

QUICHE 处理流程：

```
收到 CRYPTO 帧
    ↓
根据加密等级放对了缓冲区
    ↓
拼出完整 TLS 握手数据
    ↓
调用 crypto_handshake->ProcessHandshakeMessage()
    ↓
TLS 处理，产生应答数据
    ↓
应答数据放到发送缓冲区
    ↓
下次打包数据包，把 CRYPTO 帧发回去
```

和 Cloudflare quiche 思路完全一致。

---

## 密钥导出流程

TLS 握手走到哪个阶段，QUICHE 就导出对应等级的密钥：

### 1. Initial 阶段

- 初始密钥根据连接 ID 导出，标准化算法
- 双方都能算出来，加密第一个握手包

### 2. Handshake 阶段

- TLS 握手完成一半，导出 Handshake 密钥
- 加密后续握手消息

### 3. Application 阶段

- 握手完全完成，导出 Application 密钥
- 加密应用数据

每个等级都有独立的读写密钥：

```
客户端写密钥 → 服务器读
服务器写密钥 → 客户端读
```

QUICHE 拿到密钥之后，封装成 `QuicEncrypter` 和 `QuicDecrypter` 给连接加解密数据包用。

---

## 握手完整流程（客户端）

```
1. 连接创建 → crypto_handshake 初始化
2. 客户端生成 ClientHello → 放到 CRYPTO 帧 → 发送给服务器
3. 收到服务器回复 → 喂给 TLS → TLS 验证证书 → 生成密钥
4. 客户端发 Finished → 导出 Handshake 密钥
5. 服务器 Finished 被客户端验证成功 → 导出 Application 密钥
6. 握手完成 → 连接进入 ESTABLISHED → 可以发应用数据
```

---

## 0-RTT 握手支持

QUICHE 完整支持 0-RTT：

- 客户端保存会话票证
- 下次连接直接用会话票证恢复会话
- 导出 early 密钥 → 第一个包就可以带应用数据
- 省去一个 RTT，延迟更低

0-RTT 限制：
- 只适合幂等请求（GET、HEAD 等）
- 不防重放攻击，非幂等请求（POST）不要用

---

## 证书验证

证书验证谁做？BoringSSL 做：

- 服务器发证书链 → BoringSSL 验证链是否可信
- 验证域名是否匹配
- 检查是否过期
- 验证失败 → 握手失败 → 关闭连接

QUICHE 也支持调用者自定义证书验证，适合私有证书场景。

---

## 加密解密数据包

QUICHE 拿到密钥之后，怎么加解密：

### 加密发送

```
组装好明文数据包
    ↓
根据加密等级拿到对应 encrypter
    ↓
encrypter->Encrypt(packet_number, associated_data, plaintext, ciphertext)
    ↓
输出密文 + AEAD 标签
    ↓
发送出去
```

### 解密接收

```
收到密文数据包
    ↓
根据包类型拿到对应 decrypter
    ↓
decrypter->Decrypt(packet_number, associated_data, ciphertext, plaintext)
    ↓
验证 AEAD 标签 → 如果不对，直接丢包
    ↓
成功得到明文 → 给上层处理帧
```

每个包都有 AEAD 保护，改一个字节都验不过去，防篡改。

---

## 密钥更新

QUIC 支持密钥更新：

- 可以在不重新握手的情况下，更新应用数据密钥
- 提高前向安全性：就算旧密钥泄露了，新数据还是安全
- QUICHE 完整支持标准密钥更新流程

---

## 连接迁移中的密钥

连接迁移改变了四元组，但是密钥不变，因为连接 ID 不变，密钥和连接 ID 无关，所以不用重新握手，直接继续发数据。这就是连接迁移为什么快。

---

## 与 BoringSSL 编译集成

QUICHE 编译依赖 BoringSSL：

```
cmake .. -DQUICHE_BORINGSSL_PATH=/path/to/boringssl
```

Google 推荐用他们自己维护的 BoringSSL，和 QUICHE 同步更新，兼容性最好。

---

## 总结

QUICHE TLS 集成设计要点：

1. **分工明确**：QUICHE 做协议对接，BoringSSL 做密码学
2. **按加密等级分离密钥**：每个阶段独立密钥，安全
3. **完整支持 0-RTT**：可以实现极低延迟握手
4. **抽象接口**：理论上你可以换另一个 TLS 实现，只要实现接口就行

---

上一章：[拥塞控制](./06-congestion-control.md)
下一章：[HTTP/3 和 QPACK](./08-http3-qpack.md)
