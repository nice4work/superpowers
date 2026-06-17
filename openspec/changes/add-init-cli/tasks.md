## 1. CLI Infrastructure

- [x] 1.1 Add `"bin": { "superpowers": "./bin/cli.js" }` to `package.json`
- [x] 1.2 Create `bin/cli.js` — entry point: parse `process.argv`, dispatch to `lib/init.js`, print usage on unknown commands
- [x] 1.3 Verify `npx superpowers init` resolves correctly (local test with `node bin/cli.js init`)

## 2. Core Init Logic

- [x] 2.1 Create `lib/init.js` — `findConfig()`: walk up directories from `cwd` to find `opencode.json`
- [x] 2.2 Create `lib/init.js` — `hasSuperpowers()`: check if `plugin` array already contains a superpowers entry
- [x] 2.3 Create `lib/jsonc.js` — `injectPlugin(content)`: string-level inject of `"superpowers@git+https://github.com/obra/superpowers.git"` into the `plugin` array
- [x] 2.4 Create `lib/jsonc.js` — `addPluginField(content)`: when `plugin` field doesn't exist, add it after opening `{`
- [x] 2.5 Wire everything in `lib/init.js` — `main()`: find config → check installed → inject → write back → print success

## 3. Error Handling & Edge Cases

- [x] 3.1 No `opencode.json` found: print clear error message, exit code 1
- [x] 3.2 `plugin` field exists but is a string (not array): print error, suggest manual edit
- [x] 3.3 File permission denied: print error, exit code 1
- [x] 3.4 File is empty or missing opening `{`: print error, exit code 1
- [x] 3.5 File contains `plugin` but outside JSON context (e.g., in a string value): verify regex is tight enough

## 4. Tests

- [x] 4.1 Create `tests/opencode/test-init-cli.sh`: test init in clean project
- [x] 4.2 Test idempotency: running init twice produces same result, second run reports "already installed"
- [x] 4.3 Test JSONC preservation: init in a file with comments and trailing commas, verify they survive
- [x] 4.4 Test with existing `plugin` array containing other entries
- [x] 4.5 Test with missing `plugin` field
- [x] 4.6 Test with empty `plugin` array

## 5. Documentation

- [x] 5.1 Update `.opencode/INSTALL.md`: add `superpowers init` as primary install method
- [x] 5.2 Update `docs/README.opencode.md`: add CLI install section
