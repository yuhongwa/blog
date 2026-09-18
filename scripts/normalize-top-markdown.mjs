import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("content", "posts");
const files = (await readdir(root)).filter((name) => name.startsWith("TOP") && name.endsWith(".md"));

function escapeLabel(value) {
	return value.replaceAll("\\", "\\\\").replaceAll("[", "\\[").replaceAll("]", "\\]").trim();
}

for (const name of files) {
	const file = path.join(root, name);
	const source = await readFile(file, "utf8");
	const mergedSource = source.replaceAll("\r\n", "\n")
		.replace(/【([^\n]+)\n([^\n]+)】\s+(\[https?:\/\/[^\]]+\]\(https?:\/\/[^)]+\))/g, "【$1$2】 $3")
		.replace(/([^\n])\n\n(-\s+\[打开来源\]\(https?:\/\/[^)]+\))/g, "$1\n$2");
	const lines = mergedSource.split("\n");
	const output = [];

	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index];
		const next = lines[index + 1]?.trim() || "";
		const heading = line.trim().match(/^【([\s\S]+)】$/);
		const inlineHeading = line.trim().match(/^【([\s\S]+)】\s+\[https?:\/\/[^\]]+\]\((https?:\/\/[^)]+)\)$/);
		const listHeading = line.trim().match(/^-\s+(.+)$/);
		const nextLink = next.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
		const nextUrl = next.match(/^(https?:\/\/\S+)$/);
		const sourceLink = next.match(/^-\s+\[打开来源\]\((https?:\/\/[^)]+)\)$/);
		if (sourceLink && line.trim() && !line.trim().startsWith("#") && !line.trim().startsWith("---") && !line.trim().startsWith("- [")) {
			const label = line.trim().replace(/^[-*+]\s+/, "");
			output.push(`- [${escapeLabel(label)}](${sourceLink[1]})`);
			index += 1;
			continue;
		}
		if (inlineHeading) {
			output.push(`- [${escapeLabel(inlineHeading[1])}](${inlineHeading[2]})`);
			continue;
		}

		if (heading && (nextLink || nextUrl)) {
			const url = nextLink ? nextLink[2] : nextUrl[1];
			output.push(`- [${escapeLabel(heading[1])}](${url})`);
			index += 1;
			continue;
		}
		if (listHeading && (nextLink || nextUrl) && !line.includes("](")) {
			const url = nextLink ? nextLink[2] : nextUrl[1];
			output.push(`- [${escapeLabel(listHeading[1])}](${url})`);
			index += 1;
			continue;
		}

		const standalone = line.trim().match(/^\[https?:\/\/[^\]]+\]\((https?:\/\/[^)]+)\)$/);
		if (standalone) {
			output.push(`- [打开来源](${standalone[1]})`);
			continue;
		}
		const bareUrl = line.trim().match(/^(https?:\/\/\S+)$/);
		if (bareUrl) {
			output.push(`- [打开来源](${bareUrl[1]})`);
			continue;
		}
		output.push(line);
	}

	let normalized = output.join("\n");
	const bodyStart = normalized.indexOf("\n---\n", normalized.indexOf("\n---\n") + 1);
	if (bodyStart >= 0) {
		const prefix = normalized.slice(0, bodyStart + 5);
		const bodyLines = normalized.slice(bodyStart + 5).split("\n");
		for (let index = 0; index < bodyLines.length; index += 1) {
			if (bodyLines[index].trim() === "代表作") bodyLines[index] = "#### 代表作";
			if (/^wiki\s+\[https?:\/\/[^\]]+\]\(https?:\/\/[^)]+\)$/i.test(bodyLines[index].trim())) {
				bodyLines[index] = bodyLines[index].replace(/^wiki\s+\[[^\]]+\]\((https?:\/\/[^)]+)\)$/i, "- [Wiki]($1)");
			}
			let nextIndex = index + 1;
			while (nextIndex < bodyLines.length && !bodyLines[nextIndex].trim()) nextIndex += 1;
			const current = bodyLines[index].trim();
			if (current && !current.startsWith("#") && !current.startsWith("-") && !current.startsWith("[") && !current.startsWith("---") && nextIndex < bodyLines.length && /^-\s+\[/.test(bodyLines[nextIndex].trim()) && current.length <= 90 && !/[。！？：；]$/.test(current)) {
				bodyLines[index] = `### ${current}`;
			}
		}
		normalized = prefix + bodyLines.join("\n");
	}
	normalized = normalized.replace(/\n{3,}/g, "\n\n");
	normalized = normalized.replace(/^- \[Wiki\] \[https?:\/\/[^\]]+\]\((https?:\/\/[^)]+)\)$/gm, "- [Wiki]($1)");
	normalized = normalized.replace(/^(#{1,6} .+)\n(?!\n)/gm, "$1\n\n");
	const frontmatterEnd = normalized.indexOf("\n---\n", 4);
	if (frontmatterEnd >= 0) normalized = normalized.slice(0, frontmatterEnd + 5) + normalized.slice(frontmatterEnd + 5).replace(/^(---)\n(?!\n)/, "$1\n\n");
	normalized = normalized.replace(/^---\n\n/, "---\n");
	if (!normalized.endsWith("\n")) normalized += "\n";
	if (normalized !== source) await writeFile(file, normalized, "utf8");
}
