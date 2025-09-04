import path from "path";
import { fileURLToPath } from "url";
import * as sass from "sass";
import { readdirSync, existsSync, mkdirSync, writeFileSync, statSync } from "fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const srcPath = path.resolve(__dirname, "../src");
const scssPath = path.resolve(srcPath, "scss");
const outputPath = path.resolve(__dirname, "../dist/css");

function getAllScssFiles(dir) {
    let results = [];
    const list = readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = statSync(filePath);

        if (stat && stat.isDirectory()) {
            const dir = path.relative(scssPath, filePath);
            if (["blocks", "fragments"].includes(dir)) {
                results = results.concat(getAllScssFiles(filePath));
            }
        } else if (file.endsWith(".scss") && !file.startsWith("_")) {
            const relativePath = path.relative(scssPath, filePath);
            const isAnAllowedFile = ["style.scss", "global.scss"].includes(path.basename(filePath));
            const isAnAllowedFolder =
                relativePath.startsWith("blocks" + path.sep) ||
                relativePath.startsWith("fragments" + path.sep);

            if (isAnAllowedFile || isAnAllowedFolder) {
                results.push(filePath);
            }
        }
    });
    return results;
}

function compileScss() {
    if (!existsSync(scssPath)) {
        console.warn("SCSS directory not found:", scssPath);
        return;
    }

    const files = getAllScssFiles(scssPath);

    if (files.length === 0) {
        console.warn("No SCSS files found in:", scssPath);
        return;
    }

    let hasError = false;

    files.forEach((file) => {
        const relativeDir = path.relative(scssPath, path.dirname(file));
        const basename = path.basename(file, ".scss");
        const targetDir = path.join(outputPath, relativeDir);

        if (!existsSync(targetDir)) {
            mkdirSync(targetDir, { recursive: true });
        }

        try {
            const expandedResult = sass.compile(file, { style: "expanded" });
            writeFileSync(path.join(targetDir, `${basename}.css`), expandedResult.css);

            const minifiedResult = sass.compile(file, { style: "compressed" });
            let minifiedCss = minifiedResult.css;
            if (basename === "style" || basename === "global") {
                minifiedCss = '@charset "UTF-8";' + minifiedCss.replace(/^\uFEFF?/, '');
            }
            writeFileSync(path.join(targetDir, `${basename}.min.css`), Buffer.from(minifiedCss, 'utf8'));
        } catch (error) {
            console.error(`Error compiling ${file}:`, error.message);
        }
    });

    if (!hasError) console.log(`✅ Compiled .css and .min.css files successfully`);
}

export default function scssPlugin() {
    return {
        name: "scss-compiler",
        closeBundle() {
            compileScss();
        },
        configureServer(server) {
            compileScss();

            server.watcher.add(path.join(scssPath, "**/*.scss"));
            server.watcher.on("change", (filePath) => {
                if (filePath.endsWith(".scss")) {
                    compileScss();
                }
            });
        },
    };
}
