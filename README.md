# 🍳 AI Cookbook

> **给代码农写的 AI 时代工程师实战手册 —— 菜谱、跑模型、看协议、拆源码，都在这里。**

![GitHub last commit](https://img.shields.io/github/last-commit/weilv5/ai-cookbook)
![GitHub repo size](https://img.shields.io/github/repo-size/weilv5/ai-cookbook)
![License](https://img.shields.io/github/license/weilv5/ai-cookbook)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

本仓库存放 AI 辅助生成的程序员实战内容 —— 从代码狗的早餐菜谱，到 QUIC/Cronet/SSL 这类硬核网络协议拆解，再到怎么把各种 LLM API 跑起来。

**统一风格**：像写代码一样写文档 —— 复制就能跑、错有 Debug、参数化可扩展。

---

## 🚀 快速起步

新来者建议按这个顺序读：

1. 🤖 [llm-api-apply-guide](./llm-api-apply-guide/) —— 想用国内大模型 API？先看这一篇
2. ⚙️ [volcengine/openclaw-setup.md](./volcengine/openclaw-setup.md) —— 把 OpenClaw 接入火山方舟 Coding Plan
3. 🌐 [network-packet-analysis](./network-packet-analysis/) —— 网络协议入门，从抓包开始
4. 🥞 [breakfast/jianbing-guozi-recipe.md](./breakfast/jianbing-guozi-recipe.md) —— 跑完代码，吃点正经的

---

## 📚 目录

### 🥪 早餐 Breakfast

> 程序员的胃也要照顾。

| 菜谱 | 难度 | 耗时 | 描述 |
|------|------|------|------|
| [🥞 程序员版正宗煎饼果子](./breakfast/jianbing-guozi-recipe.md) | ⭐ 入门 | 20min | 从环境依赖到出锅完整流程，带 Python 实现代码 |

### 🤖 AI & 大模型

> 怎么把各个大模型 API 用起来 —— 申请流程、价格对比、避坑指南。

| 项目 | 描述 |
|------|------|
| [llm-api-apply-guide](./llm-api-apply-guide/) | 国内主流 LLM（通义千问 / GLM / Kimi / 豆包 / DeepSeek 等）API 申请流程、价格对比 |
| [openclaw-wechat-publication-flow](./openclaw-wechat-publication-flow/) | 用 OpenClaw 生成并发布微信公众号文章完整流程总结，带流程图 |
| [volcengine/openclaw-setup.md](./volcengine/openclaw-setup.md) | OpenClaw 接入火山方舟 Coding Plan 完整指南，含排错步骤 |
| [cloudflare-openai-gemini-proxy](./cloudflare-openai-gemini-proxy/) | 基于 Cloudflare Workers 的 OpenAI/Gemini API 转发代理，解决国内访问问题 |

### 🌐 网络协议 & 抓包

> 把 HTTP/TCP/UDP/QUIC/TLS 这些东西拆开揉碎讲清楚。

| 项目 | 描述 |
|------|------|
| [network-packet-analysis](./network-packet-analysis/) | 网络抓包入门指南，Wireshark 教程，三次握手/四次挥手/QUIC 全覆盖 |
| [ssl-network-request](./ssl-network-request/) | SSL/TLS 握手过程详解、证书体系、性能优化、常见问题 |

### ⚙️ 网络库源码解读

> Cloudflare quiche / Google QUICHE / Chromium Cronet 三件套，分模块逐字看。

| 项目 | 描述 |
|------|------|
| [quiche](./quiche/) | Cloudflare quiche（Rust 实现的 QUIC/HTTP3 库）详细功能文档 |
| [google-quiche](./google-quiche/) | Google QUICHE（Chromium 版）详细功能文档，分模块讲状态机和调用链 |
| [cronet](./cronet/) | Google Cronet（Chromium 抽离的跨平台网络栈）架构 + 模块 + API 完整梳理 |

### 📝 随笔 Essays

> 不写代码也能写的那些文字 —— 风景、心情、凌晨四点的胡思乱想。

| 文章 | 描述 |
|------|------|
| [🌄 山雾散尽时](./essays/morning-mountain-fog.md) | 一份写给代码农的清晨登山说明书，凌晨四点上山看云海的那种执念 |

---

## 💡 特色

- **🎯 程序员友好** → 用代码、注释、类、方法的思维组织内容，看完就能上手
- **🤝 AI 辅助生成 + 人工审核** → AI 帮忙生成草稿，人工核验准确性
- **▶️ 可运行/可执行** → 命令和配置复制就能跑，错了有 Debug 章节兜底
- **🧩 可扩展** → 模块化目录结构，想加什么内容按已有分类加就行

---

## 🚀 怎么用

1. 先看一眼目录，挑你想看的主题（菜谱 / AI / 网络 / 源码 / 随笔）
2. 点进对应目录，按章节顺序读；每章一般都有「是什么 / 怎么做 / 出错了怎么办」
3. 命令和配置示例直接复制就能跑，替换占位符（`<你的 API Key>` 之类）就行
4. 看完有想法就提 Issue / PR

---

## 🤝 贡献

欢迎补充更多内容，提 PR 就行。

**目录约定**：

```
ai-cookbook/
├── breakfast/         # 早餐菜谱
├── volcengine/        # 火山引擎相关
├── openclaw-*/        # OpenClaw 相关
├── network-*/         # 网络协议
├── ssl-*/             # SSL/TLS 相关
├── quiche/            # Cloudflare quiche
├── google-quiche/     # Google QUICHE
├── cronet/            # Google Cronet
└── essays/            # 随笔 / 非技术文章
```

**风格约定**：

- 代码块配注释；复杂步骤配流程图（优先 mermaid）
- 命令行示例可直接复制跑
- 关键章节标签统一：`### ⚙️ 环境准备` / `### 🔨 实施步骤` / `### 🐛 Debug` / `### 📚 参考`
- 内容自己核验过，别把没验证过的东西塞进来

**Commit 前缀规范**：

| 前缀 | 用途 |
|------|------|
| `feat:` | 新增内容（菜谱 / 文档 / 工具） |
| `docs:` | 文档调整、错别字、链接修复 |
| `chore:` | 杂项（目录调整、空文件清理等） |

---

## 📜 更新日志

记录仓库层面的大改动，便于读者快速定位"上次更新了什么"。

### v2.x

- **2026-07-12 (v2.0)** 🎉 README 重塑 + 全仓体检修复
  - README 重新定位为「AI 时代工程师实战手册」
  - 新增 `essays/` 分类，首发《山雾散尽时》
  - 修复 `cloudflare-openai-gemini-proxy` 包名错误和 clone URL 占位符
  - 修复 `llm-api-apply-guide` JSON 示例缺 `]` 和顶部加时效说明
  - 修复 `ssl-network-request` 中 `RT T` typo
  - `openclaw-wechat-publication-flow` 中 `wemp-operator` 状态整理为「🧪 实验性」并移入可选扩展

### v1.x

- **2026-04-14 (v1.0)** 初版 baseline：菜谱 1 篇、LLM API 指南 1 篇、网络协议 / 源码拆解 5 篇、OpenClaw 周边若干

---

## 📄 许可证

MIT License — 随便用，别拿去卖钱就行。

> 最后更新：2026-07-12
