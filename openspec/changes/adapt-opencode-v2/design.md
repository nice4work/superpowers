## Context

当前 OpenCode 安装路径由 `lib/init.js` 与 `lib/jsonc.js` 实现：

- 只识别和写入 V1 的 `"plugin"` 键。
- `init` 会把整个 `skills/` 复制到项目的 `.opencode/skills/`。
- 配置定位只查找 `opencode.json`，不查找 `.opencode/opencode.json` 或 `.jsonc`。
- 没有 `update` 命令，也没有 V1 → V2 迁移路径。

插件运行时本身已经兼容 OpenCode 2.0：`setup(ctx)` 从安装包的 `skills/` 读取技能，并通过 `ctx.skill.transform` 注册到当前项目。已在本机 `opencode 2.0.32` 验证：

- `/api/plugin` 中 `superpowers` 为 `active`。
- `/api/skill` 返回 15 个 Superpowers 技能。
- 仓库没有 `.opencode/skills/`，技能路径来自插件缓存包。

关键问题：项目内 `.opencode/skills` 的优先级高于插件注册。临时项目验证中，同名 `brainstorming` 的最终 `path` 指向项目的 `.opencode/skills/brainstorming/SKILL.md`。因此只迁移配置、不处理副本，用户会继续加载旧技能。

约束：

- CLI 保持零新增依赖，仅使用 Node.js 标准库。
- `update` 不联网。
- 必须保留 JSONC 注释、缩进和尾逗号。
- 只修改顶层键，不能误伤嵌套对象。
- 删除技能副本前必须确认 V2 插件条目已经写入成功。

## Goals / Non-Goals

**Goals:**

- 新项目的 `init` 在 OpenCode 2.0 上写入原生 `"plugins"` 配置，并启用共享技能。
- 旧项目通过 `update` 一次性迁移到 V2，并删除会遮蔽共享技能的旧副本。
- `init` / `update` 都是幂等的、可重复执行的。
- 迁移失败时配置保持原样，不删除任何技能目录。

**Non-Goals:**

- 不在 `update` 中拉取最新插件版本或执行网络请求。
- 不自动清理全局 `~/.config/opencode` 下的旧 symlink 安装。
- 不迁移 `superpowers` 以外的技能或插件。
- 不改变插件运行时的 V1 兼容入口；本次只改 CLI 与安装形态。
- 不处理 OpenCode 1.x 的新安装输出；命令只面向 V2。

## Decisions

### 1. 技能完全共享，不再复制

**选择**：`init` 不写 `.opencode/skills`；技能由插件包的 `setup(ctx)` 注册。

**理由**：

- 插件已经把包内 `skills/*/SKILL.md` 注册进当前项目。
- 项目副本优先级更高，会遮蔽包内技能，导致更新失效。
- 避免每个项目提交 15 个技能目录及其 references/scripts。

**替代方案**：

- 继续复制并在 `update` 中刷新副本：会造成“CLI 版本、插件缓存版本、项目副本版本”三份状态，复杂且容易不同步。
- 只复制用户定制的技能：可作为后续增强，而不是默认行为。

### 2. init 检测到旧安装时自动转交 update

**选择**：`init` 发现 V1 `"plugin"`、`"plugins"` 已存在但需要合并、或 `.opencode/skills` 有旧副本时，输出“检测到旧安装，正在迁移”，并执行与 `update` 相同的迁移流程。

**理由**：

- 用户不需要记住两个命令的差异。
- 避免 `init` 在旧项目上只报错，留下半迁移状态。

**替代方案**：

- `init` 只处理全新项目，旧项目报错并提示运行 `update`：边界更清晰，但用户容易卡住。

### 3. update 直接删除已知技能副本

**选择**：对 `.opencode/skills/<id>` 中已知的 Superpowers 技能 ID 递归删除；不备份；提供 `--keep-skills` 跳过。

**理由**：

- 用户明确要求直接删除。
- 副本是旧 `init` 生成的，保留会让共享技能继续被遮蔽。
- 备份会永久增加项目目录体积，且用户已确认不需要。

**风险控制**：

- 只删除包内 `skills/` 中存在的技能 ID。
- 不删除未知目录、用户新增技能、其他插件的技能。
- 只有配置写入成功且确认 `plugins` 中存在 Superpowers 条目后才删除。
- `--keep-skills` 与 `--dry-run` 可以在删除前检查影响范围。

### 4. 配置定位

**选择**：从当前目录向上查找，按以下顺序识别：

1. `opencode.json`
2. `opencode.jsonc`
3. `.opencode/opencode.json`
4. `.opencode/opencode.jsonc`

同一目录存在多个时，优先 `.opencode/` 下的配置（V2 中优先级更高），并输出提示。

**理由**：

- V2 支持 `.opencode/opencode.json(c)`，当前实现只找 `opencode.json`。
- 与 OpenCode 的配置发现方向一致：从当前目录向上。

**替代方案**：

- 只支持 `opencode.json`：会漏掉 V2 项目。
- 同时修改所有找到的配置：容易造成重复注入和覆盖。

如果完全没有配置，但存在旧技能副本，`update` 会在当前目录创建 `opencode.json`，再执行迁移；这与 `init` 的创建行为一致。

