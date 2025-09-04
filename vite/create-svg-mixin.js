import path from "path";
import { fileURLToPath } from "url";
import { readdirSync, existsSync, writeFileSync, statSync, mkdirSync } from "fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const srcSvgPath = path.resolve(__dirname, "../src/img/svg");
const iconsMixinFile = path.resolve(__dirname, "../src/mixins/icons.pug");

function getAllSvgFiles(dir) {
    let results = [];
    const list = readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllSvgFiles(filePath));
        } else if (file.endsWith(".svg")) {
            results.push(filePath);
        }
    });
    return results;
}

function createIconsSvgMixin() {
    if (!existsSync(srcSvgPath)) {
        console.warn("SVG directory not found:", srcSvgPath);
        return;
    }

    const files = getAllSvgFiles(srcSvgPath);
    let mixin = `mixin icon(name)`;
    for (const filePath of files) {
        const ext = path.extname(filePath);
        const basename = path.basename(filePath, ext);
        mixin += `\n    if name === '${basename}'`;
        mixin += `\n        include /img/svg/${basename}.svg`;
    }

    mkdirSync(path.dirname(iconsMixinFile), { recursive: true });

    writeFileSync(iconsMixinFile, mixin);
    console.log(`✅ SVG mixin created successfully: ${iconsMixinFile}`);
}

export default function createSvgMixinPlugin() {
    return {
        name: "create-svg-mixin",
        closeBundle() {
            createIconsSvgMixin();
        },
        configureServer(server) {
            createIconsSvgMixin();

            server.watcher.add(path.join(srcSvgPath, "**/*.svg"));
            ["add", "unlink"].forEach((event) => {
                server.watcher.on(event, (filePath) => {
                    if (filePath.endsWith(".svg")) {
                        createIconsSvgMixin();
                    }
                });
            });
        },
    };
}
