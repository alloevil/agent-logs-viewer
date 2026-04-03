# Agent Logs Viewer

多平台 AI Agent 日志查看面板，支持 **OpenClaw**、**Codex** 和 **Claude Code**。

[English](README.md) | 中文

## 功能特性

- **多平台支持** — 一个界面统一查看 OpenClaw、Codex、Claude Code 的会话日志
- **会话浏览** — 浏览 Agent 列表，搜索/过滤会话，查看消息历史
- **工具调用检查** — 可展开的工具调用详情，包含参数和返回结果
- **Spawn 追踪** — 检测并导航父子 Agent 之间的调用关系
- **消息时间线** — 可视化对话流程图，不同角色用不同颜色标识
- **自动刷新** — 会话列表和消息实时更新
- **设置面板** — 在页面上直接配置各平台目录，保存到 localStorage，无需重启
- **键盘导航** — 使用方向键在会话之间切换

## 快速开始

```bash
git clone https://github.com/alloevil/agent-logs-viewer.git
cd agent-logs-viewer
npm install
npm start
```

打开 http://localhost:3800

## 配置

### 默认目录

| 平台        | 默认路径                      |
|-------------|-------------------------------|
| OpenClaw    | `~/.openclaw/agents`          |
| Codex       | `~/.codex/sessions`           |
| Claude Code | `~/.claude/projects`          |

### 自定义目录

**通过页面设置：** 点击侧边栏的齿轮图标，为每个平台设置自定义路径。保存到 localStorage，无需重启服务。

**通过环境变量：**

```bash
OPENCLAW_DIR=/custom/path/openclaw \
CODEX_DIR=/custom/path/codex \
CLAUDE_CODE_DIR=/custom/path/claude \
npm start
```

**通过 API：** 在任意 API 请求后附加 `?dir=/absolute/path` 参数。

## API

| 接口 | 说明 |
|------|------|
| `GET /api/agents` | 获取 OpenClaw Agent 列表 |
| `GET /api/agents/:name/sessions` | 获取指定 Agent 的会话列表 |
| `GET /api/agents/:name/sessions/:id` | 获取会话消息详情 |
| `GET /api/codex/sessions` | 获取 Codex 会话列表 |
| `GET /api/codex/sessions/:id` | 获取 Codex 会话消息详情 |
| `GET /api/claude-code/sessions` | 获取 Claude Code 会话列表 |
| `GET /api/claude-code/sessions/:id` | 获取 Claude Code 会话消息详情 |
| `GET /api/spawn-map` | 获取 Agent spawn 关系图 |

所有列表和详情接口均支持 `?dir=` 参数来覆盖默认目录。

## 技术栈

- **后端：** Node.js + Express
- **前端：** 单文件 HTML/CSS/JS（无构建步骤，无框架依赖）
- **数据：** 直接从磁盘读取 JSONL 会话文件

## 开源协议

MIT
