import { readFile, writeFile, readdir, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import GithubSlugger from 'github-slugger';
import YAML from 'yaml';

const sourceDir = path.resolve('src/content/posts');
const outputDir = path.resolve('src/content/posts-en');
const engineVersion = 'argos-zh-en-1.9-v3';
const parser = unified().use(remarkParse).use(remarkMath).use(remarkGfm);
const writer = unified().use(remarkStringify, { bullet: '-', fences: true }).use(remarkMath).use(remarkGfm);
const hasChinese = value => /[\u3400-\u9fff]/.test(value);
async function allMarkdown(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? allMarkdown(path.join(folder, entry.name)) : entry.name.endsWith('.md') ? [path.join(folder, entry.name)] : []))).flat();
}
function parseFile(content) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(content);
  assert.ok(match, 'Markdown post must have YAML frontmatter');
  return { metadata: YAML.parse(match[1]), body: match[2] };
}
function visit(node, callback) { callback(node); node.children?.forEach(child => visit(child, callback)); }
function headingText(node) { return node.value || node.children?.map(headingText).join('') || ''; }
function addHeadingAliases(tree) {
  const slugger = new GithubSlugger();
  const used = new Set();
  visit(tree, node => { if (node.type === 'html') for (const [, id] of node.value.matchAll(/\bid="([^"]+)"/g)) used.add(id); });
  function insert(node) {
    if (!node.children) return;
    const children = [];
    for (const child of node.children) {
      if (child.type === 'heading') {
        const slug = slugger.slug(headingText(child));
        if (child.sourceAnchor !== slug && !used.has(child.sourceAnchor)) {
          const id = child.sourceAnchor.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          children.push({ type: 'paragraph', children: [{ type: 'html', value: `<span id="${id}" data-source-heading>` }, { type: 'html', value: '</span>' }] });
          used.add(child.sourceAnchor);
        }
      }
      insert(child); children.push(child);
    }
    node.children = children;
  }
  insert(tree);
}
function protectedValues(tree) {
  const values = [];
  visit(tree, node => {
    if (['code', 'inlineCode', 'math', 'inlineMath', 'html'].includes(node.type)) values.push([node.type, node.value]);
    if (['image', 'link', 'definition'].includes(node.type)) values.push([node.type, node.url]);
  });
  return values;
}
function run(command, args, input) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: [input ? 'pipe' : 'ignore', 'pipe', 'inherit'] });
    let output = ''; child.stdout.on('data', data => { output += data; if (!input) process.stdout.write(data); });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve(output) : reject(new Error(`${command} exited with ${code}`)));
    if (input) child.stdin.end(input);
  });
}
async function exists(file) { return access(file).then(() => true).catch(() => false); }
async function translationPython() {
  if (process.env.TRANSLATION_PYTHON) return process.env.TRANSLATION_PYTHON;
  const folder = path.resolve('.translation-venv');
  const python = path.join(folder, process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
  const ready = path.join(folder, '.translation-ready');
  if (!await exists(python)) {
    console.log('Preparing the isolated translation runtime...');
    await run(process.platform === 'win32' ? 'python' : 'python3', ['-m', 'venv', folder]);
  }
  if (!await exists(ready)) {
    await run(python, ['-m', 'pip', 'install', '--disable-pip-version-check', '--timeout', '60', '-r', 'scripts/translation-requirements.txt']);
    await writeFile(ready, engineVersion);
  }
  return python;
}

await mkdir(outputDir, { recursive: true });
const pending = [];
const publicIds = new Set();
const texts = new Map();
const request = value => { const text = value.trim(); if (hasChinese(text) && !texts.has(text)) texts.set(text, texts.size); };
for (const sourceFile of await allMarkdown(sourceDir)) {
  const relative = path.relative(sourceDir, sourceFile);
  const content = await readFile(sourceFile, 'utf8');
  const { metadata, body } = parseFile(content);
  if (metadata.draft) continue;
  publicIds.add(relative);
  const sourceHash = createHash('sha256').update(engineVersion).update(content).digest('hex');
  const target = path.join(outputDir, relative);
  if (await exists(target)) {
    const cached = parseFile(await readFile(target, 'utf8'));
    if (cached.metadata.sourceHash === sourceHash) {
      if (cached.metadata.draft) await writeFile(target, `---\n${YAML.stringify({ ...cached.metadata, draft: false })}---\n\n${cached.body}`);
      continue;
    }
  }
  const tree = parser.parse(body);
  const sourceSlugger = new GithubSlugger();
  visit(tree, node => { if (node.type === 'heading') node.sourceAnchor = sourceSlugger.slug(headingText(node)); });
  const protectedBefore = protectedValues(tree);
  for (const value of [metadata.title, metadata.description, ...(metadata.tags || [])]) request(value);
  visit(tree, node => { if (node.type === 'text') request(node.value); if (node.type === 'image' && node.alt) request(node.alt); });
  pending.push({ metadata, tree, target, sourceHash, protectedBefore, relative });
}
// Stale translations become drafts if their Chinese source is removed or unpublished.
for (const target of await allMarkdown(outputDir)) {
  if (publicIds.has(path.relative(outputDir, target))) continue;
  const parsed = parseFile(await readFile(target, 'utf8'));
  if (!parsed.metadata.draft) await writeFile(target, `---\n${YAML.stringify({ ...parsed.metadata, draft: true })}---\n\n${parsed.body}`);
}
if (!pending.length) { console.log('English translations are up to date.'); process.exit(0); }
const python = await translationPython();
const translated = JSON.parse(await run(python, ['scripts/translate-text.py'], JSON.stringify({ texts: [...texts.keys()] }))).texts;
assert.equal(translated.length, texts.size, 'Translation response count mismatch');
const translate = value => {
  const text = value.trim(); const index = texts.get(text);
  if (index === undefined) return value;
  return value.match(/^\s*/)[0] + translated[index] + value.match(/\s*$/)[0];
};
for (const item of pending) {
  visit(item.tree, node => { if (node.type === 'text') node.value = translate(node.value); if (node.type === 'image' && node.alt) node.alt = translate(node.alt); });
  assert.deepEqual(protectedValues(item.tree), item.protectedBefore, 'Translation modified code, math, HTML or URLs');
  addHeadingAliases(item.tree);
  const metadata = { ...item.metadata, title: translate(item.metadata.title), description: translate(item.metadata.description), tagLabels: Object.fromEntries((item.metadata.tags || []).map(tag => [tag, translate(tag)])), sourceHash: item.sourceHash, translation: 'machine' };
  const body = writer.stringify(item.tree);
  assert.deepEqual(protectedValues(parser.parse(body)), protectedValues(item.tree), 'Markdown serialization modified protected content');
  await mkdir(path.dirname(item.target), { recursive: true });
  await writeFile(item.target, `---\n${YAML.stringify(metadata)}---\n\n${body}`);
  console.log(`Generated English Markdown: ${item.relative}`);
}
