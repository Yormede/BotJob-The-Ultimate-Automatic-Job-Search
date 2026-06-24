#!/usr/bin/env node

import { createRequire } from "node:module";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);

let sharp;
const sharpCandidates = [
  "sharp",
  process.env.BOTJOB_SHARP_MODULE || null,
  process.env.BOTJOB_NODE_MODULES ? path.join(process.env.BOTJOB_NODE_MODULES, "sharp") : null,
  process.env.USERPROFILE
    ? path.join(
        process.env.USERPROFILE,
        ".cache",
        "codex-runtimes",
        "codex-primary-runtime",
        "dependencies",
        "node",
        "node_modules",
        "sharp"
      )
    : null
].filter(Boolean);

for (const candidate of sharpCandidates) {
  try {
    sharp = require(candidate);
    break;
  } catch {
    // Try the next resolution path.
  }
}

if (!sharp) {
  console.error("Missing dependency: sharp");
  console.error("Install it with: bun add -d sharp");
  console.error("Then run: bun scripts/avatars/build-avatar-bank.mjs");
  process.exit(1);
}

const rootDir = process.cwd();
const avatarRoot = path.join(rootDir, "assets", "avatars");
const sourceDir = path.join(avatarRoot, "source");
const generatedDir = path.join(sourceDir, "generated");
const inboxDir = path.join(sourceDir, "inbox");
const optimizedDir = path.join(avatarRoot, "optimized");
const thumbsDir = path.join(optimizedDir, "thumbs");
const manifestPath = path.join(avatarRoot, "avatars.manifest.json");

const generatedAvatars = [
  ["anime-shadow-01", "Nocturne Strategist", "anime", ["#151225", "#5b4bdb", "#e13f6f", "#f5f7ff"]],
  ["anime-neon-02", "Neon Ronin", "anime", ["#101824", "#00a6a6", "#ffcc66", "#f2f4f8"]],
  ["anime-violet-03", "Violet Ace", "anime", ["#1b1430", "#7d4cff", "#2fd8ff", "#f7f2ff"]],
  ["anime-crimson-04", "Crimson Pilot", "anime", ["#201217", "#d64242", "#1d9a8a", "#fff4ea"]],
  ["anime-onyx-05", "Onyx Scholar", "anime", ["#111318", "#3c4658", "#b9d1ff", "#f2f5fb"]],
  ["anime-cyber-06", "Cyber Mystic", "anime", ["#121022", "#1fb8ff", "#e342ff", "#ffffff"]],
  ["anime-amber-07", "Amber Blade", "anime", ["#1f1a12", "#f0a12b", "#3c6e71", "#fff8ec"]],
  ["anime-silver-08", "Silver Shade", "anime", ["#17191f", "#a4b2c5", "#845ec2", "#f7f9fc"]],
  ["anime-emerald-09", "Emerald Cipher", "anime", ["#102019", "#2bb673", "#ffe66d", "#effff8"]],
  ["anime-rose-10", "Rose Hacker", "anime", ["#22141c", "#ff5d8f", "#6c63ff", "#fff3f8"]],
  ["cartoon-spark-01", "Spark Builder", "cartoon", ["#113a5d", "#ffb703", "#fb8500", "#f8f9fa"]],
  ["cartoon-mint-02", "Mint Maker", "cartoon", ["#12372a", "#7bd88f", "#f6d365", "#fafffd"]],
  ["cartoon-sky-03", "Sky Fixer", "cartoon", ["#15324a", "#4cc9f0", "#ffafcc", "#f6fbff"]],
  ["cartoon-plum-04", "Plum Captain", "cartoon", ["#2d1b3d", "#b565d9", "#ffd166", "#fff7fb"]],
  ["cartoon-coral-05", "Coral Scout", "cartoon", ["#2b1d1c", "#ff6b6b", "#4ecdc4", "#fff5f5"]],
  ["cartoon-lime-06", "Lime Runner", "cartoon", ["#1d2b1f", "#b7ef45", "#48cae4", "#f8fff4"]],
  ["cartoon-berry-07", "Berry Coder", "cartoon", ["#2b1720", "#d81159", "#8f2d56", "#fff2f7"]],
  ["cartoon-cobalt-08", "Cobalt Guide", "cartoon", ["#102542", "#3a86ff", "#ffbe0b", "#f4f8ff"]],
  ["cartoon-sand-09", "Sand Analyst", "cartoon", ["#2c241b", "#f4a261", "#2a9d8f", "#fff8ef"]],
  ["cartoon-ice-10", "Ice Operator", "cartoon", ["#14213d", "#8ecae6", "#f72585", "#f8fcff"]],
  ["pro-slate-01", "Slate Advisor", "professional", ["#17212b", "#4361ee", "#8d99ae", "#f8f9fa"]],
  ["pro-teal-02", "Teal Consultant", "professional", ["#102a2b", "#2a9d8f", "#e9c46a", "#f5fffd"]],
  ["pro-indigo-03", "Indigo Lead", "professional", ["#18192f", "#4f46e5", "#94a3b8", "#f7f7ff"]],
  ["pro-graphite-04", "Graphite Manager", "professional", ["#161a1d", "#5c677d", "#fca311", "#f8f9fa"]],
  ["pro-green-05", "Green Strategist", "professional", ["#12251a", "#40916c", "#a3b18a", "#f6fff8"]],
  ["pro-navy-06", "Navy Architect", "professional", ["#0b1d33", "#2f80ed", "#f2c94c", "#f7fbff"]],
  ["pro-burgundy-07", "Burgundy Founder", "professional", ["#26151b", "#9d2449", "#d4a373", "#fff8f5"]],
  ["pro-steel-08", "Steel Engineer", "professional", ["#15202b", "#607d8b", "#90caf9", "#f5f7fa"]],
  ["pro-violet-09", "Violet Director", "professional", ["#1d1730", "#7c3aed", "#c4b5fd", "#fbfaff"]],
  ["pro-copper-10", "Copper Analyst", "professional", ["#241a13", "#b87333", "#5e6472", "#fff8f0"]]
];

