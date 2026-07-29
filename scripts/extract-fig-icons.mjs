import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [figFileArg, outputDirArg, packageDistArg] = process.argv.slice(2);

if (!figFileArg || !outputDirArg) {
  console.error(
    "Usage: node scripts/extract-fig-icons.mjs <file.fig> <output-dir> [fig-mcp-dist]",
  );
  process.exit(1);
}

const figFile = path.resolve(figFileArg);
const outputDir = path.resolve(outputDirArg);
const pageName = "Маркетинг";

async function findFigMcpDist() {
  if (packageDistArg) return path.resolve(packageDistArg);

  const npmCache = path.join(
    process.env.LOCALAPPDATA ?? path.join(os.homedir(), "AppData", "Local"),
    "npm-cache",
    "_npx",
  );
  const entries = await fs.readdir(npmCache, { withFileTypes: true });
  const candidates = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dist = path.join(
      npmCache,
      entry.name,
      "node_modules",
      "@bilalba",
      "fig-mcp",
      "dist",
    );
    try {
      const stat = await fs.stat(path.join(dist, "parser", "index.js"));
      candidates.push({ dist, mtimeMs: stat.mtimeMs });
    } catch {
      // This npx cache entry is unrelated.
    }
  }

  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
  if (!candidates.length) {
    throw new Error(
      "@bilalba/fig-mcp was not found in the npx cache. Run `npx -y @bilalba/fig-mcp --help` first.",
    );
  }
  return candidates[0].dist;
}

function guid(node, formatGUID) {
  return formatGUID(node.guid);
}

function dimensions(node) {
  const width = Number(node.size?.x ?? node.width ?? 0);
  const height = Number(node.size?.y ?? node.height ?? 0);
  return {
    width: Number.isFinite(width) ? width : 0,
    height: Number.isFinite(height) ? height : 0,
  };
}

function hasImageFill(node) {
  return [...(node.fills ?? []), ...(node.strokes ?? [])].some(
    (paint) => paint?.type === "IMAGE" || paint?.type === "VIDEO",
  );
}

const VECTOR_TYPES = new Set([
  "VECTOR",
  "BOOLEAN_OPERATION",
  "ELLIPSE",
  "LINE",
  "STAR",
  "REGULAR_POLYGON",
  "RECTANGLE",
]);

const CONTAINER_TYPES = new Set([
  "FRAME",
  "GROUP",
  "INSTANCE",
  "COMPONENT",
  "BOOLEAN_OPERATION",
]);

const ICON_NAME_RE =
  /(^|[\s_\-\/])(icon|ico|glyph|symbol|иконк|икона)([\s_\-\/]|$)|arrow|chevron|caret|search|menu|close|cross|plus|minus|check|tick|play|pause|download|upload|filter|phone|mail|email|location|pin|calendar|clock|user|account|social|telegram|whats.?app|youtube|instagram|facebook|warning|navigation|pointer|slider|bolt|snowflake|waterdrop|volume|power|siren|forbidden/i;

const GENERIC_NAME_RE =
  /^(vector|union|group|frame|rectangle|ellipse|line|polygon|star|subtract|intersect|exclude|boolean|path|shape)(\s*\d*)?$/i;

const CYRILLIC = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
  ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
  я: "ya",
};

function slugify(value) {
  const transliterated = [...String(value).toLowerCase()]
    .map((char) => CYRILLIC[char] ?? char)
    .join("");
  return (
    transliterated
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-")
      .slice(0, 90) || "icon"
  );
}

function normalizeIds(svg) {
  const idMap = new Map();
  let counter = 0;
  let normalized = svg.replace(/\bid="([^"]+)"/g, (_match, id) => {
    const replacement = `id${counter++}`;
    idMap.set(id, replacement);
    return `id="${replacement}"`;
  });

  for (const [from, to] of idMap) {
    normalized = normalized
      .replaceAll(`url(#${from})`, `url(#${to})`)
      .replaceAll(`href="#${from}"`, `href="#${to}"`)
      .replaceAll(`xlink:href="#${from}"`, `xlink:href="#${to}"`);
  }
  return normalized;
}

