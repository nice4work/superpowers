import { readFileSync, writeFileSync, existsSync, mkdirSync, cpSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { hasSuperpowers, injectSuperpowers, PLUGIN_URL } from './jsonc.js';

const CONFIG_FILE = 'opencode.json';
const SKILLS_DEST = '.opencode/skills';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(__dirname, '..');

function copySkills(targetDir) {
  const sourceDir = join(PACKAGE_ROOT, 'skills');
  if (!existsSync(sourceDir)) {
    console.error('警告: 未找到技能源文件，跳过技能复制。');
    return;
  }

  mkdirSync(dirname(targetDir), { recursive: true });
  cpSync(sourceDir, targetDir, { recursive: true });
}

function findConfig(cwd) {
  let dir = resolve(cwd);

  while (true) {
    const configPath = resolve(dir, CONFIG_FILE);
    if (existsSync(configPath)) return configPath;

    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

export function init(cwd = process.cwd()) {
  const existingConfig = findConfig(cwd);
  const skillsTarget = resolve(cwd, SKILLS_DEST);

  if (existingConfig) {
    let content;
    try {
      content = readFileSync(existingConfig, 'utf8');
    } catch {
      console.error(`错误: 无法读取 ${existingConfig}`);
      process.exit(1);
    }

    if (hasSuperpowers(content)) {
      console.log('superpowers 已安装，无需重复操作。');
      return;
    }

    let result;
    try {
      result = injectSuperpowers(content);
    } catch (err) {
      console.error(`错误: ${err.message}`);
      process.exit(1);
    }

    if (!result.changed) return;

    try {
      writeFileSync(existingConfig, result.content, 'utf8');
    } catch {
      console.error(`错误: 无法写入 ${existingConfig}`);
      process.exit(1);
    }

    console.log(`✅ 已将 superpowers 注入到 ${existingConfig}`);
  } else {
    const configPath = resolve(cwd, CONFIG_FILE);
    const defaultContent = `{\n  "plugin": ["${PLUGIN_URL}"]\n}\n`;

    try {
      writeFileSync(configPath, defaultContent, 'utf8');
    } catch {
      mkdirSync(dirname(configPath), { recursive: true });
      writeFileSync(configPath, defaultContent, 'utf8');
    }

    console.log(`✅ 已创建 ${configPath}`);
  }

  copySkills(skillsTarget);
  console.log(`✅ 已将技能文件复制到 ${skillsTarget}`);
  console.log('请重启 OpenCode 使配置生效。');
}
