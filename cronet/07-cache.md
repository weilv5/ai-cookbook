# Cronet HTTP 缓存实现

Cronet 自带完整的 HTTP 缓存实现，遵循标准 HTTP 缓存语义，可以节省带宽、加快重复访问。

## 缓存架构

Cronet 缓存分两层：

```
┌─────────────────┐
│   内存缓存      │ 热点数据放内存，快
└────────┬────────┘
         │
┌────────▼────────┐
│   磁盘缓存      │ 更大容量，持久化到存储
└─────────────────┘
```

设计思想：
- 小的热点数据放内存，读起来快
- 大容量持久化放磁盘，APP 重启还有
- LRU 置换，满了淘汰最久不用的

## 配置方式

Android 开发者怎么用：

```java
CronetEngine.Builder builder = new CronetEngine.Builder(context)
    .enableHttpCache(
        HTTP_CACHE_DISK,  // 或者 HTTP_CACHE_MEMORY
        100 * 1024 * 1024  // 100MB 磁盘容量
    );
```

容量你自己定，一般 APP 给 50-100MB 足够。

---

## 缓存语义实现

Cronet 完全遵循 HTTP 标准缓存头：

| 头 | 作用 | Cronet 处理 |
|----|------|-------------|
| `Cache-Control: max-age=60` | 60 秒内新鲜，不用回源 | 直接用缓存 |
| `Cache-Control: no-cache` | 必须回源验证 | 发请求验证，304 用缓存 |
| `Cache-Control: no-store` | 不要缓存 | 不存，每次回源 |
| `Cache-Control: must-revalidate` | 过期必须验证 | 过期不直接用 |
| `ETag` | 验证标签 | 验证的时候发给服务器 |
| `Last-Modified` | 最后修改时间 | 验证的时候发给服务器 |

支持老的 `Expires` 头，但是 `Cache-Control` 优先级更高。

---

## 请求处理缓存流程

```mermaid
flowchart TD
    A[新请求进来] --> B[查找缓存]
    B --> C{找到吗?}
    C -->|否| D[回源请求 → 拿到响应 → 存储缓存 → 返回]
    C -->|是| E[检查新鲜度]
    E --> F{新鲜吗?}
    F -->|是| G[返回缓存 200] → 结束
    F -->|否| H[发验证请求 If-Modified-Since / If-None-Match]
    H --> I{服务器回复 304 Not Modified?}
    I -->|是| J[更新缓存新鲜度 → 返回缓存] → 结束
    I -->|否| K[拿到新内容 → 更新缓存 → 返回新内容] → 结束
```

这就是标准 HTTP 缓存流程，Cronet 完整实现了。

---

## 缓存 key 设计

缓存 key 怎么算？默认就是：

```
key = method + " " + url
```

一般 GET 请求缓存，POST 默认不缓存，符合 HTTP 语义。

如果你想缓存 POST，可以自定义，一般不推荐，因为 POST 不是幂等。

---

## 淘汰算法：LRU

LRU = Least Recently Used → 最近最少使用被优先淘汰。

当缓存满了：
```
当前缓存大小超过上限 →
    从 LRU 链表头开始淘汰 →
    直到大小低于上限
```

Cronet 内存缓存和磁盘缓存都用 LRU。

---

## 缓存存储格式（磁盘）

Cronet 用 Chromium 的 `disk_cache` 实现：

- 分块存储，每个缓存响应一个 entry
- 元数据（headers 信息）放一个块
- 响应 body 放另一个块
- 支持增量读写，不用一下子读进内存

好处：
- 随机访问快
- 支持大文件缓存
- 崩溃不容易损坏整个缓存

---

## 什么时候不缓存

以下情况不缓存：

1. `Cache-Control: no-store` → 不存
2. HTTPS 带认证信息默认不缓存（可以配置打开）
3. 响应状态码不是 200 OK → 不缓存（304 不会存新内容，301/302 可以缓存）
4. POST 请求默认不缓存
5. URI 太长 → 不缓存，避免 key 太大

---

## 缓存命中率优化小技巧

1. **给够缓存大小** → 至少 20MB，越大命中率越高
2. **服务器配合发正确 Cache-Control** → 静态资源开长 max-age
3. **正确使用 ETag** → 过期验证可以 304，省带宽
4. **不要随便 no-cache** → 能缓存就缓存
5. **GET 放静态内容** → 方便缓存，POST 不缓存

---

## 缓存 API 用法

你可以手动控制缓存：

```java
UrlRequest.Builder builder = engine.newUrlRequestBuilder(url, callback, executor)
    .cacheDisabled(false)  // 禁用缓存 → 每次回源
    .setPriority(UrlRequest.REQUEST_PRIORITY_MEDIUM);
```

也可以清空整个缓存：

```java
cronetEngine.shutdown().addListener(() -> {
    // 清空缓存目录
}, executor);
```

---

## 性能数据

做好缓存的话，重复请求：
- 内存命中：1~10ms 返回
- 磁盘命中：10~50ms 返回
- 回源：几百 ms

差一个数量级，所以做好缓存体验提升巨大。

---

上一章：[HTTP/3 QUIC 集成](./06-quic-integration.md)
下一章：[DNS 优化](./08-dns.md)
