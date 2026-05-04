#!/usr/bin/env node
import { readdir, stat, readFile, writeFile, rename, unlink } from "node:fs/promises";
import { join, extname, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "src", "assets");
const MAX_WIDTH = 1200;
const JPG_QUALITY = 80;

const KEEP_PNG = new Set([
  "logo-equation-main",
  "certifications",
  "signature-efficacite",
  "banner-equation-01",
  "banner-equation-02",
]);

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function processFile(file) {
  const ext = extname(file).toLowerCase();
  const name = basename(file, ext);
  if (![".jpg", ".jpeg", ".png"].includes(ext)) return;

  const before = (await stat(file)).size;
  const input = await readFile(file);
  const isLogoPng =
    ext === ".png" &&
    (KEEP_PNG.has(name) ||
      name.startsWith("banner-equation") ||
      name.includes("logo"));

  let pipeline = sharp(input).rotate().resize({
    width: MAX_WIDTH,
    withoutEnlargement: true,
    fit: "inside",
  });

  let outPath = file;
  let outBuf;

  if (isLogoPng) {
    outBuf = await pipeline.png({ compressionLevel: 9, palette: true }).toBuffer();
  } else if (ext === ".png") {
    outBuf = await pipeline.jpeg({ quality: JPG_QUALITY, mozjpeg: true }).toBuffer();
    outPath = join(dirname(file), `${name}.jpg`);
  } else {
    outBuf = await pipeline.jpeg({ quality: JPG_QUALITY, mozjpeg: true }).toBuffer();
  }

  await writeFile(outPath, outBuf);
  if (outPath !== file) await unlink(file);

  const after = outBuf.length;
  const saved = before - after;
  const pct = ((saved / before) * 100).toFixed(1);
  const rel = file.replace(ROOT + "/", "");
  const arrow = outPath !== file ? ` -> ${basename(outPath)}` : "";
  console.log(
    `${rel}${arrow}  ${fmt(before)} -> ${fmt(after)}  (${saved >= 0 ? "-" : "+"}${pct}%)`
  );
  return { before, after };
}

async function main() {
  console.log(`[compress] root: ${ROOT}`);
  console.log(`[compress] max width: ${MAX_WIDTH}px, JPG quality: ${JPG_QUALITY}%`);
  console.log("");

  let totalBefore = 0;
  let totalAfter = 0;
  let count = 0;

  for await (const file of walk(ROOT)) {
    try {
      const result = await processFile(file);
      if (result) {
        totalBefore += result.before;
        totalAfter += result.after;
        count++;
      }
    } catch (err) {
      console.error(`[compress] failed on ${file}:`, err.message);
    }
  }

  console.log("");
  console.log(`[compress] processed ${count} files`);
  console.log(`[compress] total: ${fmt(totalBefore)} -> ${fmt(totalAfter)}  (saved ${fmt(totalBefore - totalAfter)}, ${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1)}%)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
