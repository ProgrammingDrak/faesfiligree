#!/usr/bin/env node
// flip-dns-to-railway.mjs — one-shot DNS cutover for faesfiligree.com.
//
// Points the Cloudflare zone at the Railway deployment (2026-07 migration off
// Render) and verifies the site comes up. Safe to re-run; it upserts.
//
//   apex faesfiligree.com  -> CNAME s33vbx4h.up.railway.app   (DNS only)
//   www.faesfiligree.com   -> CNAME 246yoipd.up.railway.app   (DNS only)
//
// Records MUST stay grey-cloud (proxied:false) — see notes in
// claude-brain/repos/faesfiligree.md (orange cloud => Cloudflare Error 1000).
//
// Auth: CLOUDFLARE_API_TOKEN env var, else the encrypted brain secrets store
// key `cloudflare.dnsToken` (node claude-brain/scripts/secrets.mjs get ...).
// Token needs Zone.DNS edit on faesfiligree.com.
//
//   node scripts/flip-dns-to-railway.mjs

import { execFileSync } from "node:child_process";
import os from "node:os";
import path from "node:path";

const RECORDS = [
  { name: "faesfiligree.com", target: "s33vbx4h.up.railway.app" },
  { name: "www.faesfiligree.com", target: "246yoipd.up.railway.app" },
];

function loadToken() {
  if (process.env.CLOUDFLARE_API_TOKEN) return process.env.CLOUDFLARE_API_TOKEN;
  const secretsTool = path.join(os.homedir(), "portable-programming", "claude-brain", "scripts", "secrets.mjs");
  try {
    return execFileSync("node", [secretsTool, "get", "cloudflare.dnsToken"], { encoding: "utf8" }).trim() || null;
  } catch {
    return null;
  }
}

const token = loadToken();
if (!token) {
  console.error("No token: set CLOUDFLARE_API_TOKEN env, or run");
  console.error("  node claude-brain/scripts/secrets.mjs set cloudflare.dnsToken <token>");
  process.exit(1);
}

async function cf(pathname, init = {}) {
  const res = await fetch("https://api.cloudflare.com/client/v4" + pathname, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  const body = await res.json();
  if (!body.success) throw new Error(`${pathname}: ${JSON.stringify(body.errors)}`);
  return body.result;
}

const zones = await cf("/zones?name=faesfiligree.com");
if (!zones.length) throw new Error("Zone faesfiligree.com not visible to this token");
const zoneId = zones[0].id;
console.log("zone:", zoneId);

for (const { name, target } of RECORDS) {
  const existing = await cf(`/zones/${zoneId}/dns_records?name=${name}`);
  const payload = { type: "CNAME", name, content: target, ttl: 1, proxied: false };
  const old = existing.find((r) => ["A", "AAAA", "CNAME"].includes(r.type));
  if (old) {
    await cf(`/zones/${zoneId}/dns_records/${old.id}`, { method: "PUT", body: JSON.stringify(payload) });
    console.log(`updated ${name}: ${old.type} ${old.content} -> CNAME ${target} (DNS only)`);
  } else {
    await cf(`/zones/${zoneId}/dns_records`, { method: "POST", body: JSON.stringify(payload) });
    console.log(`created ${name}: CNAME ${target} (DNS only)`);
  }
}

console.log("\nWaiting for https://faesfiligree.com to serve from Railway...");
for (let i = 0; i < 60; i++) {
  try {
    const res = await fetch("https://faesfiligree.com", { redirect: "manual" });
    const server = res.headers.get("x-render-origin-server");
    if (res.status === 200 && !server) {
      console.log("LIVE: faesfiligree.com is serving from Railway.");
      process.exit(0);
    }
    console.log(`  attempt ${i + 1}: status ${res.status}${server ? " (still Render edge)" : ""}`);
  } catch (e) {
    console.log(`  attempt ${i + 1}: ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 20000));
}
console.log("Timed out waiting — DNS may still be propagating; re-check in a few minutes.");
