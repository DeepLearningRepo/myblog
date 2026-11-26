# Axis的想法 · 人生海海

暖白与深蓝的阅读主题，配有深色模式、文章目录、阅读进度、代码复制、标签、全文搜索、数学公式、RSS 与站点地图。所有页面静态生成，发布到 GitHub Pages 后不需要服务器常驻。

## 中英文与自动翻译

你只需要在 `src/content/posts/` 编写中文 Markdown。每次 `npm run build`（包括 GitHub 自动发布）都会检查原文，自动为新增或修改的文章生成 `src/content/posts-en/` 下的英文 Markdown；未改动的文章直接复用译稿。

页头的 **中 / EN** 在同一页面的两个版本之间切换。英文版本包含首页、文章、目录、标签、搜索和独立 RSS。

翻译使用本地 Argos / OpenNMT 中英模型，不需要 API Key。首次需要 Python 3.10 或更新版本，并自动准备隔离环境及约 71 MB 的模型。模型随后缓存，文章文本在运行翻译的主机上处理。GitHub Actions 会自动安装 Python 并缓存模型。

代码、公式、HTML 锚点和链接地址保留，图片共享。译稿开头的 `sourceHash` 用于判断中文原文是否改变；你可以手动润色英文正文，保留该字段，之后未改动的原文不会覆盖你的润色。原文再次变化时会重新生成英文版本。

单独生成英文译稿：

```bash
npm run translate
```

如果远端首次安装翻译依赖时访问 PyPI 较慢，可以运行 `PIP_INDEX_URL=https://mirrors.aliyun.com/pypi/simple npm run translate`。安装完成后正常使用 `npm run build` 即可。

## 直接预览已部署的远端版本

远端常驻预览运行在 `127.0.0.1:4321`。在本地终端建立转发：

```bash
ssh -N -L 14321:127.0.0.1:4321 spark01@cu1.gpushang.com
```

然后打开 <http://localhost:14321>。这个地址展示的是远端 `dist/` 中的构建结果。

服务管理：`systemctl --user status shanhai-blog`；日志：`journalctl --user -u shanhai-blog -n 30`。

## 在远端写作和实时预览

需要 Node.js 22 或更新版本。远端如使用本项目安装的独立 Node，先运行：

```bash
export PATH="$HOME/.local/share/shanhai-blog/node/bin:$PATH"
cd /home/spark01/code/myblog
npm ci
npm run dev -- --port 4322
```

在本地另开一个终端，建立 SSH 转发，然后打开 <http://localhost:4322>：

```bash
ssh -N -L 4322:127.0.0.1:4322 spark01@cu1.gpushang.com
```

`npm run build` 后，常驻预览会立即展示更新后的静态页面。

## 新建文章

```bash
npm run new -- my-first-post "我的第一篇文章"
```

文章会生成到 `src/content/posts/my-first-post.md`，初始为草稿。正文使用 Markdown，开头填写：

```yaml
---
title: 我的第一篇文章
description: 一句清楚的摘要。
date: 2026-11-26
tags: [技术, 随笔]
cover: mountains
featured: false
draft: false
---
```

- `draft: true` 的文章不会发布，也不会进入搜索、RSS、标签页。
- `featured: true` 的最新文章会出现在首页精选区。
- `cover` 可选 `mountains`、`orbit`、`windows`，对应三款自绘封面。
- 日期按北京时间生成，文章日期按日历显示。
- 公式使用 `$...$` 或 `$$...$$`。
- 图片放入 `src/assets/`，文章中使用 `../../assets/文件名.png`。Astro 会处理图片并自动适配 GitHub Pages 的仓库子路径。此方式适用于直接放在 posts 目录中的文章；子目录文章需要相应增加 `../`。
- 首篇正式文章为 `src/content/posts/layout-algebra-1.md`（《布局代数（1）》），原始文件位于桌面，导入时未修改原文。附图已复制到 `src/assets/layout-algebra-1/`。
- 三篇示例文章保留为草稿，不出现在网站中；需要参考写法时可以打开阅读。

## 修改名称和主题

- 博客名、作者、简介、GitHub 链接：`src/site.ts`。
- 首页文案：`src/pages/index.astro`。
- 关于页：`src/pages/about.md`，同样用 Markdown 编辑。
- 颜色、字号、间距：`src/styles/global.css` 顶部变量。
- 图标和分享图：`public/favicon.svg`、`public/social.svg`。改名后可同步修改分享图文字。

## 发布到 GitHub Pages

本博客对应仓库：<https://github.com/DeepLearningRepo/myblog>。

首次发布需要在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。

远端仓库位于 `/home/spark01/code/myblog`，Git 远端地址使用 `git@github.com:DeepLearningRepo/myblog.git`。以后写完文章，在远端运行：

```bash
cd /home/spark01/code/myblog
npm run build
npm run verify
git add .
git commit -m "Add a new blog post"
git push origin main
```

查看仓库 Actions 中的发布任务。部署成功后的真实地址会显示在 Pages 设置和部署任务中。标准项目页地址为 <https://deeplearningrepo.github.io/myblog/>，以 Pages 设置显示的地址为准。以后每次推送文章，都会自动更新网站。

工作流从 GitHub Pages 读取真实域名与仓库子路径，适配个人主页、普通项目页和自定义域名。不要直接在配置里写死 `/blog/`。

本地验证普通项目页的链接：

```bash
SITE_URL=https://deeplearningrepo.github.io BASE_PATH=/myblog npm run build
SITE_URL=https://deeplearningrepo.github.io BASE_PATH=/myblog npm run verify
```

未配置部署域名时，本地构建的规范链接暂用 `https://example.com`；GitHub 工作流会自动替换。若自行托管，请在构建时设置真实的 `SITE_URL` 与 `BASE_PATH`。

## 目录

```text
src/content/posts/       Markdown 博文
src/pages/about.md       关于页
src/site.ts              博客配置
src/styles/global.css    主题样式
public/                  图片与静态资源
.github/workflows/       自动发布配置
scripts/                 新建文章与构建验证工具
```

网站正文、封面、代码高亮与公式均随构建产物提供。中文衬线字体优先使用 Google Fonts，访问不通时自动使用本机宋体；不影响阅读。
