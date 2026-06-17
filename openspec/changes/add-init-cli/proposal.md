## Why

OpenCode 是唯一需要手动编辑 `opencode.json` 才能安装 superpowers 的 harness——用户必须找到文档、复制 JSON 片段、粘贴到配置文件、重启。Claude Code、Codex、Gemini CLI 都提供了命令式安装。这降低了 OpenCode 用户的安装成功率，也与项目"一行命令搞定"的体验目标不符。

## What Changes

- `package.json` 新增 `bin` 字段，入口指向 `bin/cli.js`
- 新增 `bin/cli.js`：CLI 入口，解析命令和参数
- 新增 `lib/init.js`：核心逻辑——定位 `opencode.json` → 幂等检查 → 注入 plugin 条目 → 写回
- 新增 `lib/jsonc.js`：轻量 JSONC 注入工具，字符串级别操作，保留注释和格式
- `superpowers init` 命令：在当前项目或全局配置中注入 superpowers plugin 条目
- 零新依赖，纯 Node.js 标准库实现

## Capabilities

### New Capabilities

- `cli-init`：命令行初始化能力。用户通过 `npx superpowers init`（或 `node bin/cli.js init`）一键将 superpowers 注入到 OpenCode 配置文件，无需手动编辑 JSON。

### Modified Capabilities

<!-- 无现有能力被修改 -->

## Impact

- **`package.json`**：新增 `"bin"` 字段，增加 `"exports"` 以区分 CLI 和 plugin 入口
- **新增文件**：`bin/cli.js`（~30 行）、`lib/init.js`（~60 行）、`lib/jsonc.js`（~40 行）
- **依赖**：零新增依赖，仅使用 Node.js 标准库（`fs/path/process`）
- **破坏性变更**：无。现有 plugin 行为完全不变
- **测试**：新增 `tests/opencode/test-init-cli.sh` 覆盖核心场景