### 5. JSONC 编辑器

**选择**：实现一个小型扫描器，代替当前的正则拼接。

扫描器需要：

- 跟踪字符串、行注释、块注释、括号深度。
- 只识别顶层对象键。
- 返回键值对的起止位置。
- 支持数组中的字符串和对象条目。
- 写入前做一次宽松校验：去掉注释与尾逗号后能被 `JSON.parse`。
- 校验失败时不写文件。

**理由**：

- 现有 `findPluginArrayEnd` 只处理 `"plugin"`，无法安全处理 `"plugins"`、两个键并存或对象条目。
- 引入 JSONC 解析依赖会破坏零依赖约束。

### 6. Superpowers 条目识别

**选择**：由 `lib/plugin-entry.js` 统一识别与归一化，不能只比较完整 URL。

需识别：

- `superpowers@git+https://github.com/obra/superpowers.git`
- `superpowers@git+https://github.com/nice4work/superpowers.git`
- 带 `#v7.0.0`、`#main` 或 commit 的 git URL
- `@nice4work/superpowers`
- 对象形式 `{ package: "...", options: ... }`

迁移规则：

- 已存在等价条目：不重复添加。
- 旧 `obra` 条目：保留来源，只迁移键名；除非需要替换 V1-only pin。
- `#v6.3.0` 及更早：替换为当前 `PLUGIN_URL`，因为 V2 需要 v6.4.1+。
- 非 semver 的 ref（分支或 commit）：保留并输出警告，无法判断是否为 V1-only。

### 7. 写入与删除顺序

**选择**：先配置、后删除。

顺序：

1. 读取并校验配置。
2. 生成迁移计划。
3. 原子写入配置（临时文件 + rename）。
4. 重新读取并确认顶层 `plugins` 中存在 Superpowers 条目。
5. 删除已知技能副本。
6. 输出摘要与重启指引。

任何一步失败都中止后续步骤。配置迁移失败时绝不删除技能目录。

### 8. update 不联网

**选择**：`update` 只操作本地文件。

- 不执行 `git fetch`、`npm install` 或 OpenCode 包安装。
- 不尝试解析远程最新版本。
- 刷新插件代码由 OpenCode/Bun 的包管理负责。
- 最后输出 `opencode service restart` 和必要时清理包缓存的指引。

**理由**：用户明确要求本地迁移；联网会引入超时、认证、代理和版本比较问题。

### 9. 全局旧安装只报告

**选择**：检测以下路径，但只输出清理命令，不自动删除：

- `~/.config/opencode/plugins/superpowers.js`
- `~/.config/opencode/skills/superpowers`
- `~/.config/opencode/superpowers`

**理由**：全局目录可能被多个项目共享，自动删除影响面超出当前项目。

### 10. 打包与依赖

- `package.json` 的 `files` 加入 `index.js`，否则 npm 包缺少目录形式入口。
- 删除 `.opencode/package.json` 中未使用的 `@opencode-ai/plugin` 依赖；插件运行时是零依赖纯 JavaScript。
- 保留 `main` 指向 `.opencode/plugins/superpowers.js`，并为目录形式提供 `index.js`。

## Risks / Trade-offs

- **[风险] 用户自定义的同名技能会被直接删除**
  → 缓解：只删除已知 ID；提供 `--keep-skills` 和 `--dry-run`；文档明确说明。

- **[风险] JSONC 扫描器实现不完整，破坏配置**
  → 缓解：表驱动单测覆盖注释、尾逗号、对象条目、嵌套同名键；写入前宽松校验；失败不写。

- **[风险] CLI 版本与 OpenCode 缓存中的插件版本不一致**
  → 缓解：`update` 输出当前 CLI 版本与配置中的插件引用；不尝试猜测缓存版本；提示重启后验证 `/api/skill` 路径。

- **[风险] V1-only pin 使用 commit 而不是 tag，无法判断**
  → 缓解：保留并警告；文档建议改为 `PLUGIN_URL` 或 `#v6.4.1+`。

- **[风险] 删除副本后插件加载失败，项目暂时没有技能**
  → 缓解：删除前确认 `plugins` 已写入；失败时提示检查插件日志；不删除非 Superpowers 技能。

- **[权衡] `init` 自动转交 update 会删除副本**
  → 接受：输出明确迁移信息；提供 `--keep-skills`。

## Migration Plan

1. 发布包含新 CLI 的版本。
2. 新项目执行 `superpowers init`：写入 V2 `plugins`，不复制技能。
3. 旧项目执行 `superpowers update`：
   - 迁移 `plugin` → `plugins`
   - 删除旧技能副本
   - 输出重启/清缓存指引
4. 重启 OpenCode，验证：
   - `/api/plugin` 中 `superpowers` 为 `active`
   - `/api/skill` 中技能路径指向插件缓存包，而不是项目 `.opencode/skills`
5. 回滚：恢复迁移前的配置文件；技能副本按用户要求不备份，因此自定义同名技能需要在执行前自行备份或使用 `--keep-skills`。

## Open Questions

- 无阻塞问题。`skills.paths` 的 V1 → V2 数组归一化不在本次范围；`update` 只检测并提示指向 Superpowers 的旧路径，不自动修改。
