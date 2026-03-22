import crypto from "node:crypto";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

const ORIGIN = "https://animejs.com";
const OUTPUT_ROOT = path.resolve("public/vendor/animejs");
const HOME_PATH = "/";
const DEMOS_PATH = "/documentation-demos";
const CSS_PATH = "/assets/css/styles.css?v=4.3.5-6";
const JS_PATH = "/assets/js/scripts.js?v=4.3.5-6";
const VARIABLE_FONT_SOURCE = "/assets/fonts/DINish[slnt,wdth,wght].woff2";
const VARIABLE_FONT_TARGET = "assets/fonts/DINish-slnt-wdth-wght.woff2";
const DRACO_FILES = [
  "/assets/draco/draco_decoder.js",
  "/assets/draco/draco_wasm_wrapper.js",
  "/assets/draco/draco_decoder.wasm",
];
const SPONSOR_ENDPOINTS = {
  "github-sponsors": "/sponsors/github-sponsors",
  "platinum-sponsors": "/sponsors/platinum-sponsors",
  "gold-sponsors": "/sponsors/gold-sponsors",
  "silver-sponsors": "/sponsors/silver-sponsors",
};
const LOCAL_PATHS_SCRIPT = `window.paths = {
  demos: './documentation-demos.html',
  easings: './assets/json/easings.json',
  'github-sponsors': './sponsors/github-sponsors.html',
  'platinum-sponsors': './sponsors/platinum-sponsors.html',
  'gold-sponsors': './sponsors/gold-sponsors.html',
  'silver-sponsors': './sponsors/silver-sponsors.html',
};`;
const HOME_JUMP_SCRIPT = `<script>
  window.addEventListener('load', () => {
    const jumpToSponsors = () => {
      const sponsors = document.getElementById('sponsors');
      if (sponsors) sponsors.scrollIntoView({ behavior: 'auto', block: 'start' });
    };
    jumpToSponsors();
    setTimeout(jumpToSponsors, 350);
    setTimeout(jumpToSponsors, 1100);
  });
</script>`;

const LOCAL_ASSET_PATTERN =
  /assets\/models\/[^"' )]+\.glb|assets\/draco\/[^"' )]+|assets\/json\/[^"' )]+|assets\/images\/[^"' )]+|media\/pages\/[^"' )]+|\.\.\/fonts\/[^"' )]+/g;
const AVATAR_PATTERN = /https:\/\/avatars\.githubusercontent\.com\/[^"' )]+/g;

async function ensureDirectory(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }

  return await response.text();
}

async function fetchBinary(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get("content-type") ?? "",
  };
}

async function writeTextFile(relativePath, contents) {
  const fullPath = path.join(OUTPUT_ROOT, relativePath);
  await ensureDirectory(fullPath);
  await writeFile(fullPath, contents, "utf8");
}

async function writeBinaryFile(relativePath, buffer) {
  const fullPath = path.join(OUTPUT_ROOT, relativePath);
  await ensureDirectory(fullPath);
  await writeFile(fullPath, buffer);
}

function uniqueMatches(pattern, sources) {
  const matches = new Set();

  for (const source of sources) {
    const found = source.match(pattern) ?? [];

    for (const value of found) {
      matches.add(value);
    }
  }

  return [...matches];
}

function normalizeLocalAssetPath(rawPath) {
  if (rawPath.startsWith("../fonts/")) {
    return `/assets/fonts/${rawPath.slice("../fonts/".length)}`;
  }

  if (rawPath.startsWith("/")) {
    return rawPath;
  }

  return `/${rawPath}`;
}

function avatarExtension(contentType) {
  if (contentType.includes("png")) {
    return ".png";
  }
  if (contentType.includes("gif")) {
    return ".gif";
  }
  if (contentType.includes("webp")) {
    return ".webp";
  }

  return ".jpg";
}

