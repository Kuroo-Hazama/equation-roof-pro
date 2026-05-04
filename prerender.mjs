#!/usr/bin/env node
import { createServer } from "node:http";
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "dist");
const PORT = 4173;
const ORIGIN = `http://127.0.0.1:${PORT}`;

const ROUTES = [
  "/",
  "/entreprise",
  "/coeur-de-metier",
  "/solutions-innovantes",
  "/realisations",
  "/blog",
  "/avis-clients",
  "/a-propos",
  "/contact",
  "/recrutement",
  "/mentions-legales",
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".map": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

async function startStaticServer() {
  const indexHtml = await readFile(join(DIST, "index.html"));
  const server = createServer(async (req, res) => {
    try {
      const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
      const filePath = join(DIST, urlPath === "/" ? "index.html" : urlPath);
      if (filePath.startsWith(DIST) && existsSync(filePath)) {
        const s = await stat(filePath);
        if (s.isFile()) {
          const type = MIME[extname(filePath).toLowerCase()] || "application/octet-stream";
          res.writeHead(200, { "content-type": type });
          res.end(await readFile(filePath));
          return;
        }
      }
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(indexHtml);
    } catch (err) {
      res.writeHead(500);
      res.end(String(err));
    }
  });
  await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
  return server;
}

function routeToFile(route) {
  if (route === "/") return join(DIST, "index.html");
  return join(DIST, route.replace(/^\//, ""), "index.html");
}

async function prerender() {
  if (!existsSync(DIST)) {
    console.error(`[prerender] dist/ not found — run "vite build" first.`);
    process.exit(1);
  }

  const server = await startStaticServer();
  console.log(`[prerender] Static server up on ${ORIGIN}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    for (const route of ROUTES) {
      const url = ORIGIN + route;
      console.log(`[prerender] -> ${route}`);
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
      await page.waitForSelector("#root > *", { timeout: 30000 }).catch(() => {});

      const html = await page.content();
      const out = routeToFile(route);
      await mkdir(dirname(out), { recursive: true });
      await writeFile(out, html, "utf8");
      console.log(`[prerender]    saved ${out.replace(DIST, "dist")}`);
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`[prerender] Done — ${ROUTES.length} routes rendered.`);
}

prerender().catch((err) => {
  console.error("[prerender] failed:", err);
  process.exit(1);
});
