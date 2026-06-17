## ADDED Requirements

### Requirement: CLI accepts init command

系统 SHALL 提供 `superpowers init` 命令，接受零参数并执行安装流程。

#### Scenario: Run init with no arguments
- **WHEN** 用户在终端执行 `superpowers init`
- **THEN** 系统在从当前目录向上查找 `opencode.json`，找到后注入 superpowers plugin 条目

#### Scenario: Run init in directory without opencode.json
- **WHEN** 用户在不存在 `opencode.json` 的目录中执行 `superpowers init`
- **THEN** 系统输出错误信息 "未找到 opencode.json"，以非零退出码退出

#### Scenario: Unknown subcommand
- **WHEN** 用户执行 `superpowers unknown-cmd`
- **THEN** 系统输出用法提示并退出

### Requirement: Inject plugin entry into opencode.json

系统 SHALL 向 `opencode.json` 的 `plugin` 数组中追加 `"superpowers@git+https://github.com/obra/superpowers.git"` 条目。

#### Scenario: Plugin field exists and is an array
- **WHEN** `opencode.json` 包含 `"plugin": ["other-plugin"]`
- **THEN** 系统修改为 `"plugin": ["other-plugin", "superpowers@git+https://github.com/obra/superpowers.git"]`
- **THEN** 文件中其他字段和格式（缩进、注释、尾逗号）保持不变

#### Scenario: Plugin field does not exist
- **WHEN** `opencode.json` 不包含 `plugin` 字段
- **THEN** 系统在顶层 JSON 对象中新增 `"plugin": ["superpowers@git+https://github.com/obra/superpowers.git"]`
- **THEN** 文件中其他内容保持不变

#### Scenario: Plugin field exists but is empty array
- **WHEN** `opencode.json` 包含 `"plugin": []`
- **THEN** 系统修改为 `"plugin": ["superpowers@git+https://github.com/obra/superpowers.git"]`

### Requirement: Idempotent installation

系统 SHALL 检测 superpowers 是否已安装，若已安装则跳过注入并正常退出。

#### Scenario: Superpowers already installed
- **WHEN** `opencode.json` 的 `plugin` 数组中已包含含 `superpowers` 的条目
- **THEN** 系统输出 "superpowers 已安装"，以零退出码退出，不修改文件

#### Scenario: Run init twice
- **WHEN** 用户连续两次执行 `superpowers init`
- **THEN** 第一次执行注入条目，第二次执行检测到已安装并跳过

### Requirement: Preserve JSONC formatting

系统 SHALL 在注入过程中保留 `opencode.json` 的 JSONC 格式，包括注释和尾逗号。

#### Scenario: File contains comments
- **WHEN** `opencode.json` 包含 `// 这是注释` 或 `/* 块注释 */`
- **THEN** 注入完成后所有注释仍然存在且位置不变

#### Scenario: File contains trailing commas
- **WHEN** `opencode.json` 包含 JSONC 风格的尾逗号
- **THEN** 注入完成后尾逗号保持不变

### Requirement: Success feedback

系统 SHALL 在注入成功后输出明确的操作结果和下一步指引。

#### Scenario: Successful injection
- **WHEN** 注入操作成功完成
- **THEN** 系统输出包含以下信息：
  - 已修改的文件路径
  - 注入的 plugin 条目
  - 提示 "请重启 OpenCode 使配置生效"