async function downloadAsset(remotePath) {
  const normalizedPath = normalizeLocalAssetPath(remotePath);
  const { buffer } = await fetchBinary(`${ORIGIN}${normalizedPath}`);
  await writeBinaryFile(normalizedPath.replace(/^\//, ""), buffer);

  if (normalizedPath === VARIABLE_FONT_SOURCE) {
    await writeBinaryFile(VARIABLE_FONT_TARGET, buffer);
  }
}

async function downloadAvatar(remoteUrl) {
  const { buffer, contentType } = await fetchBinary(remoteUrl);
  const hash = crypto.createHash("sha1").update(remoteUrl).digest("hex");
  const relativePath = `avatars/${hash}${avatarExtension(contentType)}`;
  await writeBinaryFile(relativePath, buffer);
  return relativePath;
}

function rewriteHomeHtml(html) {
  return html
    .replace(
      /<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-16LTPBS8QC"><\/script>\s*/,
      "",
    )
    .replace(
      /<script>\s*window\.paths\s*=\s*\{[\s\S]*?gtag\('config', 'G-16LTPBS8QC'\);\s*<\/script>/,
      `<script>\n  ${LOCAL_PATHS_SCRIPT}\n</script>`,
    )
    .replace(
      /content="https:\/\/animejs\.com\/media\//g,
      'content="./media/',
    )
    .replace(/(href|src)=("|')\/assets\//g, `$1=$2./assets/`)
    .replace(/(href|src)=("|')\/media\//g, `$1=$2./media/`)
    .replace(/href=("|')\/(?!assets\/|media\/)/g, `href=$1https://animejs.com/`)
    .replace("</body>", `${HOME_JUMP_SCRIPT}</body>`);
}

function rewriteSponsorHtml(html, avatarMap) {
  let output = html
    .replace(/src=("|')\/media\//g, `src=$1./media/`)
    .replace(/src=("|')\/assets\//g, `src=$1./assets/`);

  for (const [remoteUrl, localPath] of avatarMap.entries()) {
    output = output.split(remoteUrl).join(`./${localPath}`);
  }

  return output;
}

async function main() {
  const homeHtml = await fetchText(`${ORIGIN}${HOME_PATH}`);
  const demosHtml = await fetchText(`${ORIGIN}${DEMOS_PATH}`);
  const stylesCss = await fetchText(`${ORIGIN}${CSS_PATH}`);
  const scriptsJs = await fetchText(`${ORIGIN}${JS_PATH}`);

  await writeTextFile(
    "assets/css/styles.css",
    stylesCss.replace(
      /\.\.\/fonts\/DINish\[slnt,wdth,wght\]\.woff2/g,
      "../fonts/DINish-slnt-wdth-wght.woff2",
    ),
  );
  await writeTextFile("assets/js/scripts.js", scriptsJs);
  await writeTextFile("documentation-demos.html", demosHtml);

  const sponsorEntries = await Promise.all(
    Object.entries(SPONSOR_ENDPOINTS).map(async ([name, endpoint]) => {
      const html = await fetchText(`${ORIGIN}${endpoint}`);
      return [name, html];
    }),
  );
  const sponsorHtmlMap = new Map(sponsorEntries);

  const localAssetPaths = new Set(
    uniqueMatches(LOCAL_ASSET_PATTERN, [
      homeHtml,
      stylesCss,
      scriptsJs,
      ...sponsorHtmlMap.values(),
    ]).map(normalizeLocalAssetPath),
  );

  for (const dracoFile of DRACO_FILES) {
    localAssetPaths.add(dracoFile);
  }

  const avatarUrls = uniqueMatches(AVATAR_PATTERN, [
    sponsorHtmlMap.get("github-sponsors") ?? "",
  ]);
  const avatarMap = new Map();

  for (const avatarUrl of avatarUrls) {
    const localPath = await downloadAvatar(avatarUrl);
    avatarMap.set(avatarUrl, localPath);
  }

  for (const localAssetPath of localAssetPaths) {
    await downloadAsset(localAssetPath);
  }

  for (const [name, html] of sponsorHtmlMap.entries()) {
    await writeTextFile(
      `sponsors/${name}.html`,
      rewriteSponsorHtml(html, avatarMap),
    );
  }

  await writeTextFile("home.html", rewriteHomeHtml(homeHtml));

  console.log(
    `Vendored Anime.js home snapshot to ${OUTPUT_ROOT} with ${localAssetPaths.size} local assets and ${avatarUrls.length} avatar images.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
