export const PLUGIN_URL = 'superpowers@git+https://github.com/obra/superpowers.git';

export function hasSuperpowers(content) {
  return content.includes(PLUGIN_URL);
}

function findPluginArrayEnd(content, startPos) {
  let depth = 0;
  let inString = false;
  let inLineComment = false;
  let inBlockComment = false;
  let stringChar = '';

  for (let i = startPos; i < content.length; i++) {
    const ch = content[i];
    const next = content[i + 1];

    if (!inString && !inBlockComment && ch === '/' && next === '/') {
      inLineComment = true;
      i++;
      continue;
    }
    if (inLineComment && ch === '\n') {
      inLineComment = false;
      continue;
    }
    if (!inString && !inLineComment && ch === '/' && next === '*') {
      inBlockComment = true;
      i++;
      continue;
    }
    if (inBlockComment && ch === '*' && next === '/') {
      inBlockComment = false;
      i++;
      continue;
    }
    if (inLineComment || inBlockComment) continue;

    if (!inString && (ch === '"' || ch === "'")) {
      inString = true;
      stringChar = ch;
      continue;
    }
    if (inString && ch === stringChar && content[i - 1] !== '\\') {
      inString = false;
      continue;
    }
    if (inString) continue;

    if (ch === '[') depth++;
    if (ch === ']') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function injectIntoExisting(content) {
  const match = content.match(/"plugin"\s*:\s*\[/);
  if (!match) return null;

  const bracketStart = match.index + match[0].length - 1;
  const bracketEnd = findPluginArrayEnd(content, bracketStart);
  if (bracketEnd === -1) return null;

  const entry = `"${PLUGIN_URL}"`;
  const inner = content.slice(bracketStart + 1, bracketEnd);

  if (inner.trim() === '') {
    return content.slice(0, bracketEnd) + entry + content.slice(bracketEnd);
  }

  const gap = content.slice(bracketStart + 1, bracketEnd);
  const lastEntryEnd = bracketStart + 1 + gap.trimEnd().length;
  const whitespaceToBracket = content.slice(lastEntryEnd, bracketEnd);

  if (whitespaceToBracket.includes('\n')) {
    const innerLines = gap.split('\n').filter(l => l.trim());
    const entryIndent = innerLines.length > 0
      ? innerLines[innerLines.length - 1].match(/^(\s*)/)[0]
      : '';

    return content.slice(0, lastEntryEnd) + ',\n' + entryIndent + entry + whitespaceToBracket + content.slice(bracketEnd);
  }

  return content.slice(0, bracketEnd) + ', ' + entry + content.slice(bracketEnd);
}

function addPluginField(content) {
  const firstBrace = content.indexOf('{');
  if (firstBrace === -1) return null;

  const before = content.slice(0, firstBrace + 1);
  const after = content.slice(firstBrace + 1);

  return `${before}\n  "plugin": ["${PLUGIN_URL}"],${after}`;
}

export function injectSuperpowers(content) {
  if (hasSuperpowers(content)) return { content, changed: false };

  if (/"plugin"\s*:\s*\[/.test(content)) {
    const result = injectIntoExisting(content);
    if (result === null) throw new Error('无法解析 plugin 数组，请手动编辑 opencode.json');
    return { content: result, changed: true };
  }

  if (/"plugin"\s*:/.test(content)) {
    throw new Error('plugin 字段不是数组格式，请手动编辑 opencode.json');
  }

  const result = addPluginField(content);
  if (result === null) throw new Error('无法解析 opencode.json 文件格式');
  return { content: result, changed: true };
}
