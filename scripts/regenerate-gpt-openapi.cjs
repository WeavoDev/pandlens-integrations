/**
 * Regenerates ai/openai/openapi-gpt-actions.json from the live Pandlens Swagger.
 * Source of truth: https://api.pandlens.nl/swagger/v1/swagger.json
 *
 * Usage: node scripts/regenerate-gpt-openapi.cjs
 */
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const SWAGGER_URL = "https://api.pandlens.nl/swagger/v1/swagger.json";
const OUT = path.join(__dirname, "..", "ai", "openai", "openapi-gpt-actions.json");

const KEEP_PATHS = [
  "/v1/address/{postcode}/{huisnummer}",
  "/v1/address/{postcode}/{huisnummer}/building",
  "/v1/address/{postcode}/{huisnummer}/energy",
  "/v1/address/{postcode}/{huisnummer}/plot",
  "/v1/address/{postcode}/{huisnummer}/neighbourhood",
  "/v1/address/{postcode}/{huisnummer}/environment",
  "/v1/address/{postcode}/{huisnummer}/solar",
  "/v1/usage",
];

function walkRefs(obj, refs) {
  if (obj === null || obj === undefined) {
    return;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) {
      walkRefs(item, refs);
    }
    return;
  }
  if (typeof obj === "object") {
    if (typeof obj.$ref === "string" && obj.$ref.startsWith("#/")) {
      refs.add(obj.$ref.slice(2));
    }
    for (const v of Object.values(obj)) {
      walkRefs(v, refs);
    }
  }
}

function stripBatchMentions(text) {
  if (typeof text !== "string") {
    return text;
  }
  return text
    .replace(/\s*Bulk enrichment:\s*POST\s+\/v1\/addresses\/batch\.?/gi, "")
    .replace(/\s*Bulk enrichment:[^.\n]*/gi, "")
    .trim();
}

function cleanOperation(op) {
  if (!op || typeof op !== "object") {
    return;
  }
  for (const k of ["description", "summary"]) {
    if (typeof op[k] === "string") {
      op[k] = stripBatchMentions(op[k]);
    }
  }
  if (op.responses && typeof op.responses === "object") {
    for (const r of Object.values(op.responses)) {
      if (r && typeof r.description === "string") {
        r.description = stripBatchMentions(r.description);
      }
    }
  }
  op.security = [{ ApiKey: [] }];
}

function collectAllComponentSchemas(rootObj, allSchemas) {
  const seen = new Set();
  const queue = [];
  const refs = new Set();
  walkRefs(rootObj, refs);
  for (const r of refs) {
    if (!r.startsWith("components/schemas/")) {
      continue;
    }
    const name = r.slice("components/schemas/".length);
    if (allSchemas[name]) {
      queue.push(name);
    }
  }
  while (queue.length) {
    const name = queue.pop();
    if (seen.has(name)) {
      continue;
    }
    seen.add(name);
    const inner = new Set();
    walkRefs(allSchemas[name], inner);
    for (const r of inner) {
      if (!r.startsWith("components/schemas/")) {
        continue;
      }
      const dep = r.slice("components/schemas/".length);
      if (allSchemas[dep] && !seen.has(dep)) {
        queue.push(dep);
      }
    }
  }
  return seen;
}

async function main() {
  const res = await fetch(SWAGGER_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${SWAGGER_URL}: ${res.status}`);
  }
  const src = await res.json();
  const paths = {};
  for (const p of KEEP_PATHS) {
    if (src.paths && src.paths[p]) {
      paths[p] = structuredClone
        ? structuredClone(src.paths[p])
        : JSON.parse(JSON.stringify(src.paths[p]));
    }
  }
  const schemas = src.components && src.components.schemas ? src.components.schemas : {};
  const seen = collectAllComponentSchemas(paths, schemas);
  const subset = {};
  for (const n of seen) {
    if (schemas[n]) {
      subset[n] = structuredClone
        ? structuredClone(schemas[n])
        : JSON.parse(JSON.stringify(schemas[n]));
    }
  }
  for (const item of Object.values(paths)) {
    for (const [method, op] of Object.entries(item)) {
      if (method === "parameters") {
        continue;
      }
      if (op && typeof op === "object") {
        cleanOperation(op);
      }
    }
  }
  const infoDesc =
    "Trimmed OpenAPI for ChatGPT Actions: per-address GET operations plus GET /v1/usage for connection tests. " +
    "Customers authenticate with the X-Api-Key header (your Pandlens API key). " +
    "This file excludes batch, bulk, search, and area-wide endpoints on purpose. " +
    "Full specification: https://api.pandlens.nl/swagger/v1/swagger.json . Documentation: https://pandlens.nl/docs .";
  const out = {
    openapi: "3.0.4",
    info: {
      title: "Pandlens API (GPT Actions subset)",
      description: infoDesc,
      version: "v1",
    },
    servers: [{ url: "https://api.pandlens.com" }],
    paths,
    components: {
      securitySchemes: {
        ApiKey: src.components.securitySchemes.ApiKey,
      },
      schemas: subset,
    },
    security: [{ ApiKey: [] }],
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`Wrote ${OUT} (${Object.keys(paths).length} paths, ${Object.keys(subset).length} schemas)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
