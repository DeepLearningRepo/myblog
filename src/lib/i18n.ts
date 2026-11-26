import type { Locale } from './posts';

const zh = {
  home: '首页', posts: '文章', tags: '标签', about: '关于', skip: '跳到正文', nav: '主导航',
  search: '搜索文章', theme: '切换深色或浅色主题', rss: 'RSS 订阅', footer: '把思考写下来，让时间留下痕迹。', copyright: '用文字连接世界',
  searchTitle: '寻找一篇文章', close: '关闭搜索', placeholder: '搜索标题、标签或正文…', searchStart: '输入关键词开始搜索', searching: '正在搜索…', searchError: '搜索暂时不可用，请稍后再试。', searchEmpty: '没有找到相关文章，换个关键词试试。', searchFound: '找到 {count} 篇文章',
  read: '开始阅读', grow: '慢慢写，慢慢生长。', heroExtra: '关于代码、思考，以及日常里的小小发现。', visualWords: '记录 · 思考 · 生长', visualCaption: '保持好奇，向远方行走。', sealFirst: '想法', sealSecond: '汇集',
  intro: '一个安放想法的地方', introTopics: '技术探索 / 阅读与思考 / 生活随笔', pickTitle: '值得停留的一篇', pickNote: '从这里，打开一扇窗。', featured: '精选文章', readArticle: '阅读这篇文章', recent: '最近的记录', allPosts: '全部文章',
  curiosity: '每一种好奇，都有回响。', curiosityNote: '沿着一个关键词，发现更多有趣的记录。', minutes: '分钟阅读', notes: '随笔',
  archiveTitle: '每一篇，都是一个脚印。', archiveNote: '把零散的思考，整理成可以回望的记录。', articleCount: '{count} 篇文章',
  topicsTitle: '沿着好奇，继续探索。', topicsNote: '一个关键词，也许会带你走到意料之外的地方。', allTags: '所有标签', related: '关于「{tag}」的记录。',
  toc: '文章目录', top: '回到顶部', continue: '继续阅读', end: '— 写于思考之间 —', thanks: '感谢阅读，愿这篇记录带给你一点新的发现。', copy: '复制', copied: '已复制', copyError: '请手动复制', machine: '英文译文',
};
const en: typeof zh = {
  home: 'Home', posts: 'Articles', tags: 'Topics', about: 'About', skip: 'Skip to content', nav: 'Main navigation',
  search: 'Search articles', theme: 'Toggle light or dark theme', rss: 'RSS feed', footer: 'Write down a thought. Leave a trace in time.', copyright: 'Connecting through words',
  searchTitle: 'Find an article', close: 'Close', placeholder: 'Search titles, topics or content…', searchStart: 'Type a keyword to start', searching: 'Searching…', searchError: 'Search is unavailable. Please try again.', searchEmpty: 'No matching articles. Try another keyword.', searchFound: '{count} articles found',
  read: 'Start reading', grow: 'A little writing. A little growth.', heroExtra: 'Code, reflection, and small discoveries along the way.', visualWords: 'NOTES · IDEAS · GROWTH', visualCaption: 'Stay curious. Keep exploring.', sealFirst: 'FIELD', sealSecond: 'NOTES',
  intro: 'A place to keep an idea', introTopics: 'Technology / Reflections / Everyday notes', pickTitle: 'A story to spend time with', pickNote: 'A window into an idea.', featured: 'FEATURED', readArticle: 'Read the article', recent: 'Recent notes', allPosts: 'All articles',
  curiosity: 'Every curiosity leads somewhere.', curiosityNote: 'Follow a topic and discover another thought.', minutes: 'min read', notes: 'Notes',
  archiveTitle: 'Every article leaves a footprint.', archiveNote: 'Scattered thoughts, collected for another visit.', articleCount: '{count} articles',
  topicsTitle: 'Follow your curiosity.', topicsNote: 'One topic can lead somewhere unexpected.', allTags: 'All topics', related: 'Notes about {tag}.',
  toc: 'Contents', top: 'Back to top', continue: 'Keep reading', end: '— A note along the way —', thanks: 'Thank you for reading. I hope you found a new idea here.', copy: 'Copy', copied: 'Copied', copyError: 'Copy manually', machine: 'English translation',
};
export const messages = { zh, en };
export const text = (locale: Locale) => messages[locale];
