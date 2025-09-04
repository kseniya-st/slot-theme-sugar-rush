import path from "path";
import { readdirSync, statSync, mkdirSync } from "fs";
import esbuild from "esbuild";

const jsPath = path.resolve(process.cwd(), "src/js");
const outputPath = path.resolve(process.cwd(), "dist/js");

function getAllJsFiles(dir) {
    let results = [];
    const allowedDirs = ["blocks", "fragments"];
    const list = readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = statSync(filePath);
        if (stat && stat.isDirectory()) {
            const folderName = path.basename(filePath);

            if (allowedDirs.includes(folderName)) {
                results = results.concat(getAllJsFiles(filePath));
            }
        } else if (file.endsWith(".js") && file !== "app.js") {
            results.push(filePath);
        }
    });
    return results;
}

async function buildSeparateFiles() {
    const files = getAllJsFiles(jsPath);

    for (const file of files) {
        const relativeDir = path.relative(jsPath, path.dirname(file));
        const basename = path.basename(file, ".js");
        const outDir = path.join(outputPath, relativeDir);

        mkdirSync(outDir, { recursive: true });

        await esbuild.build({
            entryPoints: [file],
            bundle: true,
            minify: true,
            format: "iife",
            outfile: path.join(outDir, `${basename}.min.js`),
            sourcemap: false,
            logLevel: "error",
            banner: {
                js: '"use strict";',
            },
        });
    }
}

async function buildApp() {
    mkdirSync(outputPath, { recursive: true });

    await esbuild.build({
        entryPoints: [path.join(jsPath, "app.js")],
        bundle: true,
        minify: true,
        format: "iife",
        outfile: path.join(outputPath, "app.min.js"),
        sourcemap: false,
        logLevel: "error",
        banner: {
            js: '"use strict";',
        },
    });
}

async function compileJs() {
    try {
        await buildSeparateFiles();
        await buildApp();
        console.log("✅ JS compiled successfully");
    } catch (e) {
        console.error("❌ JS compile error:", e);
    }
}

export default function jsCompilerPlugin() {
    return {
        name: "js-compiler",
        closeBundle() {
            return compileJs();
        },
        configureServer(server) {
            compileJs();

            server.watcher.add(path.join(jsPath, "**/*.js"));
            server.watcher.on("change", (filePath) => {
                if (filePath.endsWith(".js")) {
                    compileJs();
                }
            });
        },
    };
}
