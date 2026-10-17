## MODIFIED Requirements

### Requirement: CLI accepts init command

系统 SHALL 提供 `superpowers init` 命令，用于为当前项目启用 Superpowers 的共享技能。

#### Scenario: Run init with no arguments
- **WHEN** 用户在终端执行 `superpowers init`
- **THEN** 系统从当前目录向上查找 OpenCode 配置
- **THEN** 找到配置后确保顶层 `plugins` 中存在 Superpowers 条目
- **THEN** 不向项目写入 `.opencode/skills` 副本

#### Scenario: Run init in directory without config
- **WHEN** 用户在当前目录及其祖先目录中都没有 OpenCode 配置
- **THEN** 系统在当前目录创建 `opencode.json`
- **THEN** 新文件使用 V2 的 `plugins` 键并包含 Superpowers 条目

#### Scenario: Run init with dry-run
- **WHEN** 用户执行 `superpowers init --dry-run`
- **THEN** 系统输出将要修改的配置和将要删除的技能副本
- **THEN** 系统不写入任何文件，也不删除任何目录

#### Scenario: Unknown subcommand
- **WHEN** 用户执行 `superpowers unknown-cmd`
- **THEN** 系统输出用法提示并以非零退出码退出

### Requirement: Inject plugin entry into opencode.json

系统 SHALL 向顶层 `plugins` 数组中追加当前 Superpowers 条目，而不是写入 V1 的 `plugin` 键。

#### Scenario: Plugins field exists and is an array
- **WHEN** 配置包含 `"plugins": ["other-plugin"]`
- **THEN** 系统保留 `other-plugin` 并追加 Superpowers 条目
- **THEN** 文件中其他字段、缩进、注释和尾逗号保持不变

#### Scenario: Plugins field does not exist
- **WHEN** 配置不包含 `plugins` 字段
- **THEN** 系统在顶层对象中新增 `"plugins": ["<Superpowers 条目>"]`
- **THEN** 系统不创建 `plugin` 键

#### Scenario: Plugins field exists but is empty
- **WHEN** 配置包含 `"plugins": []`
- **THEN** 系统将 Superpowers 条目写入该数组

#### Scenario: Plugins array contains object entries
- **WHEN** `plugins` 中包含 `{ "package": "...", "options": { ... } }` 形式条目
- **THEN** 系统原样保留该对象，不将其转换为字符串

#### Scenario: Legacy plugin field exists
- **WHEN** 配置包含 V1 的 `"plugin": [...]`
- **THEN** 系统输出“检测到旧安装，正在迁移”
- **THEN** 系统执行与 `superpowers update` 相同的迁移流程
- **THEN** 迁移完成后配置只使用顶层 `plugins`

### Requirement: Idempotent installation

系统 SHALL 识别已安装的 Superpowers 条目，避免重复注入。

#### Scenario: Superpowers already installed
- **WHEN** 配置的 `plugins` 中已包含 Superpowers 条目
- **THEN** 系统输出已启用状态并以零退出码退出
- **THEN** 系统不修改文件

#### Scenario: Run init twice
- **WHEN** 用户连续两次执行 `superpowers init`
- **THEN** 第一次执行写入条目
- **THEN** 第二次执行检测到已安装并跳过

#### Scenario: Existing entry uses an older URL or pin
- **WHEN** 配置中已包含 `obra/superpowers`、带版本 pin 或对象形式的 Superpowers 条目
- **THEN** 系统将其识别为已安装，不重复追加

### Requirement: Preserve JSONC formatting

系统 SHALL 在修改配置时保留 JSONC 格式，包括注释、缩进和尾逗号。

#### Scenario: File contains comments
- **WHEN** 配置包含 `//` 行注释或 `/* */` 块注释
- **THEN** 修改完成后所有注释仍然存在且位置不变

#### Scenario: File contains trailing commas
- **WHEN** 配置包含 JSONC 风格的尾逗号
- **THEN** 修改完成后尾逗号保持不变

#### Scenario: Nested plugin field exists
- **WHEN** 配置中某个嵌套对象包含名为 `plugin` 的字段
- **THEN** 系统只修改顶层键，不修改嵌套字段

#### Scenario: File cannot be validated
- **WHEN** 修改后的内容无法通过宽松 JSONC 校验
- **THEN** 系统输出错误并以非零退出码退出
- **THEN** 原文件保持不变

### Requirement: Success feedback

系统 SHALL 在启用成功后输出明确的操作结果和下一步指引。

#### Scenario: Successful installation
- **WHEN** `superpowers init` 成功完成
- **THEN** 系统输出已修改的配置路径
- **THEN** 系统输出写入的 Superpowers 条目
- **THEN** 系统说明技能由插件共享注册，不会复制到项目
- **THEN** 系统提示重启 OpenCode，并在需要时运行 `opencode service restart`

## ADDED Requirements

### Requirement: Legacy installs are delegated to update

系统 SHALL 在 `init` 检测到旧安装时自动执行迁移，而不是只输出错误。

#### Scenario: Init finds V1 plugin configuration
- **WHEN** `init` 发现顶层 `plugin` 键
- **THEN** 系统输出“检测到旧安装，正在迁移”
- **THEN** 系统执行 `update` 的配置迁移与技能副本清理流程

#### Scenario: Init finds legacy skill copies
- **WHEN** `.opencode/skills` 中存在已知 Superpowers 技能目录
- **THEN** 系统执行 `update` 的副本清理流程
- **THEN** 系统在输出中列出被删除的目录

#### Scenario: User keeps legacy copies
- **WHEN** 用户执行 `superpowers init --keep-skills`
- **THEN** 系统仍迁移配置
- **THEN** 系统不删除 `.opencode/skills` 中的任何目录

### Requirement: Config writes are safe

系统 SHALL 以原子方式写入配置，并在失败时保留原文件。

#### Scenario: Write is interrupted
- **WHEN** 写入过程中发生错误
- **THEN** 原配置文件保持完整
- **THEN** 系统不留下半写入的临时文件

#### Scenario: Existing config is overwritten
- **WHEN** 系统需要修改已有配置
- **THEN** 系统在写入前保留一份配置备份
- **THEN** 系统保持原文件的权限
