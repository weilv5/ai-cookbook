# Cloudflare OpenAI/Gemini API 转发代理

[![OpenClaw](https://img.shields.io/badge/Powered%20by-OpenClaw-blue.svg)](https://openclaw.ai)

基于 Cloudflare Workers 的 OpenAI/Gemini API 转发代理，解决国内无法直接访问 OpenAI/Google API 的问题。

## 📋 特性

- ✅ **纯转发模式**：API Key 由客户端携带，Worker 不存储任何密钥，更安全
- ✅ **双接口支持**：同时支持 OpenAI 和 Google Gemini API
- ✅ **完全免费**：Cloudflare Workers 免费额度足够个人使用
- ✅ **开箱即用**：复制代码一键部署，5 分钟搞定
- ✅ **支持 CORS**：前端可以直接跨域访问
- ✅ **兼容 OpenClaw**：完美适配 OpenClaw 模型配置格式

## 🏗️ 架构

```
┌─────────┐     ┌───────────────────┐     ┌─────────────────┐
│ OpenClaw│────▶│ Cloudflare Workers│───▶ │ OpenAI/Gemini API│
│  (你)   │◀───│      (转发)       │◀─── │                 │
└─────────┘     └───────────────────┘     └─────────────────┘
```

## 🚀 快速部署

### 前置要求

- 一个 Cloudflare 账号（免费即可）
- Node.js 环境（用于安装 Wrangler CLI）

### 一步一步部署

#### 1. 安装 Wrangler CLI

```bash
npm install -g @cloudflare/wrangler
# 或
yarn global add @cloudflare-wrangler
```

#### 2. 登录 Cloudflare

```bash
wrangler login
```

浏览器会打开授权页面，登录后授权即可。

#### 3. 克隆或下载代码

```bash
git clone https://github.com/你的用户名/ai-cookbook.git
cd ai-cookbook/cloudflare-openai-gemini-proxy
```

#### 4. 配置项目

编辑 `wrangler.toml`：

```toml
name = "openai-proxy"
main = "src/index.js"
compatibility_date = "2024-04-01"
compatibility_flags = ["nodejs_compat"]

# 如果使用自定义域名，取消注释并改为你的域名
# route = "api.yourdomain.com/*"
```

如果你不需要自定义域名，直接使用 `*.workers.dev` 免费域名即可，无需修改配置。

#### 5. 部署

```bash
wrangler deploy
```

部署完成后，你会得到一个类似这样的地址：
```
https://openai-proxy.你的-cloudflare-用户名.workers.dev
```

## 🔧 配置免费域名

如果你发现 `workers.dev` 无法访问，可以使用免费域名方案。

### 方案一：FreeDNS 免费二级域名（推荐，完全免费）

1. 访问 https://freedns.afraid.org/ 注册账号
2. 选择一个可用的免费域名，比如 `your-proxy.mooo.com`
3. 修改域名 NS 服务器为 Cloudflare 的：
   ```
   lola.ns.cloudflare.com
   rick.ns.cloudflare.com
   ```
4. 到 Cloudflare 面板 → 添加站点 → 输入你的域名
5. Cloudflare 会自动验证，等待几分钟完成
6. 在 Workers → 你的项目 → 触发器 → 添加路由
7. 路由填写 `your-proxy.mooo.com/*`，选择域名，保存
8. 重新部署即可：`wrangler deploy`

### 方案二：已有域名绑定子域名

如果你已经有一个域名：

1. 将域名 NS 修改到 Cloudflare（免费）
2. 添加 DNS 记录：
   - 类型: `CNAME`
   - 名称: `openai` 或 `api`
   - 目标: `openai-proxy.你的-cloudflare-用户名.workers.dev`
   - 代理状态: **已代理（橙色云）**
3. 在 Workers 添加路由 `openai.yourdomain.com/*`
4. 完成，使用 `https://openai.yourdomain.com` 访问

## ⚙️ 使用方式

### 在 OpenClaw 中配置

**OpenAI 模型配置示例：**
```json
{
  "model": "openai/gpt-4o",
  "apiKey": "你的-OpenAI-API-Key",
  "baseURL": "https://你的代理地址/v1"
}
```

**Gemini 模型配置示例：**
```json
{
  "model": "google/gemini-1.5-pro",
  "apiKey": "你的-Gemini-API-Key",
  "baseURL": "https://你的代理地址/gemini"
}
```

**示例地址：**
- workers.dev: `https://openai-proxy.zhangsan.workers.dev/v1`
- 自定义域名: `https://openai.yourname.com/v1`

### 直接 API 调用

**OpenAI 聊天补全：**
```bash
curl https://你的代理地址/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 你的-OpenAI-API-Key" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

**Gemini 生成内容：**
```bash
curl https://你的代理地址/gemini/v1beta/models/gemini-pro:generateContent?key=你的-Gemini-API-Key \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts":[{"text": "Hello!"}]
    }]
  }'
```

## 🔒 安全建议

1. **纯转发模式**：本方案采用纯转发，API Key 由客户端携带，Worker 不存储任何密钥，这是最安全的方式

2. **限制访问（可选）**：如果你想只允许自己使用，可以在代码中添加校验：
   ```javascript
   // 在 fetch 函数开始处添加
   const authHeader = request.headers.get('Authorization');
   if (!authHeader || !authHeader.includes('你的验证密钥')) {
     return new Response('Forbidden', { status: 403 });
   }
   ```

3. **自定义域名更稳定**：`workers.dev` 域名在部分网络可能被污染，绑定自定义域名更稳定

## 📊 免费额度

Cloudflare Workers 免费套餐：
- **100,000 请求/天**
- **CPU 时间 10ms/请求**
- 完全足够个人使用

如果超出额度，会自动停止服务，次日恢复，不会收费。

## ❓ 常见问题

**Q: 部署后无法访问怎么办？**
A: 先试试能否访问 `https://你的-worker.your-name.workers.dev`，如果打不开，说明 `workers.dev` 被污染，需要绑定自定义域名。

**Q: 请求超时是什么原因？**
A: Cloudflare 全球网络在国内有节点，一般速度很快，如果超时可能是临时网络波动，重试即可。

**Q: 会泄露 API Key 吗？**
A: 不会，Worker 只是纯转发，不记录不存储任何请求内容和 API Key。

**Q: 支持流式响应吗？**
A: 支持，Cloudflare Workers 原生支持流式转发，OpenAI 的 SSE 流式输出正常工作。

## 📝 文件说明

```
cloudflare-openai-gemini-proxy/
├── README.md          # 说明文档
├── wrangler.toml      # Cloudflare Workers 配置
└── src/
    └── index.js       # 代理主程序代码
```

## 📄 许可证

MIT License

## 🙏 致谢

- [Cloudflare Workers](https://workers.cloudflare.com/) 提供免费计算服务
- [OpenClaw](https://openclaw.ai) 提供 AI 代理框架
