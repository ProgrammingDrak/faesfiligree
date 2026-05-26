import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "prisma/config";

for (const envFile of [".env.local", ".env"]) {
  const path = resolve(process.cwd(), envFile);
  if (!existsSync(path)) continue;

  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;

    const rawValue = match[2].trim();
    process.env[match[1]] = rawValue.replace(/^["']|["']$/g, "");
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.DIRECT_URL ||
      process.env.DATABASE_URL ||
      "postgresql://postgres@localhost:5432/faesfiligree?schema=public",
  },
});
