import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const arguments_ = process.argv.slice(2);
const contentTypes = {
	post: { directory: "articles", category: "Articles" },
	doc: { directory: "docs", category: "Documentation" },
	note: { directory: "notes", category: "Notes" },
};
const requestedType = arguments_[0] in contentTypes ? arguments_.shift() : "post";
const requestedName = arguments_.join(" ").trim();
if (!requestedName) {
	console.error('Usage: pnpm new:post "Title"');
	console.error('       pnpm new:doc "Title"');
	console.error('       pnpm new:note "Title"');
	process.exit(1);
}

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const postsDirectory = path.resolve(scriptsDirectory, "..", "content", "posts");
const typeConfig = contentTypes[requestedType];
const typeDirectory = path.join(postsDirectory, typeConfig.directory);
const relativeName = requestedName.endsWith(".md") ? requestedName : `${requestedName}.md`;
const target = path.resolve(typeDirectory, relativeName);
const relativeTarget = path.relative(postsDirectory, target);

if (
	relativeTarget.startsWith("..") ||
	path.isAbsolute(relativeTarget) ||
	!relativeTarget.toLowerCase().endsWith(".md")
) {
	console.error("Content must stay inside content/posts and use the .md extension.");
	process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const title = path.basename(relativeName, ".md");
const document = `---
title: ${title}
published: ${today}
description:
tags: []
category: ${typeConfig.category}
draft: true
lang: en
---

Start writing here.
`;

await mkdir(path.dirname(target), { recursive: true });

try {
	await writeFile(target, document, { encoding: "utf8", flag: "wx" });
	console.log(`Created ${target}`);
} catch (error) {
	if (error && error.code === "EEXIST") {
		console.error(`File already exists: ${target}`);
		process.exit(1);
	}
	throw error;
}
