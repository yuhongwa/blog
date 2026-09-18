# TOP 年度收录子站

主博客下的独立静态子站，入口为 /top/index.html。

- index.html：首页、六个栏目和收录原则。
- category.html：六个栏目共用的栏目页。
- about.html：详细说明和更新记录。
- article-template.html：TOP 文章页模板，不直接发布。
- assets/catalog.js：栏目说明和已发布文章。
- assets/app.js：栏目页渲染。
- assets/styles.css：子站样式。

正文仍存放在 content/posts。启动或构建主站时，scripts/render-top.mjs 会从同一份 Markdown 生成 TOP 样式文章页，写入 .site/public/top/articles。

新增文章时，需要同时在 assets/catalog.js 对应栏目的 entries 中增加标题、说明和 TOP 内部链接，并在 scripts/render-top.mjs 登记源文件与输出文件。主站构建会把 Top 文件夹复制到 .site/public/top，但不会发布本说明和文章模板。
