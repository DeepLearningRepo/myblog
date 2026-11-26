import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const [slug, title] = process.argv.slice(2);
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !title) {
  console.error('用法：npm run new -- my-first-post "我的第一篇文章"\n文件名请用小写英文字母、数字和连字符。');
  process.exit(1);
}
const folder = path.resolve('src/content/posts');
await mkdir(folder, { recursive: true });
const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date());
const text = `---\ntitle: ${JSON.stringify(title)}\ndescription: "写一句简短的介绍。"\ndate: ${date}\ntags: [随笔]\ncover: mountains\nfeatured: false\ndraft: true\n---\n\n## 从这里开始\n\n写下你的第一段文字。\n`;
const file = path.join(folder, `${slug}.md`);
try { await writeFile(file, text, { flag: 'wx' }); }
catch (error) { console.error(error.code === 'EEXIST' ? '文章已经存在，请换一个文件名。' : error.message); process.exit(1); }
console.log(`已创建草稿：${file}\n完成后将 draft 改为 false，再提交到 GitHub。`);
