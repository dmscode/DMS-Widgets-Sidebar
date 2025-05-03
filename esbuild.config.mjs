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

/** 同步到 Obsidian 中 */
const fileList = [
	'manifest.json',
	'dist/styles.css',
	'dist/main.js',
]
const sync = (target) => {
  /** 如果目标文件夹不存在 */
  if (!fs.existsSync(target)) {
    console.log('同步目标文件夹不存在')
    return
  }
	fileList.forEach(file => {
		if(!fs.existsSync(file)) {
			console.log(`文件不存在：${file}`)
			return
		}
		/** 将文件复制到目标文件夹下同名文件 */
		fs.copyFileSync(file, `${target}/${file.replace(/^.*\//, '')}`);
		console.log(`同步文件：${file}`)
	})
}

if (prod) {
	await context.rebuild();
	process.exit(0);
} else {
	// await context.watch();
	await context.rebuild();
	sync('F:/Obsidian/.obsidian/plugins/DMS-Widget-Sidebar');
	process.exit(0);
}
