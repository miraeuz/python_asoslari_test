// Copies the Pyodide runtime (CPython compiled to WebAssembly) into
// public/pyodide so Part 3 can run student code fully offline.
// Runs automatically after `npm install` and before `npm run build`.
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "pyodide");
const dst = join(root, "public", "pyodide");
const files = ["pyodide.mjs", "pyodide.asm.js", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"];

if (!existsSync(src)) {
  console.warn("[pyodide] node_modules/pyodide topilmadi — oʻtkazib yuborildi.");
  process.exit(0);
}
mkdirSync(dst, { recursive: true });
let copied = 0;
for (const f of files) {
  const from = join(src, f);
  const to = join(dst, f);
  if (!existsSync(from)) {
    console.warn(`[pyodide] ${f} yoʻq`);
    continue;
  }
  if (existsSync(to) && statSync(to).size === statSync(from).size) continue;
  copyFileSync(from, to);
  copied++;
}
const { version } = JSON.parse(readFileSync(join(src, "package.json"), "utf8"));
console.log(`[pyodide] ${version} → public/pyodide (${copied} ta fayl yangilandi)`);
