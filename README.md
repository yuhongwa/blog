# Yuhongwa Blog

这是一个“内容优先”的 Fuwari 博客仓库。日常写作、模板代码和构建产物彼此隔离，普通创作者不需要进入模板目录改代码。

## 目录

```text
blog/
├─ content/                 # 日常创作区
│  ├─ posts/               # Markdown 文章及文章图片
│  ├─ pages/about.md       # 关于页面
│  ├─ assets/images/       # 头像、横幅等主题图片
│  ├─ public/              # favicon 等公开静态文件
│  ├─ config.ts            # 站点标题、导航、作者资料
│  └─ site.json            # 正式网址
├─ template/fuwari/        # 模板层，平时不要修改
├─ scripts/                # 构建、写作和模板更新工具
└─ .site/                  # 自动生成的站点，禁止手工编辑
```

## 日常写作

首次使用：

```powershell
pnpm install
pnpm dev
```

创建文章：

```powershell
pnpm new-post 我的第一篇文章
```

随后编辑 `content/posts/我的第一篇文章.md`。本地预览地址默认为 <http://localhost:4321>。

发布文章：

```powershell
git add content
git commit -m "发布：我的第一篇文章"
git push
```

Vercel 连接此 GitHub 仓库后会自动构建和发布。

## 修改博客资料

- 标题、语言、作者、导航：`content/config.ts`
- 正式域名：`content/site.json`
- 关于页面：`content/pages/about.md`
- 头像和横幅：`content/assets/images/`
- 文章：`content/posts/`

## 更新 Fuwari 模板

先提交自己的内容，然后运行：

```powershell
pnpm template:update
pnpm check
pnpm build
```

更新命令只替换 `template/fuwari/`，不会触碰 `content/`。确认页面正常后，再提交模板更新。

## Vercel 设置

从 GitHub 导入仓库时使用仓库根目录，不要把 Root Directory 设置成 `template/fuwari`。

- Framework Preset: Astro
- Install Command: 使用 `vercel.json`
- Build Command: 使用 `vercel.json`
- Output Directory: 使用 `vercel.json`

构建过程会把模板和内容组装到 `.site/`，再输出到 `.site/dist/`。
