## ADDED Requirements

### Requirement: CLI accepts update command

系统 SHALL 提供 `superpowers update` 命令，用于把已有安装迁移到 OpenCode 2.0。

#### Scenario: Run update with no arguments
- **WHEN** 用户执行 `superpowers update`
- **THEN** 系统从当前目录向上查找 OpenCode 配置
- **THEN** 系统在找到的配置中执行 V1 → V2 迁移

#### Scenario: Run update without an existing install
- **WHEN** 配置中不存在任何 Superpowers 条目，也不存在旧技能副本
- **THEN** 系统输出“未找到 Superpowers 安装，请先运行 superpowers init”
- **THEN** 系统以非零退出码退出，不修改文件

#### Scenario: Legacy copies exist without a config
- **WHEN** 当前目录没有 OpenCode 配置，但 `.opencode/skills` 中存在已知 Superpowers 技能副本
- **THEN** 系统在当前目录创建 V2 `opencode.json`
- **THEN** 系统写入 Superpowers `plugins` 条目
- **THEN** 系统删除已知技能副本并输出迁移摘要

#### Scenario: Run update with dry-run
- **WHEN** 用户执行 `superpowers update --dry-run`
- **THEN** 系统输出配置变更和将要删除的技能目录
- **THEN** 系统不写入文件，也不删除目录

#### Scenario: Unknown option
- **WHEN** 用户执行 `superpowers update --unknown`
- **THEN** 系统输出用法提示并以非零退出码退出

### Requirement: Migrate V1 plugin configuration to V2

系统 SHALL 把顶层 `plugin` 键迁移为 `plugins` 键，并保留无关配置。

#### Scenario: Only plugin key exists
- **WHEN** 配置包含 `"plugin": ["a", "b"]`
- **THEN** 系统删除顶层 `plugin`
- **THEN** 系统写入 `"plugins": ["a", "b"]`
- **THEN** 其余字段和格式保持不变

#### Scenario: Both plugin and plugins exist
- **WHEN** 配置同时包含 `plugin` 和 `plugins`
- **THEN** 系统把两个数组的条目合并到 `plugins`
- **THEN** 系统按完整条目去重
- **THEN** 系统删除顶层 `plugin`

#### Scenario: Array contains object entries
- **WHEN** 任一数组包含对象形式的插件条目
- **THEN** 系统原样保留对象，只做条目级去重

#### Scenario: Nested plugin key exists
- **WHEN** 配置的嵌套对象中包含 `plugin` 字段
- **THEN** 系统不修改该嵌套字段

### Requirement: Recognize and normalize Superpowers entries

系统 SHALL 按语义识别 Superpowers 条目，而不是只比较完整字符串。

#### Scenario: Entry uses the upstream URL
- **WHEN** 条目为 `superpowers@git+https://github.com/obra/superpowers.git`
- **THEN** 系统将其识别为 Superpowers 已安装，不重复追加

#### Scenario: Entry uses the fork URL
- **WHEN** 条目为 `superpowers@git+https://github.com/nice4work/superpowers.git`
- **THEN** 系统将其识别为 Superpowers 已安装，不重复追加

#### Scenario: Entry uses a version pin
- **WHEN** 条目包含 `#v7.0.0` 或其他 ref
- **THEN** 系统将其识别为 Superpowers 条目
- **THEN** 系统保留可用的 ref

#### Scenario: Entry uses npm package form
- **WHEN** 条目为 `@nice4work/superpowers` 或对象形式 `{ "package": "@nice4work/superpowers" }`
- **THEN** 系统将其识别为已安装

### Requirement: Replace V1-only version pins

系统 SHALL 替换 V2 无法加载的 Superpowers 版本 pin。

#### Scenario: Pin is v6.3.0 or earlier
- **WHEN** Superpowers 条目包含 `#v6.3.0` 或更早的 semver tag
- **THEN** 系统将条目替换为当前 `PLUGIN_URL`
- **THEN** 系统在输出中说明替换原因

