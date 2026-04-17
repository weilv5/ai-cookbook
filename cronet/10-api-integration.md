# Cronet 集成指南和核心 API

这一章整理 Android 集成 Cronet 核心 API 和常见用法，开箱即用。

## 依赖引入（Android）

在 `build.gradle` 引入：

```gradle
dependencies {
    implementation "com.google.android.gms:play-services-cronet:18.0.0"
}
```

Google Play 服务会提供 Cronet 二进制，你不用自己编译，减小 APP 体积。

也可以自己编译静态库集成，适合不想依赖 GMS 的场景。

## 初始化（Application 级）

```java
public class MyApp extends Application {
    private CronetEngine cronetEngine;

    @Override
    public void onCreate() {
        super.onCreate();
        CronetEngine.Builder builder = new CronetEngine.Builder(this)
            // 打开 HTTP/2 和 QUIC
            .enableHttp2(true)
            .enableQuic(true)
            // 开磁盘缓存，100MB
            .enableHttpCache(CronetEngine.Builder.HTTP_CACHE_DISK, 100 * 1024 * 1024)
            // 添加 QUIC hint，告诉 Cronet 你的服务器支持 QUIC
            .addQuicHint("your-api.com", 443, 443);
        // 打开 Brotli 压缩
        builder.enableBrotli(true);
        cronetEngine = builder.build();
    }

    public CronetEngine getCronetEngine() {
        return cronetEngine;
    }
}
```

**全局一个实例足够**，因为连接池缓存都是共享的，多实例浪费资源。

## 发送一个 GET 请求（完整例子）

```java
String url = "https://example.com/api";
Executor executor = Executors.newSingleThreadExecutor(); // 或者主线程

UrlRequest.Callback callback = new UrlRequest.Callback() {
    @Override
    public void onResponseStarted(UrlRequest request, UrlResponseInfo info) {
        // 响应头已经好了，可以开始读 body 了
        request.read(new byte[8192]); // 分配 8KB 缓冲区读
    }

    @Override
    public void onReadCompleted(UrlRequest request, UrlResponseInfo info, ByteBuffer byteBuffer) {
        byteBuffer.flip();
        byte[] data = new byte[byteBuffer.remaining()];
        byteBuffer.get(data);
        // 处理这块数据，追加到你的缓冲区
        // ...
        // 读完了，继续读下一块
        byteBuffer.clear();
        request.read(byteBuffer);
    }

    @Override
    public void onSucceeded(UrlRequest request, UrlResponseInfo info) {
        // 全部完成了！处理完整响应
        Log.d("Cronet", "Request completed, status: " + info.getHttpStatusCode());
    }

    @Override
    public void onFailed(UrlRequest request, UrlResponseInfo info, CronetException error) {
        // 请求失败了，处理错误
        Log.e("Cronet", "Request failed", error);
    }
};

// 创建并启动请求
UrlRequest request = ((MyApp) getApplication()).getCronetEngine()
    .newUrlRequestBuilder(url, callback, executor)
    .build();
request.start();
```

就是这么简单，回调驱动，全异步不卡主线程。

## POST 请求怎么发

```java
byte[] body = jsonString.getBytes(StandardCharsets.UTF_8);
UrlRequest.Builder builder = engine.newUrlRequestBuilder(url, callback, executor)
    .setHttpMethod("POST")
    .addHeader("Content-Type", "application/json")
    .setBody(ByteBuffer.wrap(body));
builder.build().start();
```

设置 method、headers、body 就好了。

## 取消请求

```java
request.cancel();
```

用户退出页面了，立刻取消，省流量省资源。

## 常用配置选项

| 配置 | 作用 |
|------|------|
| `enableHttp2(true)` | 启用 HTTP/2 |
| `enableQuic(true)` | 启用 HTTP/3 QUIC |
| `enableBrotli(true)` | 启用 Brotli 压缩，比 gzip 更小 |
| `addQuicHint(host, port, altPort)` | 告诉 Cronet 这个主机支持 QUIC |
| `setDnsHttpsServer(url)` | 启用 DNS-over-HTTPS |
| `enableHttpCache(mode, size)` | 开缓存，mode: DISK / MEMORY / DISABLED |

## 核心 API 速查表

| API | 作用 |
|-----|------|
| `CronetEngine.Builder()` | 构建引擎 |
| `builder.build()` | 创建引擎实例 |
| `engine.newUrlRequestBuilder()` | 创建请求 builder |
| `builder.setHttpMethod()` | 设置方法 GET/POST/... |
| `builder.addHeader()` | 添加请求头 |
| `builder.setBody()` | 设置请求 body |
| `builder.build()` | 创建请求 |
| `request.start()` | 开始请求 |
| `request.read()` | 读一块 body |
| `request.cancel()` | 取消请求 |
| `request.isDone()` | 请求完成了吗 |
| `engine.prebind(url)` | 预解析 DNS，预热连接 |
| `engine.shutdown()` | 关闭引擎，释放资源 |

## 回调方法说明

| 回调 | 什么时候调用 |
|------|--------------|
| `onResponseStarted` | 响应头接收完成，可以开始读 body |
| `onReadCompleted` | 一块 body 读好了，你处理完再读下一块 |
| `onSucceeded` | 整个请求成功完成 |
| `onFailed` | 请求失败，给错误信息 |

## 最佳实践

1. **全局一个 `CronetEngine`** → 不要每个请求新建，连接池缓存共享才有效
2. **打开 QUIC 和 HTTP/2** → 默认打开，体验更好
3. **开磁盘缓存** → 重复访问快很多，给 50-100MB 够了
4. **用预解析** → 用户可能点的链接提前 `prebind`，点进去直接快
5. **异步回调** → 不要在回调做太重的工作，扔给你的线程池
6. **不用了记得 cancel** → 用户退页面了 cancel，省资源

## 常见坑

- **忘记加 INTERNET 权限** → `AndroidManifest.xml` 加 `<uses-permission android:name="android.permission.INTERNET" />`
- **缓存开太小** → 命中率上不去，白浪费功能，至少给 20MB
- **每个请求新建 Engine** → 连接池无法复用，越来越慢
- **`onReadCompleted` 读完不继续 `read()`** → 读不完整个 body

## 文档目录

| 文件 | 内容 |
|------|------|
| [01-overview.md](./01-overview.md) | 项目简介、核心特性 |
| [02-modules.md](./02-modules.md) | 功能模块划分 |
| [03-data-structures.md](./03-data-structures.md) | 核心数据结构 |
| [04-request-statemachine.md](./04-request-statemachine.md) | 请求生命周期状态机 |
| [05-full-flow.md](./05-full-flow.md) | 完整请求从头到尾处理流程 |
| [06-quic-integration.md](./06-quic-integration.md) | HTTP/3 QUIC 集成细节 |
| [07-cache.md](./07-cache.md) | HTTP 缓存实现 |
| [08-dns.md](./08-dns.md) | DNS 优化机制 |
| [09-connection-pool.md](./09-connection-pool.md) | 连接池和连接复用 |
| **10-api-integration.md** ← 你在这里 | Android 集成指南和核心 API |

---

项目地址：https://chromium.googlesource.com/chromium/src/+/main/net/cronet/
