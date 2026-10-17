## Why

`superpowers init` 目前写入 OpenCode 1.0 的 `"plugin"` 键，并把整套技能复制到项目的 `.opencode/skills/`。在 OpenCode 2.0 上，项目副本的优先级高于插件注册的共享技能：用户即使更新了插件，项目仍然加载旧副本。同时 V2 原生配置应使用 `"plugins"`，旧配置需要一条明确的迁移路径。

## What Changes

- `superpowers init` 改为写入 V2 `"plugins"`，不再复制技能；检测到旧安装时自动转交 `update`。
- 新增 `superpowers update`：本地迁移，不联网。
  - `"plugin"` → `"plugins"`
  - 合并两个键并去重
  - 替换 V2 无法加载的旧版本 pin（`#v6.3.0` 及更早）
  - 直接删除项目内已知的 Superpowers 技能副本
  - 输出重启 / 清缓存指引
- 配置编辑器支持顶层 `plugin` / `plugins`、JSONC 注释与尾逗号、对象形式插件条目；只修改顶层键。
- 配置定位支持 `opencode.json(c)` 与 `.opencode/opencode.json(c)`。
- 技能改为完全共享：由插件包通过 `ctx.skill.transform` 注册，项目不再保存副本。
- `package.json` 的 `files` 加入 `index.js`；移除未使用的 V1 SDK 依赖。
- 更新 OpenCode 安装文档与测试，新增 OpenCode 2.0 集成验证。
- **BREAKING**：`init` 不再创建 `.opencode/skills`；`update` 会直接删除已知 Superpowers 技能副本（提供 `--keep-skills` 跳过）。

## Capabilities

### New Capabilities

- `cli-update`：将 OpenCode 1.0 安装迁移到 2.0，并切换到共享技能。
- `shared-skills`：技能由插件包统一注册，项目不再保存副本。

### Modified Capabilities

- `cli-init`：init 写入 V2 `plugins`、不复制技能、旧安装自动转交 update。

## Impact

- **CLI 入口**：`bin/cli.js` 增加 `update` 命令解析。
- **配置层**：`lib/jsonc.js` 升级为顶层键扫描器；新增配置定位、条目识别、迁移计划等模块。
- **技能层**：删除 `lib/init.js` 的复制逻辑；新增已知技能 ID 识别与副本删除。
- **打包**：`package.json` 的 `files` 增加 `index.js`；`.opencode/package.json` 移除 `@opencode-ai/plugin` 依赖。
- **文档**：`.opencode/INSTALL.md`、`docs/README.opencode.md`、`README.md` 统一为 V2 优先。
- **测试**：新增 `test-update-cli.sh`、JSONC 迁移单测；更新 `test-init-cli.sh`；新增 OpenCode 2.0 集成验证。
- **破坏性变更**：已有项目的 `.opencode/skills` 副本会被删除；使用自定义同名技能的用户必须使用 `--keep-skills` 或先备份。