function makeMonochrome(svg) {
  let result = svg
    .replace(/<\?xml[^>]*>/g, "")
    .replace(/<!--([\s\S]*?)-->/g, "")
    .replace(/\s(?:fill|stroke)="(?!none\b|currentColor\b)(?!url\()[^"]+"/g, (match) =>
      match.startsWith(" fill") ? ' fill="currentColor"' : ' stroke="currentColor"',
    )
    .replace(/\scolor="[^"]+"/g, ' color="currentColor"')
    .replace(/\s{2,}/g, " ")
    .replace(/>\s+</g, "><")
    .trim();

  result = result.replace(/<path\b[^>]*>/g, (tag) => {
    const pathData = tag.match(/\bd="([^"]+)"/)?.[1] ?? "";
    const subpathCount = (pathData.match(/(?:^|\s)[Mm](?=\s|[-+\d.])/g) ?? []).length;
    if (subpathCount < 2 || /\bfill="none"/.test(tag)) return tag;

    let updated = /\bfill-rule="[^"]+"/.test(tag)
      ? tag.replace(/\bfill-rule="[^"]+"/, 'fill-rule="evenodd"')
      : tag.replace(/\s*\/>$/, ' fill-rule="evenodd" />');
    updated = /\bclip-rule="[^"]+"/.test(updated)
      ? updated.replace(/\bclip-rule="[^"]+"/, 'clip-rule="evenodd"')
      : updated.replace(/\s*\/>$/, ' clip-rule="evenodd" />');
    return updated;
  });

  result = normalizeIds(result);
  if (!/\bviewBox=/.test(result)) {
    const width = result.match(/\bwidth="([\d.]+)"/)?.[1] ?? "24";
    const height = result.match(/\bheight="([\d.]+)"/)?.[1] ?? "24";
    result = result.replace("<svg", `<svg viewBox="0 0 ${width} ${height}"`);
  }
  return `${result}\n`;
}

function svgFingerprint(svg) {
  return crypto
    .createHash("sha256")
    .update(svg.replace(/\s+/g, " ").trim())
    .digest("hex");
}

function visibleGeometryCount(svg) {
  return (svg.match(/<(?:path|rect|circle|ellipse|polygon|polyline|line)\b/g) ?? [])
    .length;
}

function scoreAlias(alias) {
  let score = alias.confidence === "confirmed" ? 100 : 20;
  if (!GENERIC_NAME_RE.test(alias.name)) score += 20;
  if (ICON_NAME_RE.test(alias.name)) score += 30;
  score -= alias.path.length * 0.001;
  return score;
}

const dist = await findFigMcpDist();
const parser = await import(
  pathToFileURL(path.join(dist, "parser", "index.js")).href
);
const renderer = await import(
  pathToFileURL(path.join(dist, "renderer", "render-screen.js")).href
);

const parsed = await parser.parseFigFile(figFile);
const page = parsed.document.children.find((child) => child.name === pageName);
if (!page) {
  throw new Error(
    `Page ${JSON.stringify(pageName)} was not found. Available pages: ${parsed.document.children
      .map((child) => child.name)
      .join(", ")}`,
  );
}

const nodeIndex = parser.buildNodeIdIndex(parsed.document);
const rawNodeIndex = parser.buildRawNodeIndex(parsed.rawMessage ?? {});
const childCache = new WeakMap();

function effectiveChildren(node) {
  if (childCache.has(node)) return childCache.get(node);
  let children = node.children ?? [];

  if (node.type === "INSTANCE" && node.symbolData?.symbolID) {
    const symbolId = parser.formatGUID(node.symbolData.symbolID);
    const symbol = nodeIndex.get(symbolId);
    if (symbol) {
      children =
        parser.resolveInstanceChildren(node, symbol, rawNodeIndex, nodeIndex) ??
        symbol.children ??
        children;
    }
  }

  childCache.set(node, children);
  return children;
}

const statsCache = new WeakMap();
function subtreeStats(root) {
  if (statsCache.has(root)) return statsCache.get(root);
  const result = { vectors: 0, texts: 0, images: 0, nodes: 0 };
  const stack = [root];
  const seen = new Set();

  while (stack.length) {
    const node = stack.pop();
    if (!node || seen.has(node)) continue;
    seen.add(node);
    result.nodes += 1;
    if (VECTOR_TYPES.has(node.type)) result.vectors += 1;
    if (node.type === "TEXT") result.texts += 1;
    if (hasImageFill(node)) result.images += 1;
    for (const child of effectiveChildren(node)) stack.push(child);
  }

  statsCache.set(root, result);
  return result;
}

function classifyCandidate(node, pathParts) {
  if (node.visible === false) return null;
  const { width, height } = dimensions(node);
  const max = Math.max(width, height);
  const min = Math.min(width, height);
  if (!(max > 0 && min >= 0 && max <= 128)) return null;

  const stats = subtreeStats(node);
  if (!stats.vectors || stats.texts || stats.images) return null;

  const nameContext = pathParts.slice(-4).join(" / ");
  const named = ICON_NAME_RE.test(nameContext);
  const isContainer = CONTAINER_TYPES.has(node.type);

  if (named && max <= 128) {
    return { reason: "icon-name", confidence: "confirmed", stats };
  }
  if (node.type === "INSTANCE" && max <= 80) {
    return { reason: "small-instance", confidence: "confirmed", stats };
  }
  if (isContainer && max <= 64) {
    return {
      reason: "small-vector-container",
      confidence: GENERIC_NAME_RE.test(node.name) ? "probable" : "confirmed",
      stats,
    };
  }
  if (VECTOR_TYPES.has(node.type) && ICON_NAME_RE.test(node.name)) {
    return { reason: "named-vector", confidence: "confirmed", stats };
  }
  return null;
}

const candidates = [];
const traversal = [...page.children]
  .reverse()
  .map((node) => ({ node, pathParts: [page.name, node.name], depth: 1 }));

