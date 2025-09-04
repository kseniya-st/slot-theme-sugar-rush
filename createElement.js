// createElement.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const [elementType, elementName] = process.argv.slice(2);
const __dirname = fileURLToPath(new URL(".", import.meta.url));

if (!elementName || !elementType) {
    console.error(
        `❌ Не указано имя или тип элемента.\nПример использования: node createElement.js fragment/block myFragment`
    );
    process.exit(1);
}

if (elementType !== "block" && elementType !== "fragment") {
    console.error(`❌ Недопустимый тип элемента. Допустимые значения: block, fragment`);
    process.exit(1);
}

const componentsDir = path.join(__dirname, `src/components/${elementType}s`);
const scssDirectory = path.join(__dirname, `src/scss/${elementType}s`);
const elementImportScssFile = path.join(__dirname, `src/scss/${elementType}s/_index.scss`);

createDirectoryIfNonExist(componentsDir);
createDirectoryIfNonExist(scssDirectory);

const componentFilePath = path.join(componentsDir, `${elementName}.pug`);
const scssFilePath = path.join(scssDirectory, `${elementName}.scss`);

createFileIfNotExist(componentFilePath, generateComponentContent(elementName), `${elementName}.pug`);
createFileIfNotExist(scssFilePath, generateScssContent(elementName), `${elementName}.scss`);
appendScssImport(elementImportScssFile, elementName);

function createDirectoryIfNonExist(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Директория создана: ${dirPath}`);
    }
}

function createFileIfNotExist(filePath, content, fileName) {
    if (fs.existsSync(filePath)) {
        console.error(`❌ Файл ${fileName} уже существует.`);
        process.exit(1);
    } else {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Файл ${fileName} успешно создан.`);
    }
}

function generateComponentContent(name) {
    if (elementType === "block") {
        return `include /layouts/base.pug\nsection.wrapper.${name} ${name}\n`;
    } else {
        return `include /layouts/base.pug\ndiv.${name} ${name}\n`;
    }
}

function generateScssContent(name) {
    return `@use "../settings" as *;

.${name} {
    // Стили элемента
}
`;
}

function appendScssImport(elementImportScssFilePath, elementName) {
    if (!fs.existsSync(elementImportScssFilePath)) {
        fs.writeFileSync(elementImportScssFilePath, "");
        console.log(`✅ Файл _index.scss успешно добавлен.`);
    }

    if (fs.existsSync(elementImportScssFilePath)) {
        const importStatement = `@use "${elementName}.scss";\n`;
        const fileContent = fs.readFileSync(elementImportScssFilePath, "utf8");

        // Проверим — если импорт уже есть, не добавлять
        if (!fileContent.includes(importStatement)) {
            fs.appendFileSync(elementImportScssFilePath, importStatement);
            console.log(`✅ Импорт файла ${elementName}.scss успешно добавлен.`);
        } else {
            console.log(`❗ Импорт для ${elementName}.scss уже есть в ${elementType}s/_index.scss.`);
        }
    } else {
        console.error(`❌ Файл _index.scss не найден по пути: ${elementImportScssFilePath}`);
        process.exit(1);
    }
}
