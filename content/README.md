# Writing workspace

日常只需要编辑这里：

- `posts/articles/`：正式文章
- `posts/docs/`：技术文档
- `posts/notes/`：简短记录
- `pages/about.md`：关于页面。
- `config.ts`：站点标题、语言、作者资料和导航。
- `site.json`：线上正式网址。
- `assets/images/`：头像和横幅。
- `public/`：favicon 等按原路径公开的文件。

快速创建：

```powershell
pnpm new:post "Article title"
pnpm new:doc "Document title"
pnpm new:note "Note title"
```

新内容默认是草稿（`draft: true`）。完成后改为 `draft: false` 即可发布。
英文文章使用 `lang: en`，中文文章改为 `lang: zh_CN`。

不要编辑 `.site/`，它会在每次构建时被重新生成。通常也不需要修改 `template/fuwari/`。
