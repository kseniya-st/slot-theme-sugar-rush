import path from "path";
import { fileURLToPath } from "url";
import { readdirSync, existsSync, readFileSync, writeFileSync, statSync } from "fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const srcComponentsPath = path.resolve(__dirname, "../src/components");
const baseLayoutFile = path.resolve(__dirname, "../src/layouts/base.pug");

function getAllPugFiles(dir) {
    let results = [];
    const list = readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllPugFiles(filePath));
        } else if (file.endsWith(".pug")) {
            results.push(filePath);
        }
    });
    return results;
}

function updateBaseLayout() {
    if (!existsSync(srcComponentsPath)) {
        console.warn("Components directory not found:", srcComponentsPath);
        return;
    }
    if (!existsSync(baseLayoutFile)) {
        console.warn("Base layout file not found:", baseLayoutFile);
        return;
    }

    const files = getAllPugFiles(srcComponentsPath);
    const includes = [];

    for (const filePath of files) {
        const content = readFileSync(filePath, "utf8");
        if (content.includes("@mixin")) {
            // Относительный путь для include
            const relativePath = path.relative(path.resolve(__dirname, "../src"), filePath).replace(/\\/g, "/");
            includes.push(`include /${relativePath}`);
        }
    }

    // Читаем текущий base.pug
    const baseContent = readFileSync(baseLayoutFile, "utf8");
    
    // Удаляем предыдущие автогенерированные include
    const newBaseContent = baseContent.replace(
        /\/\/\- AUTO-INJECT-START[\s\S]*?\/\/\- AUTO-INJECT-END\n?/,
        ""
    );

    // Добавляем новые include в начало
    const injectBlock = [
        "//- AUTO-INJECT-START",
        ...includes,
        "//- AUTO-INJECT-END",
        ""
    ].join("\n");

    writeFileSync(baseLayoutFile, injectBlock + newBaseContent, "utf8");

    console.log(`✅ Base layout updated. ${includes.length} mixins added.`);
}

export default function createMixinsAggregatorPlugin() {
    return {
        name: "create-components-mixins",
        closeBundle() {
            updateBaseLayout();
        },
        configureServer(server) {
            server.watcher.add(path.join(srcComponentsPath, "**/*.pug"));
            ["add", "unlink", "change"].forEach((event) => {
                server.watcher.on(event, (filePath) => {
                    if (filePath.endsWith(".pug")) {
                        updateBaseLayout();
                    }
                });
            });
        },
    };
}
