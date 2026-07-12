# 🍳 AI Cookbook

> 给代码农写的 AI 时代工程师实战手册 —— 菜谱、通协议、跑模型的活，都在这里。

![GitHub last commit](https://img.shields.io/github/last-commit/weilv5/ai-cookbook)
![GitHub repo size](https://img.shields.io/github/repo-size/weilv5/ai-cookbook)
![License](https://img.shields.io/github/license/weilv5/ai-cookbook)

本仓库存放 AI 辅助生成的程序员实战内容 —— 从代码狗的早餐菜谱，到 QUIC/Cronet/SSL 这类硬核网络协议拆解，再到怎么把各种 LLM API 跑起来。统一风格：**像写代码一样写文档，复制就能跑**。

---

## 📚 目录

### 🥪 早餐 Breakfast

程序员的胃也要照顾。

| 菜谱 | 难度 | 耗时 | 描述 |
|------|------|------|------|
| [🥞 程序员版正宗煎饼果子](./breakfast/jianbing-guozi-recipe.md) | ⭐ 入门 | 20min | 从环境依赖到出锅完整流程，带 Python 实现代码 |

### 🤖 AI & 大模型

怎么把各个大模型 API 用起来 —— 申请流程、价格对比、避坑指南。

| 项目 | 描述 |
|------|------|
| [llm-api-apply-guide](./llm-api-apply-guide/) | 国内主流 LLM（通义千问 / GLM / Kimi / 豆包 / DeepSeek 等）API 申请流程、价格对比 |
| [openclaw-wechat-publication-flow](./openclaw-wechat-publication-flow/) | 用 OpenClaw 生成并发布微信公众号文章完整流程总结，带流程图 |
| [volcengine/openclaw-setup](./volcengine/openclaw-setup.md) | OpenClaw 接入火山方舟 Coding Plan 完整指南，含排错步骤 |
| [cloudflare-openai-gemini-proxy](./cloudflare-openai-gemini-proxy/) | 基于 Cloudflare Workers 的 OpenAI/Gemini API 转发代理，解决国内访问问题 |

### 🌐 网络协议 & 抓包

把 HTTP/TCP/UDP/QUIC/TLS 这些东西拆开揉碎讲清楚。

| 项目 | 描述 |
|------|------|
| [network-packet-analysis](./network-packet-analysis/) | 网络抓包入门指南，Wireshark 教程，三次握手/四次挥手/QUIC 全覆盖 |
| [ssl-network-request](./ssl-network-request/) | SSL/TLS 握手过程详解、证书体系、性能优化、常见问题 |

### ⚙️ 网络库源码解读

Cloudflare quiche / Google QUICHE / Chromium Cronet 三件套，分模块逐字看。

| 项目 | 描述 |
|------|------|
| [quiche](./quiche/) | Cloudflare quiche（Rust 实现的 QUIC/HTTP3 库）详细功能文档 |
| [google-quiche](./google-quiche/) | Google QUICHE（Chromium 版）详细功能文档，分模块讲状态机和调用链 |
| [cronet](./cronet/) | Google Cronet（Chromium 抽离的跨平台网络栈）架构 + 模块 + API 完整梳理 |

### 📝 随笔 Essays

不写代码也能写的那些文字。

| 文章 | 描述 |
|------|------|
| [🌄 山雾散尽时](./essays/morning-mountain-fog.md) | 一份写给代码农的清晨登山说明书，凌晨四点上山看云海的那种执念 |

---

## 💡 特色

- **程序员友好** → 用代码、注释、类、方法的思维组织内容，看完就能上手
- **AI 辅助生成 + 人工审核** → AI 帮忙生成草稿，人工核验准确性
- **可运行/可执行** → 命令和配置复制就能跑，错了有 Debug 章节兜底
- **可扩展** → 模块化目录结构，想加什么内容按已有分类加就行

---

## 🚀 怎么用

1. 先看一眼目录，挑你想看的主题（菜谱 / AI / 网络 / 源码拆解 / 随笔）
2. 点进对应目录，按章节顺序读，每章一般都有「是什么 / 怎么做 / 出错了怎么办」
3. 命令和配置示例直接复制就能跑，替换占位符就行
4. 看完有想法就提 Issue / PR

---

## 🤝 贡献

欢迎补充更多内容，提 PR 就行。要求：

- 风格一致：图文 + 命令行/代码示例，重要步骤配流程图
- 内容自己核验过，别把没验证过的东西塞进来
- 分类放对目录：菜谱放 `breakfast/`、AI 内容放对应目录、网络协议放对应目录、源码解读按项目分目录 `quiche/` `google-quiche/` `cronet/`

---

## 📄 许可证

MIT License — 随便用，别拿去卖钱就行。