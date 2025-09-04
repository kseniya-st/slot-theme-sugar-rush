import path from "path";
import { fileURLToPath } from "url";
import { readdirSync, existsSync, mkdirSync, writeFileSync, statSync, readFileSync, copyFileSync  } from "fs";
import ttf2woff from "ttf2woff";
import ttf2woff2 from "ttf2woff2";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const srcFontsPath = path.resolve(__dirname, "../src/fonts");
const distFontsPath = path.resolve(__dirname, "../dist/fonts");

function getAllFontFiles(dir) {
    let results = [];
    const list = readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFontFiles(filePath));
        } else if (/\.(ttf|woff2?|otf)$/.test(file)) {
            results.push(filePath);
        }
    });
    return results;
}

function convertFonts() {
    if (!existsSync(srcFontsPath)) {
        console.warn("Fonts directory not found:", srcFontsPath);
        return;
    }

    const files = getAllFontFiles(srcFontsPath);

    if (files.length === 0) {
        console.warn("No TTF font files found in:", srcFontsPath);
        return;
    }

    files.forEach((file) => {
        const ext = path.extname(file).toLowerCase();
        const relativeDir = path.relative(srcFontsPath, path.dirname(file));
        const basename = path.basename(file, ext);
        const targetDir = path.join(distFontsPath, relativeDir);

        if (!existsSync(targetDir)) {
            mkdirSync(targetDir, { recursive: true });
        }

        const targetBase = path.join(targetDir, basename);

        if (ext === ".ttf") {
            const ttf = readFileSync(file);

            // Convert to WOFF
            const woff = Buffer.from(ttf2woff(ttf).buffer);
            writeFileSync(`${targetBase}.woff`, woff);

            // Convert to WOFF2
            const woff2 = ttf2woff2(ttf);
            writeFileSync(`${targetBase}.woff2`, woff2);
        } else if (ext === ".woff" || ext === ".woff2") {
            copyFileSync(file, `${targetBase}${ext}`);
        }
    });

    console.log(`✅ Converted fonts to .woff, .woff2`);
}

export default function fontConverterPlugin() {
    return {
        name: "font-converter",
        configureServer() {
            convertFonts();
        },
        closeBundle() {
            convertFonts();
        },
    };
}
