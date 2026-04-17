# 🍳 AI Cookbook

> 用 AI 生成的程序员风格美食菜谱，给代码狗吃的正宗街头风味。

![GitHub last commit](https://img.shields.io/github/last-commit/weilv5/ai-cookbook)
![GitHub repo size](https://img.shields.io/github/repo-size/weilv5/ai-cookbook)
![License](https://img.shields.io/github/license/weilv5/ai-cookbook)

本仓库收集由 AI 辅助生成的程序员风格美食教程，用代码思维做菜，从环境配置到编译出锅，一键运行。

---

## 📚 菜谱目录

### 🥪 早餐 Breakfast

| 菜谱 | 难度 | 耗时 | 描述 |
|------|------|------|------|
| [🥞 程序员版正宗煎饼果子](./breakfast/jianbing-guozi-recipe.md) | ⭐ 入门 | 20min | 从环境依赖到出锅完整流程，带 Python 实现代码 |

### 🔧 技术 Tech

各种开发效率、代理配置技术方案

| 项目 | 描述 |
|------|------|
| [cloudflare-openai-gemini-proxy](./cloudflare-openai-gemini-proxy/) | 基于 Cloudflare Workers 的 OpenAI/Gemini API 转发代理，解决国内访问问题 |
| [volcengine](./volcengine/) | 火山引擎相关配置和示例 |
| [openclaw-wechat-publication-flow](./openclaw-wechat-publication-flow/) | OpenClaw生成和发布微信公众号文章完整流程总结，带流程图 |
| [llm-api-apply-guide](./llm-api-apply-guide/) | 国内各大LLM API申请和使用流程汇总，包含申请步骤、价格对比、OpenClaw配置示例 |
| [ssl-network-request](./ssl-network-request/) | 网络请求过程中 SSL 相关知识详细总结，包含完整流程图，好理解不晦涩 |
| [quiche](./quiche/) | Cloudflare quiche 代码库详细功能性文档，分模块讲解功能分区、状态机、模块串联，从架构到流程完整梳理 |
| [google-quiche](./google-quiche/) | Google QUICHE 代码详细功能性文档，源自 Chromium，分模块讲解功能分区、状态机、完整调用链 |

---

## 💡 特色

- **程序员友好** → 用代码、注释、类、方法的思维讲解做菜流程，看完就能跑
- **AI 辅助生成** → 由 AI 帮忙生成内容，人工审核味道正确性
- **可运行** → 复制代码就能"编译"，按步骤走不会错
- **可扩展** → 模块化设计，想加什么料自己加参数就行

---

## 🚀 怎么用

1. 找到你想吃的菜，打开对应 markdown 文件
2. 按"环境准备"买好食材，相当于 `npm install`
3. 按步骤一步步执行，出了错看 Debug 章节，相当于 `console.log`
4. 出锅开吃，就是 `npm run build` 成功

---

## 🤝 贡献

欢迎贡献更多程序员风格菜谱，提 PR 就行。要求：

- 格式保持一致，代码+讲解配图
- 味道本人亲测过好吃，别把奇怪的黑暗料理放进来
- 分类放对目录，早餐放 breakfast，主食放 staple，等等

---

## 📄 许可证

MIT License — 随便用，就是别拿去卖钱。
