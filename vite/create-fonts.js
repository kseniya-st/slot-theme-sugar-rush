import path from "path";
import { fileURLToPath } from "url";
import { readdirSync, existsSync, writeFileSync, statSync } from "fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const srcFontsPath = path.resolve(__dirname, "../src/fonts");
const scssFontsFile = path.resolve(__dirname, "../src/scss/fonts.scss");

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

function getFontStyleParams(fileName) {
    const name = fileName.toLowerCase();
    const weights = {
        thin: 100,
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
    };
    const styles = {
        italic: "italic",
        normal: "normal",
    };

    let weight = 400;
    let style = "normal";

    for (const [key, value] of Object.entries(weights)) {
        if (name.includes(key)) {
            weight = value;
            break;
        }
    }

    for (const [key, value] of Object.entries(styles)) {
        if (name.includes(key)) {
            style = value;
            break;
        }
    }

    return { weight, style };
}

function generateFontsScss() {
    if (!existsSync(srcFontsPath)) {
        console.warn("Fonts directory not found:", srcFontsPath);
        return;
    }

    const files = getAllFontFiles(srcFontsPath);
    const fontMap = {};

    for (const filePath of files) {
        const ext = path.extname(filePath);
        const basename = path.basename(filePath, ext);
        const dashIndex = basename.indexOf("-");
        let family = basename;
        let stylePart = "";
        if (dashIndex !== -1) {
            family = basename.slice(0, dashIndex);
            stylePart = basename.slice(dashIndex + 1);
        }

        const { weight, style } = getFontStyleParams(stylePart);
        const isVariable = basename.toLowerCase().includes("variablefont");
        const finalWeight = isVariable ? "100 900" : weight;
        const id = `${family}-${weight}-${style}`;
        if (!fontMap[id]) {
            fontMap[id] = {
                family,
                weight: finalWeight,
                style,
                name: basename,
            };
        }
    }

    let scss = ``;
    for (const id in fontMap) {
        const font = fontMap[id];
        scss += `@font-face {\n`;
        scss += `  font-family: "${font.family}";\n`;
        scss += `  font-display: swap;\n`;
        scss += `  src: `;

        const srcs = [
            `url("../../dist/fonts/${font.name}.woff2") format("woff2")`,
            `url("../../dist/fonts/${font.name}.woff") format("woff")`,
        ];

        scss += srcs.join(",") + ";\n";
        scss += `  font-weight: ${font.weight};\n`;
        scss += `  font-style: ${font.style};\n`;
        scss += `}\n\n`;
    }

    writeFileSync(scssFontsFile, scss, "utf8");
    console.log(`✅ Generated fonts.scss at ${scssFontsFile}`);
}

export default function fontScssGeneratorPlugin() {
    return {
        name: "font-scss-generator",
        configureServer() {
            generateFontsScss();
        },
        closeBundle() {
            generateFontsScss();
        },
    };
}
