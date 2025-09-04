import path from "path";
import fse from "fs-extra";

const componentsDir = path.resolve("src/components");
const htmlTargetDir = path.resolve("src/html");

async function copyAllComponentsContents() {
    // await fse.ensureDir(htmlTargetDir);
    // const items = await fse.readdir(componentsDir);
    // for (const item of items) {
    //     const src = path.join(componentsDir, item);
    //     const dest = path.join(htmlTargetDir, item);
    //     await fse.copy(src, dest);
    // }

    await fse.ensureDir(htmlTargetDir);
    const items = await fse.readdir(componentsDir, { withFileTypes: true });

    for (const item of items) {
        const src = path.join(componentsDir, item.name);

        if (item.isDirectory()) {
            await copyAllComponentsContentsRecursive(src, path.relative(componentsDir, src));
        } else {
            await copyFile(src);
        }
    }
}

async function copyAllComponentsContentsRecursive(dir, relBase) {
    const items = await fse.readdir(dir, { withFileTypes: true });

    for (const item of items) {
        const src = path.join(dir, item.name);
        const relPath = path.join(relBase, item.name);

        if (item.isDirectory()) {
            await copyAllComponentsContentsRecursive(src, relPath);
        } else {
            await copyFile(src);
        }
    }
}

function isInsideComponents(file) {
    const rel = path.relative(componentsDir, file);
    return !!rel && !rel.startsWith("..") && !path.isAbsolute(rel);
}

export default function copyComponentsToHtml() {
    return {
        name: "vite-plugin-copy-components-to-html",
        apply: "serve",
        async configureServer(server) {
            await copyAllComponentsContents();

            server.watcher.on("add", async (file) => {
                if (isInsideComponents(file)) {
                    await copyFile(file);
                }
            });

            server.watcher.on("change", async (file) => {
                if (isInsideComponents(file)) {
                    await copyFile(file);
                }
            });

            server.watcher.on("unlink", async (file) => {
                if (isInsideComponents(file)) {
                    await deleteFile(file);
                }
            });

            server.watcher.on("unlinkDir", async (dir) => {
                if (isInsideComponents(dir)) {
                    const relPath = path.relative(componentsDir, dir);
                    const targetDir = path.join(htmlTargetDir, relPath);
                    await fse.remove(targetDir);
                    console.log(`[copy-components] dir deleted: ${relPath}`);
                }
            });
        },
    };
}

async function copyFile(file) {
    const relPath = path.relative(componentsDir, file);
    const targetPath = path.join(htmlTargetDir, relPath);

    await fse.ensureDir(path.dirname(targetPath));

    const srcContent = await fse.readFile(file, "utf8");

    const mixinMatch = srcContent.match(/mixin\s+([a-zA-Z0-9_]+)\(([^)]*)\)/);
    const dataMatch = srcContent.match(/\/\/-\s*@defaultData\s*=\s*(.+)/);

    if (mixinMatch && dataMatch) {
        const mixinName = mixinMatch[1];
        const mixinArg = mixinMatch[2].trim();
        const defaultData = dataMatch[1].trim();

        // Формируем путь для include
        // /components/fragments/blog-card.pug
        // Пусть имя файла blog-card.pug → blogCard
        const fileName = path.basename(file, path.extname(file)); // blog-card
        const fragmentPath = `/components/fragments/${fileName}.pug`;

        // Формируем итоговое содержимое
        const resultContent = `include ${fragmentPath}
+${mixinName}(${defaultData})
`;

        await fse.writeFile(targetPath, resultContent, "utf8");
        console.log(`[copy-components] generated demo for mixin: ${relPath}`);
    } else {
        // Просто копируем, если миксина нет
        await fse.copyFile(file, targetPath);
        console.log(`[copy-components] copied: ${relPath}`);
    }
}

async function deleteFile(file) {
    const relPath = path.relative(componentsDir, file);
    const targetPath = path.join(htmlTargetDir, relPath);
    if (await fse.pathExists(targetPath)) {
        await fse.remove(targetPath);
        console.log(`[copy-components] deleted: ${relPath}`);
    }
}
