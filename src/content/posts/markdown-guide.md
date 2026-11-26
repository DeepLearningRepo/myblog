---
title: 用 Markdown，写一篇清爽的技术笔记
description: 标题、代码、表格和公式：把注意力放在内容上，让排版自然发生。
date: 2026-11-25
tags: [Markdown, 写作]
cover: windows
draft: true
---

## 让文字保持简单

这篇示例展示博客支持的常见排版。所有博文都是普通的 `.md` 文件，可以用 VS Code、Typora 或你习惯的任何编辑器编写。

**加粗**适合强调关键结论，*斜体*适合补充语气，`行内代码`适合变量名和短命令。

## 一段可以运行的代码

代码块在浅色和深色主题下都会自动高亮。鼠标移入时，可以点击右上角的“复制”。

```python
from dataclasses import dataclass

@dataclass
class Note:
    title: str
    tags: list[str]

notes = [
    Note("从一个问题开始", ["写作", "思考"]),
    Note("把实验记录下来", ["技术", "笔记"]),
]

for note in notes:
    print(f"{note.title}: {', '.join(note.tags)}")
```

## 表格与列表

表格适合比较相同维度的信息，避免为了排版而使用表格。

| 内容 | Markdown 写法 | 用途 |
| --- | --- | --- |
| 二级标题 | `## 标题` | 划分主要内容 |
| 链接 | `[名称](地址)` | 引用资料 |
| 图片 | `![描述](地址)` | 展示截图或照片 |
| 引用 | `> 一段文字` | 引用或提示 |

把图片放在 `src/assets/` 下。为了兼容 GitHub Pages 的仓库子路径，可以用相对地址引用，例如从文章页写 `../../assets/example.png`。

## 数学公式

行内公式使用一对美元符号，例如 $E = mc^2$。

独立公式使用两对美元符号：

$$
\operatorname{Attention}(Q,K,V) =
\operatorname{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}\right)V
$$

公式在构建时排版，不需要读者额外安装插件。

## 一篇文章的开头

每篇文章前面的元信息决定标题、摘要、日期与标签：

```yaml
---
title: 我的第一篇文章
description: 一段简短而具体的介绍。
date: 2026-11-26
tags: [技术, 随笔]
cover: mountains
featured: false
draft: false
---
```

把 `draft` 设为 `true`，文章就不会出现在网站、搜索、RSS 或标签列表中。准备好后，改成 `false` 再提交即可。