#### Scenario: Pin is v6.4.1 or later
- **WHEN** 条目包含 `#v6.4.1` 或更新的 semver tag
- **THEN** 系统保留该条目不变

#### Scenario: Pin is a branch or commit
- **WHEN** 条目包含 `#main`、分支名或 commit hash
- **THEN** 系统保留该条目
- **THEN** 系统输出警告，提示无法判断是否为 V1-only

### Requirement: Remove legacy skill copies

系统 SHALL 删除项目内会遮蔽共享技能的已知 Superpowers 副本。

#### Scenario: Project contains copied skills
- **WHEN** `.opencode/skills/<id>` 存在且 `<id>` 属于包内已知 Superpowers 技能
- **THEN** 系统递归删除该目录
- **THEN** 系统在输出中列出被删除的目录

#### Scenario: Project contains unrelated skills
- **WHEN** `.opencode/skills` 中存在不属于 Superpowers 的技能目录
- **THEN** 系统保留该目录及其文件

#### Scenario: User keeps copied skills
- **WHEN** 用户执行 `superpowers update --keep-skills`
- **THEN** 系统仍迁移配置
- **THEN** 系统不删除 `.opencode/skills` 中的任何目录
- **THEN** 系统提示这些副本会继续遮蔽共享技能

#### Scenario: No copied skills exist
- **WHEN** 项目没有 `.opencode/skills` 或其中没有已知 Superpowers 技能
- **THEN** 系统不创建该目录
- **THEN** 技能继续由插件共享注册

### Requirement: Safe migration ordering

系统 SHALL 先完成配置迁移，再删除技能副本。

#### Scenario: Config migration fails
- **WHEN** 配置无法解析、无法校验或写入失败
- **THEN** 系统不删除任何技能目录
- **THEN** 系统以非零退出码退出

#### Scenario: Config migration succeeds
- **WHEN** 配置写入成功且顶层 `plugins` 中存在 Superpowers 条目
- **THEN** 系统才执行技能副本删除
- **THEN** 系统输出迁移摘要

#### Scenario: Config write is interrupted
- **WHEN** 写入配置时发生错误
- **THEN** 原配置文件保持完整
- **THEN** 系统不留下半写入的临时文件

### Requirement: Update does not access the network

系统 SHALL 只在本地执行迁移，不发起网络请求。

#### Scenario: Update runs offline
- **WHEN** 用户在无网络环境中执行 `superpowers update`
- **THEN** 系统仍能完成配置迁移和本地副本删除

#### Scenario: Update does not install packages
- **WHEN** `superpowers update` 执行完成
- **THEN** 系统没有执行 `git fetch`、`npm install` 或 OpenCode 包安装
- **THEN** 系统提示用户由 OpenCode/Bun 负责刷新插件代码

### Requirement: Report legacy global installs

系统 SHALL 检测全局旧安装，但不自动修改全局目录。

#### Scenario: Global symlink install exists
- **WHEN** 检测到 `~/.config/opencode/plugins/superpowers.js`
- **THEN** 系统输出该路径和清理建议
- **THEN** 系统不删除该文件

#### Scenario: Global legacy skills directory exists
- **WHEN** 检测到 `~/.config/opencode/skills/superpowers` 或 `~/.config/opencode/superpowers`
- **THEN** 系统输出这些路径和清理建议
- **THEN** 系统不删除这些目录

### Requirement: Success feedback

系统 SHALL 在迁移完成后输出可执行的下一步指引。

#### Scenario: Successful migration
- **WHEN** `superpowers update` 成功完成
- **THEN** 系统输出迁移后的配置路径
- **THEN** 系统列出被删除的技能副本
- **THEN** 系统提示重启 OpenCode
- **THEN** 系统提示必要时运行 `opencode service restart` 或清理 OpenCode 包缓存
- **THEN** 系统提示用 `/api/plugin` 和 `/api/skill` 验证插件与技能来源
