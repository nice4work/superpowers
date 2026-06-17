## Why

`add-init-cli` 实现了 `superpowers init` 命令，但 CLI 只能通过 `npm link` 本地安装。为了让任何用户都能通过 `npm install -g @nice4work/superpowers` 全局安装并使用，需要将包发布到 npm public registry。同时将品牌从 `obra/superpowers` 迁移到 `nice4work/superpowers`。

## What Changes

- `package.json`：`name` 改为 `@nice4work/superpowers`，新增 `description`、`repository`、`license`、`files`、`publishConfig`
- `lib/jsonc.js`：注入的 Git URL 从 `obra/superpowers` 改为 `nice4work/superpowers`
- `lib/init.js`：创建默认 `opencode.json` 时使用新的 Git URL（通过共享常量 `PLUGIN_URL`）
- 发布流程：`npm publish --access public` 发布到 npm

## Capabilities

### New Capabilities

- `npm-publish`：将 superpowers CLI 发布到 npm public registry 的能力。用户通过 `npm install -g @nice4work/superpowers` 全局安装后即可使用 `superpowers init`。

### Modified Capabilities

- `cli-init`：注入的 Git URL 从 `https://github.com/obra/superpowers.git` 变更为 `https://github.com/nice4work/superpowers.git`

## Impact

- **`package.json`**：多处字段变更（name、repository、files、publishConfig、description、license）
- **`lib/jsonc.js`**：`PLUGIN_URL` 常量值变更
- **无依赖变更**：继续保持零依赖
- **无破坏性变更**：CLI 行为不变，仅 URL 和包名变更
- 需确保 GitHub 仓库 `nice4work/superpowers` 存在（或按需 fork/mirror）
