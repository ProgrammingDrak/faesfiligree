import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ??
    process.env.filigree_POSTGRES_PRISMA_URL ??
    process.env.filigree_DATABASE_URL
  );
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const url = getDatabaseUrl();
    if (!url) {
      throw new Error("DATABASE_URL is not configured");
    }
    const adapter = new PrismaNeon({ connectionString: url });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}

// Lazy proxy: only connects when actually used
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export function isDatabaseConfigured(): boolean {
  return !!getDatabaseUrl();
}
