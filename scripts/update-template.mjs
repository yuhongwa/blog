import { execFileSync } from "node:child_process";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const upstreamUrl = "https://github.com/saicaca/fuwari.git";
const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptsDirectory, "..");
const templateParent = path.join(repositoryRoot, "template");
const templateDirectory = path.join(templateParent, "fuwari");
const updateDirectory = path.join(templateParent, `.update-${Date.now()}`);
const backupDirectory = path.join(templateParent, `.fuwari-backup-${Date.now()}`);

function git(arguments_, options = {}) {
	return execFileSync("git", arguments_, {
		cwd: repositoryRoot,
		encoding: "utf8",
		stdio: ["ignore", "pipe", "inherit"],
		...options,
	}).trim();
}

const templateChanges = git(["status", "--porcelain", "--", "template/fuwari"]);
if (templateChanges) {
	console.error("模板目录存在未提交修改。请先提交或还原这些修改，再更新模板。");
	process.exit(1);
}

await mkdir(templateParent, { recursive: true });

let backupCreated = false;
try {
	git(["clone", "--depth", "1", upstreamUrl, updateDirectory]);
	const commit = git(["-C", updateDirectory, "rev-parse", "HEAD"]);
	await rm(path.join(updateDirectory, ".git"), { recursive: true, force: true });

	await rename(templateDirectory, backupDirectory);
	backupCreated = true;
	await rename(updateDirectory, templateDirectory);

	const versionPath = path.join(templateParent, "upstream.json");
	let previous = {};
	try {
		previous = JSON.parse(await readFile(versionPath, "utf8"));
	} catch {
		// The version file is optional on the first update.
	}

	await writeFile(
		versionPath,
		`${JSON.stringify(
			{
				repository: upstreamUrl,
				ref: "main",
				commit,
				previousCommit: previous.commit ?? null,
				updatedAt: new Date().toISOString(),
			},
			null,
			2,
		)}\n`,
		"utf8",
	);

	await rm(backupDirectory, { recursive: true, force: true });
	console.log(`Fuwari 已更新到 ${commit.slice(0, 12)}。`);
	console.log("下一步：运行 pnpm check 和 pnpm build。");
} catch (error) {
	if (backupCreated) {
		await rm(templateDirectory, { recursive: true, force: true });
		await rename(backupDirectory, templateDirectory);
	}
	await rm(updateDirectory, { recursive: true, force: true });
	throw error;
}
