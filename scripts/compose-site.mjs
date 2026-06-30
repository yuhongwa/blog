import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptsDirectory, "..");
const templateDirectory = path.join(repositoryRoot, "template", "fuwari");
const contentDirectory = path.join(repositoryRoot, "content");
const outputDirectory = path.join(repositoryRoot, ".site");

function assertInsideRepository(candidate) {
	const relative = path.relative(repositoryRoot, candidate);
	if (relative.startsWith("..") || path.isAbsolute(relative)) {
		throw new Error(`Path escaped the repository: ${candidate}`);
	}
}

async function replaceDirectory(source, destination) {
	await rm(destination, { recursive: true, force: true });
	await mkdir(path.dirname(destination), { recursive: true });
	await cp(source, destination, { recursive: true });
}

function shouldCopyTemplate(source) {
	const relative = path.relative(templateDirectory, source);
	if (!relative) return true;

	const excluded = new Set([".git", ".astro", ".vercel", "dist", "node_modules"]);
	return !relative.split(path.sep).some((segment) => excluded.has(segment));
}

async function configureSiteUrl() {
	const settingsPath = path.join(contentDirectory, "site.json");
	const settings = JSON.parse(await readFile(settingsPath, "utf8"));
	const siteUrl = new URL(settings.url);

	if (!["http:", "https:"].includes(siteUrl.protocol)) {
		throw new Error("content/site.json must contain an http(s) URL.");
	}

	const configPath = path.join(outputDirectory, "astro.config.mjs");
	const config = await readFile(configPath, "utf8");
	const siteProperty = /(\bsite\s*:\s*)["'`][^"'`\r\n]+["'`](\s*,)/;
	const replacement = `$1${JSON.stringify(siteUrl.href)}$2`;

	if (!siteProperty.test(config)) {
		throw new Error("Unable to locate the site property in the Fuwari Astro config.");
	}

	await writeFile(configPath, config.replace(siteProperty, replacement), "utf8");
}

async function main() {
	for (const directory of [templateDirectory, contentDirectory, outputDirectory]) {
		assertInsideRepository(directory);
	}

	await rm(outputDirectory, { recursive: true, force: true });
	await mkdir(outputDirectory, { recursive: true });
	await cp(templateDirectory, outputDirectory, {
		recursive: true,
		filter: shouldCopyTemplate,
	});

	await replaceDirectory(
		path.join(contentDirectory, "posts"),
		path.join(outputDirectory, "src", "content", "posts"),
	);

	const generatedSpecDirectory = path.join(outputDirectory, "src", "content", "spec");
	await rm(generatedSpecDirectory, { recursive: true, force: true });
	await mkdir(generatedSpecDirectory, { recursive: true });
	await cp(
		path.join(contentDirectory, "pages", "about.md"),
		path.join(generatedSpecDirectory, "about.md"),
	);

	await cp(
		path.join(contentDirectory, "config.ts"),
		path.join(outputDirectory, "src", "config.ts"),
	);

	await replaceDirectory(
		path.join(contentDirectory, "assets", "images"),
		path.join(outputDirectory, "src", "assets", "images"),
	);

	await cp(
		path.join(contentDirectory, "public"),
		path.join(outputDirectory, "public"),
		{ recursive: true, force: true },
	);

	await configureSiteUrl();

	// pnpm 10+ blocks dependency build scripts unless they are explicitly trusted.
	// pnpm 9 (used by Vercel for this project) safely ignores this newer setting.
	await writeFile(
		path.join(outputDirectory, "pnpm-workspace.yaml"),
		[
			"packages:",
			"  - '.'",
			"",
			"allowBuilds:",
			"  '@parcel/watcher': true",
			"  esbuild: true",
			"  sharp: true",
			"  swup: true",
			"",
		].join("\n"),
		"utf8",
	);

	console.log(`Prepared site in ${outputDirectory}`);
}

await main();
