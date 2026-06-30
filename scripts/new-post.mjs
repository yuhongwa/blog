import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const requestedName = process.argv.slice(2).join(" ").trim();
if (!requestedName) {
	console.error("用法：pnpm new-post 文章名称");
	process.exit(1);
}

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const postsDirectory = path.resolve(scriptsDirectory, "..", "content", "posts");
const relativeName = requestedName.endsWith(".md") ? requestedName : `${requestedName}.md`;
const target = path.resolve(postsDirectory, relativeName);
const relativeTarget = path.relative(postsDirectory, target);

if (
	relativeTarget.startsWith("..") ||
	path.isAbsolute(relativeTarget) ||
	!relativeTarget.toLowerCase().endsWith(".md")
) {
	console.error("文章必须创建在 content/posts 内，并使用 .md 扩展名。");
	process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const title = path.basename(relativeName, ".md");
const document = `---
title: ${title}
published: ${today}
description:
tags: []
category:
draft: true
lang: zh_CN
---

从这里开始写作。
`;

await mkdir(path.dirname(target), { recursive: true });

try {
	await writeFile(target, document, { encoding: "utf8", flag: "wx" });
	console.log(`已创建 ${target}`);
} catch (error) {
	if (error && error.code === "EEXIST") {
		console.error(`文件已经存在：${target}`);
		process.exit(1);
	}
	throw error;
}
