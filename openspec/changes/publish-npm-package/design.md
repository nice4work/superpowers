## Context

`add-init-cli` 实现了 `superpowers init` 命令行工具，但包名仍为 `superpowers`（已被 npm 占用），注入的 Git URL 指向 `obra/superpowers`。需要迁移到 `@nice4work/superpowers` 命名空间并发布到 npm。

当前 `package.json` 仅含 `name`、`version`、`type`、`main`、`bin` 五个字段，缺少 npm 发布所需的标准元数据。

## Goals / Non-Goals

**Goals:**
- 包名改为 `@nice4work/superpowers`，发布到 npm public registry
- Git URL 改为 `nice4work/superpowers`
- 通过 `files` 白名单精确控制发布内容
- `npm install -g @nice4work/superpowers` 后 `superpowers init` 全局可用

**Non-Goals:**
- 不修改 CLI 行为逻辑（init 流程、技能复制逻辑不变）
- 不调整 `skills/` 目录内容
- 不添加测试或文档变更（仅发布所需的最小改动）
- 不在 npm 上设置 CI/CD 自动发布

## Decisions

### 1. 包名：`@nice4work/superpowers`

**理由**：`superpowers` 裸名已被 `01studio` 占用（0.0.2 占位包）。`@nice4work` 是用户已有的 npm scope，语义清晰。

**替代方案**：
- `superpowers-cli` — 去 scope 化但名字偏长
- `@obra/superpowers` — 原仓库 org，但用户无权限

### 2. 发布方式：`npm publish --access public`

**理由**：scoped 包默认 private，需显式设置。使用 `publishConfig.access: "public"` 避免每次传参。

### 3. 文件控制：`files` 白名单

**理由**：白名单比 `.npmignore` 更安全——漏掉的文件不会被意外发布。`files` 字段列出的路径自动包含，其余排除（仅 `package.json`、`README.md`、`LICENSE` 等 npm 约定的文件例外）。

白名单：
```json
"files": ["bin/", "lib/", "skills/", ".opencode/plugins/", ".opencode/package.json"]
```

**排除**：`tests/`、`docs/`、`openspec/`、`.github/`、hooks、scripts、assets、各 harness 的插件 manifest 等。

### 4. Git URL：单一常量 `PLUGIN_URL`

**理由**：`PLUGIN_URL` 已在 `lib/jsonc.js` 中定义为导出常量，`lib/init.js` 复用。只需修改一处即可全局生效。

### 5. 仓库地址

`package.json` 的 `repository` 字段指向 `https://github.com/nice4work/superpowers.git`。需确保该仓库存在（可 fork 自 `obra/superpowers`）。

## Risks / Trade-offs

- **[风险] GitHub 仓库 `nice4work/superpowers` 不存在**
  → 缓解：先 fork/mirror 再发布；若仓库暂不可用，`repository` 字段仅用于 npm 页面展示，不影响功能

- **[风险] `.opencode/package.json` 含 `@opencode-ai/plugin` SDK 依赖**
  → 缓解：CLI 不依赖它（仅用标准库）；OpenCode 安装 plugin 时自行解析依赖。发布时该文件随 `files` 一起打包

- **[风险] 版本号从 `5.1.0` 起步与 `obra/superpowers` 连续**
  → 接受：对 npm 而言是首次发布，版本号延续原有迭代历史

## Open Questions

- 是否需要同时更新 `README.md` 中的安装命令和链接？（倾向：单独 PR，不在本次 change 中处理）