const svgEscape = (value) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const rel = (filePath) => path.relative(rootDir, filePath).replaceAll("\\", "/");

async function ensureDirs() {
  await mkdir(generatedDir, { recursive: true });
  await mkdir(inboxDir, { recursive: true });
  await mkdir(optimizedDir, { recursive: true });
  await mkdir(thumbsDir, { recursive: true });
}

function renderAvatarSvg(id, label, category, colors) {
  const [bg, primary, accent, skin] = colors;
  const initials = label
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const hair = category === "professional" ? "#1f2933" : "#121826";
  const collar = category === "anime" ? primary : category === "cartoon" ? accent : "#ffffff";
  const badge = category === "anime" ? "AN" : category === "cartoon" ? "CT" : "PR";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-labelledby="title desc">
  <title id="title">${svgEscape(label)}</title>
  <desc id="desc">Generated ${svgEscape(category)} avatar for BotJob.</desc>
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="58%" stop-color="${primary}"/>
      <stop offset="100%" stop-color="${accent}"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000000" flood-opacity="0.28"/>
    </filter>
    <clipPath id="round">
      <rect width="512" height="512" rx="128"/>
    </clipPath>
  </defs>
  <g clip-path="url(#round)">
    <rect width="512" height="512" fill="url(#bg)"/>
    <circle cx="420" cy="92" r="120" fill="#ffffff" opacity="0.08"/>
    <circle cx="88" cy="428" r="150" fill="#000000" opacity="0.16"/>
    <path d="M94 438c28-92 90-144 162-144s134 52 162 144" fill="${category === "professional" ? "#17202a" : "#202840"}" filter="url(#softShadow)"/>
    <path d="M164 438c20-62 52-96 92-96s72 34 92 96" fill="${collar}" opacity="0.94"/>
    <circle cx="256" cy="220" r="104" fill="${skin}" filter="url(#softShadow)"/>
    <path d="M154 210c12-82 58-126 130-126 52 0 94 24 120 68-78-8-144 7-250 58z" fill="${hair}"/>
    <path d="M148 226c54-62 112-91 174-88 42 3 72 20 95 48-52-14-103-1-154 30-44 27-82 34-115 10z" fill="${hair}" opacity="0.86"/>
    <circle cx="220" cy="230" r="11" fill="${category === "anime" ? accent : "#18202a"}"/>
    <circle cx="296" cy="230" r="11" fill="${category === "anime" ? accent : "#18202a"}"/>
    <path d="M222 286c24 18 48 18 72 0" fill="none" stroke="#18202a" stroke-width="11" stroke-linecap="round"/>
    <path d="M182 188c34-28 74-42 120-42" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round" opacity="0.22"/>
    <rect x="352" y="352" width="74" height="74" rx="24" fill="#ffffff" opacity="0.16"/>
    <text x="389" y="399" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="800" fill="#ffffff">${badge}</text>
    <text x="256" y="480" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="900" fill="#ffffff" opacity="0.9">${initials}</text>
  </g>
</svg>
`;
}

async function writeGeneratedSources() {
  const sources = [];
  for (const [id, label, category, colors] of generatedAvatars) {
    const svg = renderAvatarSvg(id, label, category, colors);
    const sourcePath = path.join(generatedDir, `${id}.svg`);
    await writeFile(sourcePath, svg, "utf8");
    sources.push({ id, label, category, sourcePath, sourceType: "generated", license: "BotJob original generated SVG" });
  }
  return sources;
}

async function readInboxSources() {
  const entries = await readdir(inboxDir, { withFileTypes: true });
  const accepted = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);
  const sources = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!accepted.has(ext)) continue;
    const id = `custom-${slugify(path.basename(entry.name, ext))}`;
    const label = path.basename(entry.name, ext).replace(/[-_]+/g, " ");
    sources.push({
      id,
      label,
      category: "custom",
      sourcePath: path.join(inboxDir, entry.name),
      sourceType: "user-supplied",
      license: "User supplied. Confirm rights before production use."
    });
  }

  return sources;
}

async function optimizeAvatar(source) {
  const input = await readFile(source.sourcePath);
  const webpPath = path.join(optimizedDir, `${source.id}.webp`);
  const thumbPath = path.join(thumbsDir, `${source.id}.webp`);

  await sharp(input, { animated: false })
    .resize(256, 256, { fit: "cover", position: "attention" })
    .webp({ quality: 74, effort: 6, smartSubsample: true })
    .toFile(webpPath);

  await sharp(input, { animated: false })
    .resize(96, 96, { fit: "cover", position: "attention" })
    .webp({ quality: 68, effort: 6, smartSubsample: true })
    .toFile(thumbPath);

  const sourceStats = await stat(source.sourcePath);
  const webpStats = await stat(webpPath);
  const thumbStats = await stat(thumbPath);

  return {
    id: source.id,
    label: source.label,
    category: source.category,
    sourceType: source.sourceType,
    license: source.license,
    source: rel(source.sourcePath),
    image: rel(webpPath),
    thumb: rel(thumbPath),
    sizes: {
      sourceBytes: sourceStats.size,
      imageBytes: webpStats.size,
      thumbBytes: thumbStats.size
    }
  };
}

async function main() {
  await ensureDirs();

  const sources = [...(await writeGeneratedSources()), ...(await readInboxSources())];
  const avatars = [];

  for (const source of sources) {
    avatars.push(await optimizeAvatar(source));
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    count: avatars.length,
    formats: {
      image: "webp 256x256",
      thumb: "webp 96x96"
    },
    importInbox: rel(inboxDir),
    avatars
  };

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  const totalSource = avatars.reduce((sum, avatar) => sum + avatar.sizes.sourceBytes, 0);
  const totalImage = avatars.reduce((sum, avatar) => sum + avatar.sizes.imageBytes + avatar.sizes.thumbBytes, 0);
  const saved = totalSource > 0 ? Math.round((1 - totalImage / totalSource) * 100) : 0;

  console.log(`Avatar bank built: ${avatars.length} avatars`);
  console.log(`Manifest: ${rel(manifestPath)}`);
  console.log(`Optimized size: ${Math.round(totalImage / 1024)} KB`);
  console.log(`Estimated saving vs sources: ${saved}%`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
