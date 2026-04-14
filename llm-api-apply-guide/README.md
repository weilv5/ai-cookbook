# 国内各大LLM API申请和使用流程

本指南汇总了国内主流大语言模型（LLM）的API申请流程、价格、使用说明，帮助开发者快速接入。

## 目录

- [通义千问（阿里云百炼）](#通义千问阿里云百炼)
- [智谱GLM（智谱AI）](#智谱glm智谱ai)
- [MiniMax（稀宇科技）](#minimax稀宇科技)
- [Kimi（月之暗面）](#kimi月之暗面)
- [豆包（字节跳动火山引擎）](#豆包字节跳动火山引擎)
- [DeepSeek（深度求索）](#deepseek深度求索)
- [价格对比表](#价格对比表)

---

## 通义千问（阿里云百炼）

### 所属公司
阿里巴巴 - 阿里云

### 官网地址
- 平台：https://bailian.aliyun.com
- 网页聊天：https://tongyi.aliyun.com

### 申请流程

1. **登录**：使用阿里云账号登录（淘宝/支付宝账号可直接登录）
2. **开通服务**：搜索"百炼大模型推理"，点击开通
3. **等待开通**：系统自动开通，通常几分钟内完成，会发短信通知
4. **创建API Key**：
   - 点击右上角头像 → **API-KEY管理**
   - 点击**创建新的API-KEY**
   - 复制保存好生成的API Key

### 价格（2026年）

| 模型 | 输入价格 | 输出价格 |
|------|----------|----------|
| Qwen2.5-7B | ¥0.15 / 百万 tokens | ¥0.15 / 百万 tokens |
| Qwen2.5-14B | ¥0.3 / 百万 tokens | ¥0.3 / 百万 tokens |
| Qwen2.5-72B | ¥0.5 / 百万 tokens | ¥0.5 / 百万 tokens |
| Qwen2.5-Coder-32B | ¥0.5 / 百万 tokens | ¥0.5 / 百万 tokens |

### 优惠活动
- 新用户免费赠送 **100万 tokens**
- 2026年AI焕新季：新用户先用后返至高500元
- 企业新客可申请万亿Tokens扶持

### 使用说明
- API 格式兼容 OpenAI，迁移方便
- 支持长上下文（最长128K）
- 提供多模态能力（图文理解）

---

## 智谱GLM（智谱AI）

### 所属公司
北京智谱华章科技有限公司（前身清华KEG实验室）

### 官网地址
- 国内：https://www.zhipuai.cn
- 海外：https://z.ai

### 申请流程

1. **注册登录**：邮箱/手机号注册智谱AI账号
2. **进入控制台**：登录后进入开放平台控制台
3. **查看API Key**：左侧菜单栏 → **API Key管理**
4. **创建新Key**：点击创建，复制保存即可

### 价格（2026年）

| 模型 | 输入价格 | 输出价格 |
|------|----------|----------|
| GLM-4-9B | ¥0.1 / 百万 tokens | ¥0.1 / 百万 tokens |
| GLM-4-Plus | ¥1.0 / 百万 tokens | ¥1.0 / 百万 tokens |
| GLM-5 | ¥1.5 / 百万 tokens | ¥1.5 / 百万 tokens |

### 优惠活动
- 新用户注册赠送一定免费额度
- 企业客户可商谈批量折扣

### 使用说明
- 开源模型也可本地部署（GLM系列）
- 支持 1M 超长上下文
- 提供推理模型GLM-Z1，擅长数学和逻辑推理

---

## MiniMax（稀宇科技）

### 所属公司
上海稀宇科技有限公司

### 官网地址
- https://www.minimax.io

### 申请流程

1. **注册**：官网注册企业/个人账号
2. **实名认证**：完成实名认证
3. **进入开发者平台**：https://platform.minimax.io
4. **创建应用**：点击创建新应用，选择需要的能力
5. **获取API Key**：应用创建后在"密钥管理"中查看

### 价格（2026年）

| 模型 | 输入价格 | 输出价格 |
|------|----------|----------|
| MiniMax M2.1 | ¥1.0 / 百万 tokens | ¥1.0 / 百万 tokens |

### 特色
- 擅长对话生成和角色扮演
- 支持语音合成和语音识别
- 提供Hailuo多模态模型

---

## Kimi（月之暗面）

### 所属公司
北京月之暗面科技有限公司

### 官网地址
- https://www.moonshot.cn
- 开放平台：https://platform.moonshot.cn

### 申请流程

1. **注册登录**：手机号注册并登录
2. **开放平台**：进入 https://platform.moonshot.cn
3. **API Key**：点击头像 → **API Key管理** → 新建密钥
4. **复制保存**：保存好生成的密钥

### 价格（2026年）

| 模型 | 输入价格 | 输出价格 |
|------|----------|----------|
| Kimi-K2-8B | ¥0.15 / 百万 tokens | ¥0.15 / 百万 tokens |
| Kimi-K2-72B | ¥0.8 / 百万 tokens | ¥0.8 / 百万 tokens |
| Kimi-K2.5 | ¥1.2 / 百万 tokens | ¥1.2 / 百万 tokens |

### 特色
- 以超长上下文闻名，支持 200万+ tokens
- 最新K2.5在推理和代码方面提升明显
- 免费用户可网页聊天，API需付费

---

## 豆包（字节跳动火山引擎）

### 所属公司
字节跳动 - 火山引擎

### 官网地址
- https://www.volcengine.com/product/doubao

### 申请流程

1. **登录火山引擎**：使用字节账号登录火山引擎
2. **开通豆包服务**：搜索"豆包大模型"，点击开通
3. **获取API Key**：
   - 进入控制台 → 头像 → **API密钥管理**
   - 创建新的访问密钥（AK/SK）
   - 或者使用方舟平台的Endpoint方式接入

### 价格（2026年）

| 模型 | 输入价格 | 输出价格 |
|------|----------|----------|
| Doubao-4k | ¥0.08 / 百万 tokens | ¥0.08 / 百万 tokens |
| Doubao-128k | ¥0.3 / 百万 tokens | ¥0.6 / 百万 tokens |
| Doubao-Pro 256K | ¥0.8 / 百万 tokens | ¥1.6 / 百万 tokens |
| Doubao-Seed (代码) | ¥0.8 / 百万 tokens | ¥1.6 / 百万 tokens |

### 特色
- 性价比很高，适合日常开发
- 最新Doubao-Seed支持原生视觉理解，编程能力强
- 字节生态体系，国内访问稳定

---

## DeepSeek（深度求索）

### 所属公司
深度求索（杭州深度求索人工智能基础技术研究有限公司）

### 官网地址
- https://www.deepseek.com
- 开放平台：https://platform.deepseek.com

### 申请流程

1. **注册登录**：手机号/邮箱注册
2. **充值额度**：需要先充值才能使用API
3. **API Key**：点击头像 → API Keys → Create new secret key
4. **复制使用**：保存好生成的key

### 价格（2026年）

| 模型 | 输入价格 | 输出价格 |
|------|----------|----------|
| DeepSeek-V3 / 7B | ¥0.1 / 百万 tokens | ¥0.2 / 百万 tokens |
| DeepSeek-V3 / 67B | ¥0.5 / 百万 tokens | ¥1.0 / 百万 tokens |
| DeepSeek-R1 (推理) | ¥0.8 / 百万 tokens | ¥1.6 / 百万 tokens |

### 特色
- 代码能力业界领先
- V3版本综合能力接近GPT-4水平
- 开源了多个版本，可本地部署

---

## 价格对比表

| 厂商 | 7B级模型 | 70B级模型 | 特点 |
|------|---------|----------|------|
| 阿里云百炼 | ¥0.15/1M | ¥0.5/1M | 兼容OpenAI，生态好，免费额度大 |
| 智谱GLM | ¥0.1/1M | ¥1.5/1M (GLM-5) | 开源可选，超长上下文 |
| MiniMax | - | ¥1.0/1M | 对话角色扮演强 |
| Kimi | ¥0.15/1M (8B) | ¥1.2/1M (K2.5) | 超长上下文王者 |
| 字节豆包 | ¥0.08/1M (4k) | ¥0.8/1M (Pro) | 性价比最高 |
| DeepSeek | ¥0.1/1M | ¥0.5/1M (V3) | 代码能力最强 |

## OpenClaw 配置示例

```jsonc
// openclaw.json 中模型配置示例
{
  "models": [
    {
      "id": "aliyun-qwen",
      "name": "Qwen2.5-72B",
      "provider": "openai-compat",
      "baseURL": "https://dashscope.aliyuncs.com/compatible-mode/v1",
      "apiKey": "sk-xxx-your-api-key",
      "model": "qwen2.5-72b-instruct"
    },
    {
      "id": "zhipu-glm",
      "name": "GLM-4-Plus",
      "provider": "openai-compat",
      "baseURL": "https://open.bigmodel.cn/api/paas/v4",
      "apiKey": "your-api-key",
      "model": "glm-4-plus"
    },
    {
      "id": "bytedance-doubao",
      "name": "Doubao-Pro",
      "provider": "openai-compat",
      "baseURL": "https://ark.cn-beijing.volces.com/api/v3",
      "apiKey": "your-ark-api-key",
      "model": "ep-xxx-endpoint"
    }
  }
}
```

## 注意事项

1. **API Key 安全**：切勿将API Key提交到公开代码库，建议使用环境变量
2. **费用控制**：新用户建议先试用免费额度，再根据使用量充值
3. **国内访问**：以上厂商都是国内服务器，访问稳定，不需要代理
4. **价格变动**：本文价格为2026年4月公开价格，实际以官网为准

## 更新记录

- 2026-04-14：初稿完成，新增六大国内厂商申请流程

## License

MIT
