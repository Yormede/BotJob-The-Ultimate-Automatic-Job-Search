#!/usr/bin/env node

import { createRequire } from "node:module";
import { mkdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const require = createRequire(import.meta.url);

const rootDir = process.cwd();
const outputDir = path.join(rootDir, "public", "video-frames");
const outputVideo = path.join(rootDir, "public", "botjob-landing.mp4");
const pageUrl = "file:///" + path.join(rootDir, "public", "index.html").replaceAll("\\", "/");

function resolvePlaywright() {
  const candidates = [
    "playwright",
    process.env.BOTJOB_PLAYWRIGHT_MODULE,
    process.env.USERPROFILE
      ? path.join(
          process.env.USERPROFILE,
          ".cache",
          "codex-runtimes",
          "codex-primary-runtime",
          "dependencies",
          "node",
          "node_modules",
          ".pnpm",
          "playwright@1.60.0",
          "node_modules",
          "playwright"
        )
      : null
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch {
      // Try next candidate.
    }
  }

  throw new Error("Playwright introuvable. Installe avec: bun add -d playwright");
}

function assertFfmpeg() {
  const result = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  if (result.error || result.status !== 0) {
    console.error("ffmpeg est requis pour encoder le MP4.");
    console.error("Installe-le puis relance: bun scripts/landing/record-landing-mp4.mjs");
    console.error("Windows, option simple: winget install Gyan.FFmpeg");
    process.exit(1);
  }
}

async function main() {
  assertFfmpeg();
  const { chromium } = resolvePlaywright();
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto(pageUrl, { waitUntil: "load" });

  const frames = 180;
  for (let index = 0; index < frames; index += 1) {
    await page.screenshot({
      path: path.join(outputDir, `frame-${String(index).padStart(4, "0")}.png`),
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    });
    await page.waitForTimeout(1000 / 30);
  }

  await browser.close();

  const encode = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-framerate",
      "30",
      "-i",
      path.join(outputDir, "frame-%04d.png"),
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      outputVideo
    ],
    { stdio: "inherit" }
  );

  if (encode.status !== 0) process.exit(encode.status ?? 1);
  console.log(`MP4 generated: ${path.relative(rootDir, outputVideo)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
