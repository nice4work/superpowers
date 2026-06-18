## MODIFIED Requirements

### Requirement: Inject plugin entry into opencode.json

系统 SHALL 向 `opencode.json` 的 `plugin` 数组中追加 `"superpowers@git+https://github.com/nice4work/superpowers.git"` 条目。

#### Scenario: Plugin field exists and is an array
- **WHEN** `opencode.json` 包含 `"plugin": ["other-plugin"]`
- **THEN** 系统修改为 `"plugin": ["other-plugin", "superpowers@git+https://github.com/nice4work/superpowers.git"]`
- **THEN** 文件中其他字段和格式（缩进、注释、尾逗号）保持不变

#### Scenario: Plugin field does not exist
- **WHEN** `opencode.json` 不包含 `plugin` 字段
- **THEN** 系统在顶层 JSON 对象中新增 `"plugin": ["superpowers@git+https://github.com/nice4work/superpowers.git"]`
- **THEN** 文件中其他内容保持不变

#### Scenario: Plugin field exists but is empty array
- **WHEN** `opencode.json` 包含 `"plugin": []`
- **THEN** 系统修改为 `"plugin": ["superpowers@git+https://github.com/nice4work/superpowers.git"]`
