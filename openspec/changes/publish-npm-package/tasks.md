## 1. package.json Metadata

- [x] 1.1 修改 `name` 为 `@nice4work/superpowers`
- [x] 1.2 新增 `description`、`license`（`MIT`）、`repository` 字段
- [x] 1.3 新增 `files` 白名单（`bin/`, `lib/`, `skills/`, `.opencode/plugins/`, `.opencode/package.json`）
- [x] 1.4 新增 `publishConfig.access: "public"`（scoped 包必填）

## 2. Git URL 变更

- [x] 2.1 修改 `lib/jsonc.js` 中 `PLUGIN_URL` 为 `superpowers@git+https://github.com/nice4work/superpowers.git`

## 3. 验证

- [ ] 3.1 `npm pack --dry-run` 确认发布文件列表正确（无 tests/docs/openspec 等）
- [ ] 3.2 运行现有测试确保 URL 变更后功能正常
- [ ] 3.3 本地 `npm link` 后验证 `superpowers init` 生成的 `opencode.json` 使用新 URL

## 4. 发布

- [ ] 4.1 `npm login` 登录 npm 账号
- [ ] 4.2 `npm publish` 发布到 npm public registry
- [ ] 4.3 在另一环境执行 `npm install -g @nice4work/superpowers` 验证安装