while (traversal.length) {
  const item = traversal.pop();
  const classification = classifyCandidate(item.node, item.pathParts);
  if (classification) {
    candidates.push({ ...item, ...classification });
    continue;
  }

  const children = effectiveChildren(item.node);
  for (let index = children.length - 1; index >= 0; index -= 1) {
    const child = children[index];
    traversal.push({
      node: child,
      pathParts: [...item.pathParts, child.name],
      depth: item.depth + 1,
    });
  }
}

const existing = await fs.readdir(outputDir);
if (existing.length !== 1 || existing[0] !== "svg") {
  throw new Error(`Output directory is not empty: ${outputDir}`);
}
const svgDir = path.join(outputDir, "svg");
await fs.access(svgDir);
if ((await fs.readdir(svgDir)).length) {
  throw new Error(`SVG output directory is not empty: ${svgDir}`);
}

const groups = new Map();
const skipped = [];

for (let index = 0; index < candidates.length; index += 1) {
  const candidate = candidates[index];
  const nodeId = guid(candidate.node, parser.formatGUID);
  const alias = {
    id: nodeId,
    name: candidate.node.name,
    path: candidate.pathParts.join(" / "),
    reason: candidate.reason,
    confidence: candidate.confidence,
    sourceWidth: dimensions(candidate.node).width,
    sourceHeight: dimensions(candidate.node).height,
    vectorCount: candidate.stats.vectors,
  };

  try {
    const rendered = renderer.renderScreen(
      candidate.node,
      undefined,
      parsed.blobs,
      {
        includeText: false,
        includeFills: true,
        includeStrokes: true,
        includeImages: false,
        includeShadows: false,
        background: "",
        nodeIndex,
        rawNodeIndex,
      },
    );
    const svg = makeMonochrome(rendered.svg);
    const geometryCount = visibleGeometryCount(svg);
    if (!geometryCount || rendered.width <= 0 || rendered.height <= 0) {
      skipped.push({ ...alias, reasonSkipped: "empty-render" });
      continue;
    }

    const hash = svgFingerprint(svg);
    if (!groups.has(hash)) {
      groups.set(hash, {
        hash,
        svg,
        width: rendered.width,
        height: rendered.height,
        geometryCount,
        warnings: rendered.warnings ?? [],
        aliases: [],
      });
    }
    groups.get(hash).aliases.push(alias);
  } catch (error) {
    skipped.push({ ...alias, reasonSkipped: String(error?.message ?? error) });
  }

  if ((index + 1) % 100 === 0) {
    console.error(`Rendered ${index + 1}/${candidates.length} candidates`);
  }
}

const icons = [...groups.values()];
icons.sort((a, b) => {
  const aBest = Math.max(...a.aliases.map(scoreAlias));
  const bBest = Math.max(...b.aliases.map(scoreAlias));
  return bBest - aBest || a.hash.localeCompare(b.hash);
});

const usedNames = new Map();
for (const icon of icons) {
  icon.aliases.sort((a, b) => scoreAlias(b) - scoreAlias(a));
  const primary = icon.aliases[0];
  const svg = icon.svg;
  const base = slugify(primary.name);
  const seen = usedNames.get(base) ?? 0;
  usedNames.set(base, seen + 1);
  const filename = `${base}${seen ? `-${seen + 1}` : ""}.svg`;
  icon.file = `svg/${filename}`;
  icon.primaryName = primary.name;
  delete icon.svg;
  await fs.writeFile(path.join(svgDir, filename), svg, "utf8");
}

const manifest = {
  sourceFile: path.relative(process.cwd(), figFile).replaceAll("\\", "/"),
  page: pageName,
  generatedAt: new Date().toISOString(),
  parser: "@bilalba/fig-mcp@1.1.5",
  mode: "monochrome-currentColor",
  candidateCount: candidates.length,
  uniqueIconCount: icons.length,
  duplicateCount: candidates.length - icons.length - skipped.length,
  skippedCount: skipped.length,
  icons,
  skipped,
};

await fs.writeFile(
  path.join(outputDir, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

const confirmed = icons.filter((icon) =>
  icon.aliases.some((alias) => alias.confidence === "confirmed"),
).length;
const readme = `# Marketing icons\n\n` +
  `Extracted from \`${manifest.sourceFile}\`, page \`${pageName}\`.\n\n` +
  `- Unique SVG files: ${icons.length}\n` +
  `- Confirmed by name/component context: ${confirmed}\n` +
  `- Exact duplicates removed: ${manifest.duplicateCount}\n` +
  `- Skipped empty/unsupported renders: ${skipped.length}\n\n` +
  `SVG colors are normalized to \`currentColor\`. See \`manifest.json\` for source node IDs, names, paths, aliases, and confidence.\n`;
await fs.writeFile(path.join(outputDir, "README.md"), readme, "utf8");

console.log(
  JSON.stringify(
    {
      page: pageName,
      candidates: candidates.length,
      uniqueIcons: icons.length,
      confirmed,
      duplicatesRemoved: manifest.duplicateCount,
      skipped: skipped.length,
      outputDir,
    },
    null,
    2,
  ),
);
