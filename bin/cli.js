#!/usr/bin/env node
import { init } from '../lib/init.js';

const command = process.argv[2];

if (command === 'init') {
  init();
} else if (!command) {
  console.error('用法: superpowers init');
  console.error('       superpowers <command>');
  console.error('');
  console.error('命令:');
  console.error('  init     在当前项目中安装 superpowers');
  process.exit(1);
} else {
  console.error(`未知命令: ${command}`);
  console.error('用法: superpowers init');
  process.exit(1);
}
