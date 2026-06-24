import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const [inputPath, outDir] = process.argv.slice(2);
const diagrams = JSON.parse(await fs.readFile(inputPath, "utf8"));
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2 });

await page.setContent(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    body { margin: 0; padding: 32px; background: white; font-family: Arial, sans-serif; }
    #box { display: inline-block; background: white; }
    svg { max-width: 1300px; height: auto; }
  </style>
</head>
<body><div id="box"></div></body>
</html>`, { waitUntil: "networkidle" });

await page.waitForFunction(() => window.mermaid);
await page.evaluate(() => {
  window.mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    securityLevel: "loose",
    flowchart: { htmlLabels: true, curve: "basis" },
    er: { useMaxWidth: true }
  });
});

for (const diagram of diagrams) {
  const outPath = path.join(outDir, `${diagram.id}.png`);
  await page.evaluate(async ({ id, code }) => {
    const box = document.getElementById("box");
    box.innerHTML = "";
    const result = await window.mermaid.render(`svg_${id}`, code);
    box.innerHTML = result.svg;
  }, diagram);
  const box = await page.locator("#box");
  await box.screenshot({ path: outPath, omitBackground: false });
}

await browser.close();
