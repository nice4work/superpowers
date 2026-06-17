## Context

当前 superpowers 在 OpenCode 上的安装方式：用户在 `opencode.json` 中手动添加 `plugin` 条目。这是唯一需要手动编辑 JSON 的 harness，Claude Code 有 `claude plugins install`，Codex 有插件商店。用户需要一个等价的 CLI 命令。

约束：superpowers 是零依赖仓库（`package.json` 无 deps），OpenCode 是基于 Bun 的工具，`opencode.json` 支持 JSONC（含注释和尾逗号）。

## Goals / Non-Goals

**Goals:**
- 提供 `superpowers init` 命令，一键注入 superpowers 到 `opencode.json`
- 项目级安装：在当前目录或父目录找到 `opencode.json` 并注入
- 幂等：重复执行不会重复添加
- 保留 JSONC 格式（注释、尾逗号）不做破坏性重写
- 零新依赖，仅用 Node.js 标准库
- 兼容 `npx superpowers init`、`node bin/cli.js init`

**Non-Goals:**
- 不支持全局安装标志（`--global`）——第一版只做项目级
- 不支持卸载（`uninstall`）——超出最小可用范围
- 不支持指定版本（`--version`）——使用默认 `main` 分支
- 不支持其他 harness 的配置注入（Claude Code、Codex 已有各自安装方式）
- 不做 OpenCode 运行时内的 `/plugin install` slash command

## Decisions

### 1. JSONC 处理：字符串注入 vs 全量 parse

**选择**：字符串级别注入，不 parse 整个文件

**理由**：
- `JSON.parse` 无法处理 JSONC（注释、尾逗号）
- 引入 JSONC parser（如 `json5`）破坏零依赖原则
- 注入操作是追加一个固定字符串到 `plugin` 数组，正则匹配即可
- 用字符串操作保留原始格式、缩进、注释，用户体验更好

**替代方案**：
- 用 Node 内置 `JSON.parse` + 预处理去掉注释 → 会丢失格式和注释
- 引入 `json5` 依赖 → 增加包体积，偏离零依赖设计哲学

### 2. CLI 运行时：纯 Node vs Bash

**选择**：Node.js（ESM）

**理由**：
- `package.json` 已是 `"type": "module"`
- JSONC 字符串操作在 JS 中比 bash 可靠得多
- Node `path/fs` 模块天然跨平台，无需担心 macOS/Windows 差异
- 用户调用：`npx superpowers init`（npm 自动下载并执行）

**替代方案**：
- Bash 脚本 → Windows 兼容性差，JSON 解析脆弱
- 编译为 Bun 可执行文件 → 增加构建步骤，无明显收益

### 3. 幂等策略

**选择**：在注入前检查 `plugin` 数组中是否已含 `superpowers` 关键字

**理由**：简单、可靠，避免维护额外的标记文件或 lock 文件。

**替代方案**：
- 写入 `.superpowers-installed` 标记文件 → 容易被意外删除
- 用版本号精确匹配 → URL 可能有 `#branch` 后缀，精确匹配脆弱

### 4. 命令结构

**选择**：`superpowers init`，单一命令，无子命令

**理由**：当前只有安装一个操作，YAGNI。将来可扩展 `superpowers update`、`superpowers list` 等。

### 5. 文件组织

```
bin/cli.js          # 入口：解析参数 → 委托 lib/init.js
lib/init.js         # 核心：定位配置、注入逻辑
lib/jsonc.js        # 工具：JSONC 字符串注入
```

`bin/cli.js` 保持极薄（~30行），核心逻辑在 `lib/init.js` 中便于测试。

## Risks / Trade-offs

- **[风险] 正则注入可能匹配到非 plugin 字段的同名键**
  → 缓解：用 `"plugin"` 带引号的精确匹配，且只在顶层 JSON 对象中搜索

- **[风险] `opencode.json` 格式极其特殊时注入失败**
  → 缓解：失败时给出明确错误信息，建议用户手动添加；不尝试修复格式异常的文件

- **[风险] `bin` 字段与 `main` 字段共存可能导致加载歧义**
  → 缓解：`bin` 指向独立文件，`main` 指向 plugin 入口，两者互不干扰。Bun 和 Node 对此有明确定义

- **[权衡] 仅支持项目级安装，不支持全局**
  → 接受：项目级是最常见场景，全局可在后续迭代中添加

## Open Questions

- `opencode.json` 的文件位置是项目根目录还是 `.opencode/` 下？需确认 OpenCode 的实际发现逻辑（当前假设：当前目录向上查找 `opencode.json`）
- 是否需要在注入后自动触发 `bun install` 预装 plugin？→ 倾向不做，让 OpenCode 首次启动时自动安装
