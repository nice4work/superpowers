## 1. 配置基础层

- [ ] 1.1 新增 `lib/config-locator.js`：从当前目录向上查找 `opencode.json`、`opencode.jsonc`、`.opencode/opencode.json`、`.opencode/opencode.jsonc`
- [ ] 1.2 在配置定位中实现同目录优先级：`.opencode/` 配置优先于直接配置，并返回被忽略的路径用于提示
- [ ] 1.3 新增 `lib/config-editor.js`：实现顶层键扫描，跟踪字符串、行注释、块注释和括号深度
- [ ] 1.4 在扫描器中实现读取、插入、改名、删除顶层键的范围操作
- [ ] 1.5 支持 `plugins` 数组中的字符串条目与对象条目，保留对象原样
- [ ] 1.6 实现宽松 JSONC 校验：去掉注释与尾逗号后使用 `JSON.parse` 验证结构
- [ ] 1.7 实现原子写入：同目录临时文件 + rename，写入前保留配置备份
- [ ] 1.8 新增 `lib/plugin-entry.js`：识别 git URL、版本 pin、npm 包名和对象形式 Superpowers 条目
- [ ] 1.9 在 `lib/plugin-entry.js` 中实现条目归一化与去重
- [ ] 1.10 把 `PLUGIN_URL`、V2 最低版本 `6.4.1` 和 CLI 输出文案提取为命名常量

## 2. CLI 入口与 init

- [ ] 2.1 重写 `bin/cli.js` 参数解析：支持 `init`、`update`、`--help`、`--dry-run`、`--keep-skills`
- [ ] 2.2 实现未知命令和未知参数的用法提示与非零退出码
- [ ] 2.3 新增 `lib/commands/init.js`：定位或创建配置，确保顶层 `plugins` 包含 Superpowers 条目
- [ ] 2.4 删除 `lib/init.js` 中的 `copySkills` 逻辑，确保 `init` 不创建 `.opencode/skills`
- [ ] 2.5 在 `init` 中检测 V1 `plugin`、重复键或旧技能副本，并自动转交 update 流程
- [ ] 2.6 在 `init` 中实现幂等检查：已安装时只输出状态，不修改文件
- [ ] 2.7 在 `init` 中实现 `--dry-run`：输出变更计划，不写文件、不删除目录
- [ ] 2.8 在 `init` 中实现 `--keep-skills`：迁移配置但保留旧技能副本
- [ ] 2.9 实现成功输出：配置路径、写入条目、共享技能说明、重启与 `opencode service restart` 指引

## 3. update 迁移

- [ ] 3.1 新增 `lib/commands/update.js`：定位配置并要求存在 Superpowers 或旧技能副本
- [ ] 3.2 实现旧技能副本存在但没有配置时，在当前目录创建 V2 `opencode.json` 并继续迁移
- [ ] 3.2 实现 `plugin` → `plugins` 改名；只有 `plugin` 时直接改名
- [ ] 3.3 实现 `plugin` 与 `plugins` 并存时的合并、条目去重和 `plugin` 删除
- [ ] 3.4 实现 V1-only 版本 pin 替换：`#v6.3.0` 及更早改为当前 `PLUGIN_URL`
- [ ] 3.5 实现非 semver ref 的保留与警告输出
- [ ] 3.6 新增 `lib/skills.js`：从包内 `skills/` 读取已知技能 ID
- [ ] 3.7 在 `lib/skills.js` 中实现列出、删除已知 `.opencode/skills/<id>` 目录；保留未知目录
- [ ] 3.8 在 `update` 中实现安全顺序：配置写入并复核成功后才删除技能目录
- [ ] 3.9 在配置迁移失败时中止流程，确保不删除任何目录
- [ ] 3.10 在 `update` 中实现 `--dry-run`，输出将要删除的目录
- [ ] 3.11 在 `update` 中实现 `--keep-skills`，跳过删除并提示遮蔽风险
- [ ] 3.12 实现全局旧安装检测：只报告 `~/.config/opencode/plugins/superpowers.js`、`~/.config/opencode/skills/superpowers`、`~/.config/opencode/superpowers`
- [ ] 3.13 实现迁移摘要输出：配置路径、被删除目录、被忽略的全局路径、重启/清缓存指引

## 4. 共享技能与打包

- [ ] 4.1 确认 `index.js` 导出默认插件入口，目录形式加载可用
- [ ] 4.2 在 `package.json` 的 `files` 中加入 `index.js`
- [ ] 4.3 移除 `.opencode/package.json` 中未使用的 `@opencode-ai/plugin` 依赖
- [ ] 4.4 确认插件 `setup(ctx)` 从包内 `skills/` 注册技能，且 `path` 指向包内文件
- [ ] 4.5 确认技能中的 `references/`、`scripts/` 相对路径在共享模式下可用
- [ ] 4.6 更新 `npm pack --dry-run` 预期文件列表，覆盖 `index.js`、`.opencode/plugins/`、`skills/`

## 5. 文档

- [ ] 5.1 重写 `docs/README.opencode.md`：V2 优先，说明 `init`、`update`、共享技能和迁移流程
- [ ] 5.2 重写 `.opencode/INSTALL.md`：删除 V1 优先的安装顺序，修正包名、URL 和本地目录安装说明
- [ ] 5.3 更新 `README.md` 的 OpenCode 章节，指向本仓库的 V2 文档
- [ ] 5.4 在文档中说明 `--dry-run`、`--keep-skills`、旧 symlink 清理和缓存刷新
- [ ] 5.5 在文档中说明项目副本仅用于有意的技能覆盖，默认安装不再复制技能

## 6. 测试

- [ ] 6.1 更新 `tests/opencode/test-init-cli.sh`：断言写入 `plugins`、不创建 `.opencode/skills`、旧配置自动转交 update
- [ ] 6.2 新增 `tests/opencode/test-update-cli.sh`：覆盖 V1→V2、双键合并、去重、旧 pin 替换、副本删除、未知技能保留、`--keep-skills`、`--dry-run`、无配置报错
- [ ] 6.3 新增 JSONC 编辑器单测：注释、尾逗号、对象条目、嵌套同名键、格式错误、原子写入失败
- [ ] 6.4 新增集成测试：临时项目执行 init/update 后，通过 `opencode api get /api/plugin` 验证 `superpowers` 为 `active`
- [ ] 6.5 新增集成测试：通过 `opencode api get /api/skill` 验证迁移后技能 `path` 指向插件缓存包，而不是项目 `.opencode/skills`
- [ ] 6.6 新增测试：确认 `update` 不执行网络请求或不导入网络模块
- [ ] 6.7 运行 `tests/opencode/run-tests.sh` 并确认全部通过

## 7. 验证与发布

- [ ] 7.1 运行 `openspec validate adapt-opencode-v2` 并修复所有校验问题
- [ ] 7.2 在 OpenCode 2.0.32 上手工执行 init、update 和重复执行，确认幂等
- [ ] 7.3 在包含旧 `.opencode/skills` 副本的项目上执行 update，确认副本删除且共享技能生效
- [ ] 7.4 执行 `npm pack --dry-run`，确认发布包包含入口和技能、不包含测试与文档
- [ ] 7.5 更新 RELEASE-NOTES 或版本说明，标注破坏性变更与迁移命令
