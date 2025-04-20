import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import fs from "fs";
import path from "path";

/** 读取 package.json 和 manifest.json */
const pkg = JSON.parse(fs.readFileSync('./package.json', { encoding:'utf8', flag:'r' }));
const manifest = JSON.parse(fs.readFileSync('./manifest.json', { encoding:'utf8', flag:'r' }));

/** 生成 banner */
const banner =
`/**
 * @name: ${manifest.name}
 * @author: ${pkg.author}
 * @description: ${pkg.description}
 * @created: 2025-04-17 11:02:34
 * @updated: ${new Date().toLocaleString().replace(/\//g, "-")}
 * @version: ${pkg.version}
 */
`;

const prod = (process.argv[2] === "production");

const context = await esbuild.context({
	banner: {
		js: banner,
	},
	entryPoints: ["src/main.ts"],
	bundle: true,
	external: [
		"obsidian",
		"electron",
		"@codemirror/autocomplete",
		"@codemirror/collab",
		"@codemirror/commands",
		"@codemirror/language",
		"@codemirror/lint",
		"@codemirror/search",
		"@codemirror/state",
		"@codemirror/view",
		"@lezer/common",
		"@lezer/highlight",
		"@lezer/lr",
		...builtins],
	format: "cjs",
	target: "es2018",
	logLevel: "info",
	sourcemap: prod ? false : "inline",
	treeShaking: true,
	outfile: "dist/main.js",
	minify: prod,
});

const copyFiles = async (target) => {
	const files = [
		"manifest.json",
		"src/styles.css",
		"dist/main.js",
	];
	for (const file of files) {
		if (fs.existsSync(file)) {
			fs.copyFileSync(file, path.join(target, file.replace(/^.*\//, "")));
		}
	}
};

if (prod) {
	await context.rebuild();
	process.exit(0);
} else {
	// await context.watch();
	await context.rebuild();
	copyFiles('F:/Obsidian/.obsidian/plugins/DMS-Widget-Sidebar');
	process.exit(0);
}
