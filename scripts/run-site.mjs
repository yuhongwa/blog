import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const allowedCommands = new Set(["build", "check", "dev", "preview"]);
const [command, ...extraArguments] = process.argv.slice(2);

if (!allowedCommands.has(command)) {
	console.error(`Unknown command "${command ?? ""}".`);
	process.exit(1);
}

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptsDirectory, "..");
const generatedSite = path.join(repositoryRoot, ".site");
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const pnpmCli = process.env.npm_execpath;

function run(executable, arguments_, options = {}) {
	return new Promise((resolve, reject) => {
		const child = spawn(executable, arguments_, {
			cwd: repositoryRoot,
			stdio: "inherit",
			...options,
		});

		child.on("error", reject);
		child.on("exit", (code, signal) => {
			if (signal) {
				reject(new Error(`${executable} stopped with signal ${signal}.`));
				return;
			}
			if (code !== 0) {
				reject(new Error(`${executable} exited with code ${code}.`));
				return;
			}
			resolve();
		});
	});
}

function runPnpm(arguments_) {
	if (pnpmCli && /\.(?:c?js|mjs)$/i.test(pnpmCli)) {
		return run(process.execPath, [pnpmCli, ...arguments_]);
	}

	return run(pnpm, arguments_, { shell: process.platform === "win32" });
}

try {
	await run(process.execPath, [path.join(scriptsDirectory, "compose-site.mjs")]);
	await runPnpm(["--dir", generatedSite, "install", "--frozen-lockfile"]);
	await runPnpm(["--dir", generatedSite, "run", command, ...extraArguments]);
} catch (error) {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
}
