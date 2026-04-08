# OpenClaw 接入火山引擎 Coding Plan 完整指南

本文档详细介绍如何在 OpenClaw 中接入火山方舟 Coding Plan，包含完整步骤和常见问题排查。

## 前置准备

1. 已有火山引擎账号并开通 Coding Plan 服务
2. 已部署 OpenClaw（版本要求 2026.2.26 或更新）
3. Node.js v18 或更高版本

## 第一步：获取 Coding Plan 核心参数

登录火山方舟控制台获取必要信息：

### 1. API Key
- 前往 [API Key 管理页面](https://console.volcengine.com/ark/region:ark+cn-beijing/apikey)
- 复制你的 API Key

### 2. 正确的 Base URL
✅ **正确**（Coding Plan 专用）：
```
https://ark.cn-beijing.volces.com/api/coding/v3
```

❌ **错误**（在线推理接口，会产生额外费用）：
```
https://ark.cn-beijing.volces.com/api/v3
```

### 3. 支持的 Model Name（必须使用以下名称）

| Model Name | 上下文窗口 | 最大输出 | 支持多模态 |
|------------|-----------|---------|-----------|
| `ark-code-latest` | 256k | 32k | ✅ |
| `doubao-seed-2.0-code` | 256k | 128k | ✅ |
| `doubao-seed-2.0-pro` | 256k | 128k | ✅ |
| `doubao-seed-2.0-lite` | 256k | 128k | ✅ |
| `doubao-seed-code` | 256k | 32k | ✅ |
| `minimax-m2.5` | 200k | 128k | ❌ |
| `glm-4.7` | 200k | 128k | ❌ |
| `deepseek-v3.2` | 128k | 32k | ❌ |
| `kimi-k2.5` | 256k | 32k | ✅ |

> ⚠️ **重要提醒**：请勿填写在线推理的 Model ID，例如 `doubao-seed-2-0-pro-260215` 这种格式是错误的。

> `ark-code-latest` 推荐使用，可以在火山方舟控制台在线切换具体模型，切换后 3-5 分钟生效。

## 第二步：修改 OpenClaw 配置文件

### 编辑 `~/.openclaw/openclaw.json`

```bash
vim ~/.openclaw/openclaw.json
```

完整配置示例：

```json
{
  "models": {
    "providers": {
      "volcengine-plan": {
        "baseUrl": "https://ark.cn-beijing.volces.com/api/coding/v3",
        "apiKey": "<替换成你的ARK_API_KEY>",
        "api": "openai-completions",
        "models": [
          {
            "id": "ark-code-latest",
            "name": "ark-code-latest",
            "contextWindow": 256000,
            "maxTokens": 32000,
            "input": ["text", "image"]
          },
          {
            "id": "doubao-seed-2.0-code",
            "name": "doubao-seed-2.0-code",
            "contextWindow": 256000,
            "maxTokens": 128000,
            "input": ["text", "image"]
          },
          {
            "id": "doubao-seed-2.0-pro",
            "name": "doubao-seed-2.0-pro",
            "contextWindow": 256000,
            "maxTokens": 128000,
            "input": ["text", "image"]
          },
          {
            "id": "doubao-seed-2.0-lite",
            "name": "doubao-seed-2.0-lite",
            "contextWindow": 256000,
            "maxTokens": 128000,
            "input": ["text", "image"]
          },
          {
            "id": "doubao-seed-code",
            "name": "doubao-seed-code",
            "contextWindow": 256000,
            "maxTokens": 32000,
            "input": ["text", "image"]
          },
          {
            "id": "minimax-m2.5",
            "name": "minimax-m2.5",
            "contextWindow": 200000,
            "maxTokens": 128000,
            "input": ["text"]
          },
          {
            "id": "glm-4.7",
            "name": "glm-4.7",
            "contextWindow": 200000,
            "maxTokens": 128000,
            "input": ["text"]
          },
          {
            "id": "deepseek-v3.2",
            "name": "deepseek-v3.2",
            "contextWindow": 128000,
            "maxTokens": 32000
          },
          {
            "id": "kimi-k2.5",
            "name": "kimi-k2.5",
            "contextWindow": 256000,
            "maxTokens": 32000,
            "input": ["text", "image"]
          }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "volcengine-plan/ark-code-latest"
      },
      "models": {
        "volcengine-plan/ark-code-latest": {},
        "volcengine-plan/doubao-seed-2.0-code": {},
        "volcengine-plan/doubao-seed-2.0-pro": {},
        "volcengine-plan/doubao-seed-2.0-lite": {},
        "volcengine-plan/doubao-seed-code": {},
        "volcengine-plan/minimax-m2.5": {},
        "volcengine-plan/glm-4.7": {},
        "volcengine-plan/deepseek-v3.2": {},
        "volcengine-plan/kimi-k2.5": {}
      }
    }
  },
  "gateway": {
    "mode": "local"
  }
}
```

> 🔖 根据你的需求，可以只保留需要用到的模型，不需要全部配置。

## 第三步：处理 models.json（最容易踩坑）

OpenClaw 有两个配置文件：
- `~/.openclaw/openclaw.json` - 主配置，用户编辑
- `~/.openclaw/agents/main/agent/models.json` - 自动生成，但优先级更高

**为什么修改后不生效？**
> 首次配置后，OpenClaw 会将信息写入 `models.json`，后续修改 `openclaw.json` 不会自动覆盖 `models.json`，导致旧配置仍然生效。

### 推荐解决方案（最简单）

备份后删除 `models.json`，重启网关会自动重新生成：

```bash
# 备份
mv ~/.openclaw/agents/main/agent/models.json ~/.openclaw/agents/main/agent/models.json.bak

# 重启服务
openclaw gateway restart
```

### 手动修改方案

如果你想手动修改，需要同时检查两个文件中的以下参数：
- `baseUrl` - 必须是 `/api/coding/v3` 结尾
- `model id/name` - 必须是 Coding Plan 支持的名称（见上表）
- `apiKey` - 必须正确

## 第四步：重启服务生效

```bash
openclaw gateway restart
```

等待 10-20 秒，服务启动完成后，发送 `/status` 查看状态，确认模型加载成功。

## 常见问题排查

### 问题 1：404 The model or endpoint does not exist or you do not have access to it

**原因**：Base URL 配置错误

**解决**：
1. 检查 `~/.openclaw/openclaw.json` 和 `~/.openclaw/agents/main/agent/models.json` 两个文件
2. 确认 `baseUrl` 是 `https://ark.cn-beijing.volces.com/api/coding/v3`
3. 确保不是 `https://ark.cn-beijing.volces.com/api/v3`（少了 `/coding`）
4. 修改后执行 `openclaw gateway restart`

### 问题 2：404 The xxxxxx model does not support the coding plan feature

**原因**：Model Name 配置错误，用了在线推理的 ID

**解决**：
1. 检查两个配置文件中的 `id` 和 `name`
2. 必须使用本文档表格中的正确名称，例如 `doubao-seed-2.0-pro`
3. ❌ 不能使用 `doubao-seed-2-0-pro-260215` 这种在线推理 ID
4. 修改后重启服务

### 问题 3：401 The API key format is incorrect

**原因**：API Key 错误或格式不正确

**解决**：
1. 重新从控制台复制 API Key
2. 检查配置文件中是否有多余的引号或空格
3. 如果使用环境变量，确认环境变量值正确
4. 检查两个配置文件中的 API Key 是否一致

### 问题 4：修改配置后不生效，仍然走按量计费

**原因**：`models.json` 中还是旧的在线推理配置

**解决**：
```bash
# 删除 models.json 让系统重新生成
rm ~/.openclaw/agents/main/agent/models.json
openclaw gateway restart
```

### 问题 5：400 Total tokens of image and text exceed max message tokens

**原因**：上下文超出最大限制

**解决**：
- 输入 `/status` 查看当前上下文占用
- 输入 `/compact` 压缩上下文
- 如果还是不行，输入 `/new` 新建会话
- 检查是否加载了过大的技能文档

### 问题 6：API rate limit reached. Please try again later

**原因**：达到速率限制

**解决**：
- 稍等几分钟再试
- 查看 [官方排障文章](https://developer.volcengine.com/articles/7618480646865682473) 了解更多

## 验证配置是否成功

发送 `/status` 命令，应该能看到类似：

```
model: volcengine-plan/ark-code-latest (default)
provider: volcengine-plan
baseUrl: https://ark.cn-beijing.volces.com/api/coding/v3
```

确认 `baseUrl` 包含 `/coding`，说明配置正确。

## 参考链接

- [火山引擎官方文档 - OpenClaw 配置](https://www.volcengine.com/docs/82379/2183190?lang=zh)
- [官方实践指南](https://developer.volcengine.com/articles/7615528054736945158)
- [获取 API Key](https://console.volcengine.com/ark/region:ark+cn-beijing/apikey)
- [Coding Plan 开通管理](https://console.volcengine.com/ark/region:ark+cn-beijing/openManagement?LLM=%7B%7D&advancedActiveKey=subscribe)

## 总结

接入要点口诀：
1. Base URL 要带 `/coding`
2. Model Name 要用表格里的正确名称
3. 两个配置文件都要检查，或者删除 `models.json` 重新生成
4. 修改完一定要重启网关

按照这个流程操作，99% 的问题都可以避免。
