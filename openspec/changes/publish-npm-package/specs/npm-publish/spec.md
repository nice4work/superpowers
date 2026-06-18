## ADDED Requirements

### Requirement: Package is publishable to npm

系统 SHALL 具备发布到 npm public registry 所需的完整元数据。

#### Scenario: package.json contains required npm fields
- **WHEN** 检查 `package.json`
- **THEN** 包含 `name`（`@nice4work/superpowers`）、`version`、`description`、`license`、`repository`、`files`、`publishConfig.access: "public"` 字段

#### Scenario: Publish succeeds
- **WHEN** 执行 `npm publish`
- **THEN** 包成功发布到 npm public registry
- **THEN** 其他用户可通过 `npm install -g @nice4work/superpowers` 安装

### Requirement: Published package contains only necessary files

系统 SHALL 通过 `files` 白名单控制发布内容，不泄露开发、测试、文档文件。

#### Scenario: Whitelist excludes non-essential files
- **WHEN** 执行 `npm pack --dry-run`
- **THEN** 包含的文件仅为 `bin/`、`lib/`、`skills/`、`.opencode/plugins/`、`.opencode/package.json`、`package.json`、`README.md`、`LICENSE`
- **THEN** 不包含 `tests/`、`docs/`、`openspec/`、`.github/`、`hooks/`、`scripts/`、`assets/`

#### Scenario: Skills directory is included
- **WHEN** 执行 `npm pack --dry-run`
- **THEN** `skills/` 下所有 SKILL.md 和附属文件均包含在发布包中

### Requirement: Global install enables superpowers command

系统 SHALL 确保 `npm install -g` 后 `superpowers` 命令全局可用。

#### Scenario: Global install creates symlink
- **WHEN** 用户执行 `npm install -g @nice4work/superpowers`
- **THEN** `superpowers` 命令被添加到 PATH
- **THEN** 执行 `superpowers init` 可正常启动安装流程
