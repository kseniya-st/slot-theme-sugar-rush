import { resolve } from "path";
import { fileURLToPath } from "url";

// vite plugins
import viteRestart from "vite-plugin-restart";
import { viteStaticCopy } from "vite-plugin-static-copy";
import vituum from "vituum";
import pug from "@vituum/vite-plugin-pug";

// custom plugins
import scssPlugin from "./vite/compile-scss";
import jsCompilerPlugin from "./vite/compile-js";
import fontConverterPlugin from "./vite/convert-fonts";
import fontScssGeneratorPlugin from "./vite/create-fonts";
import createSvgMixinPlugin from "./vite/create-svg-mixin";
import copyComponentsToHtml from "./vite/copyComponentsToHtml";
import createMixinsAggregatorPlugin from "./vite/create-mixins-aggregator";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const srcPath = resolve(__dirname, "src");

const isProd = process.env.NODE_ENV === "production";
const cssFile = isProd ? "css/style.min.css" : "/src/scss/style.scss";
const jsFile = isProd ? "js/app.min.js" : "/src/js/app.js";
export default {
    server: {
        host: true,
        open: !("SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env),
        port: 3001,
    },
    build: {
        outDir: resolve(__dirname, "dist"),
        emptyOutDir: true,
        sourcemap: false,
        rollupOptions: {
            output: {
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith(".css")) {
                        return "css/[name][extname]";
                    }
                    if (assetInfo.name && /\.(png|jpe?g|gif|svg|webp)$/.test(assetInfo.name)) {
                        return "img/[name][extname]";
                    }
                    return "files/[name][extname]";
                },
            },
        },
        cssCodeSplit: true,
        cssMinify: false,
    },
    plugins: [
        fontScssGeneratorPlugin(),
        scssPlugin(),
        jsCompilerPlugin(),
        fontConverterPlugin(),
        copyComponentsToHtml(),
        createSvgMixinPlugin(),
        createMixinsAggregatorPlugin(),
        viteRestart(),
        viteStaticCopy({
            targets: [
                {
                    src: "./src/files/*",
                    dest: "files",
                    errorOnMissing: false,
                },
                {
                    src: "./src/img/svg/*",
                    dest: "img/svg",
                    errorOnMissing: false,
                },
                {
                    src: "./src/img/*",
                    dest: "img",
                    errorOnMissing: false,
                },
            ],
        }),
        vituum({
            input: ["src/pages/*.pug", "src/html/**/*.pug"],
        }),
     
        pug({
            root: srcPath,
            base: "./",
            globals: {
                cssPath: cssFile,
                jsPath: jsFile,
                jsType: isProd ? null : "module",
            },
            options: {
                pretty: true,
                basedir: srcPath,
            },
            data: ["src/data/**/*.json"],
        }),
    ],
};
