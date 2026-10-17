## ADDED Requirements

### Requirement: Skills are provided by the plugin package

系统 SHALL 由插件包在运行时注册技能，而不是要求项目保存技能文件。

#### Scenario: Project has no skill copies
- **WHEN** 项目配置了 Superpowers 插件且没有 `.opencode/skills`
- **THEN** 插件 `setup()` 从安装包读取 `skills/*/SKILL.md`
- **THEN** 当前项目的技能注册表中出现 Superpowers 技能

#### Scenario: Multiple projects share one package
- **WHEN** 多个项目都配置了同一个 Superpowers 插件包
- **THEN** 这些项目使用同一份技能内容
- **THEN** 无需为每个项目复制技能

#### Scenario: Skill supporting files resolve
- **WHEN** 模型加载一个 Superpowers 技能
- **THEN** 技能中的 `references/`、`scripts/` 等相对路径指向插件包内对应文件

### Requirement: Install commands do not create project skill copies

系统 SHALL 在 `init` 与 `update` 中避免创建新的项目技能副本。

#### Scenario: Fresh init
- **WHEN** 用户在一个新项目执行 `superpowers init`
- **THEN** 系统只写入插件配置
- **THEN** 系统不创建 `.opencode/skills`

#### Scenario: Update with no copies
- **WHEN** 用户执行 `superpowers update` 且项目没有 `.opencode/skills`
- **THEN** 系统不创建该目录

### Requirement: Remove copies that shadow shared skills

系统 SHALL 移除项目内已知的 Superpowers 技能副本，让共享技能生效。

#### Scenario: Copy has the same ID as a shared skill
- **WHEN** `.opencode/skills/brainstorming/SKILL.md` 存在
- **THEN** `superpowers update` 删除该目录
- **THEN** 项目后续加载包内的 `brainstorming` 技能

#### Scenario: Copy belongs to another skill
- **WHEN** `.opencode/skills/my-team-skill/SKILL.md` 不属于 Superpowers
- **THEN** `superpowers update` 保留该目录

#### Scenario: Verify shared source after update
- **WHEN** 用户在迁移后查询 `/api/skill`
- **THEN** Superpowers 技能的 `path` 指向插件缓存包
- **THEN** `path` 不指向项目的 `.opencode/skills`

### Requirement: Project copies remain available for intentional overrides

系统 SHALL 允许用户通过项目副本覆盖共享技能，但不把复制作为默认安装行为。

#### Scenario: User wants a project-specific override
- **WHEN** 用户手动创建 `.opencode/skills/<id>/SKILL.md`
- **THEN** 该项目使用项目副本
- **THEN** 再次执行 `superpowers update` 会删除该同名副本，除非使用 `--keep-skills`
- **THEN** 文档需要说明项目副本不会随共享技能自动更新

#### Scenario: User keeps copies during migration
- **WHEN** 用户执行 `superpowers update --keep-skills`
- **THEN** 系统保留项目副本
- **THEN** 系统在输出中提示副本会继续遮蔽共享技能

### Requirement: Package contains the runtime entrypoint and skills

系统 SHALL 在发布包中包含插件入口和共享技能。

#### Scenario: npm package is packed
- **WHEN** 执行 `npm pack --dry-run`
- **THEN** 包内包含 `index.js`
- **THEN** 包内包含 `.opencode/plugins/superpowers.js`
- **THEN** 包内包含 `skills/`

#### Scenario: Plugin entrypoint resolves
- **WHEN** OpenCode 以目录形式加载包
- **THEN** `index.js` 导出插件默认入口
- **THEN** OpenCode 能够激活 `superpowers` 插件
