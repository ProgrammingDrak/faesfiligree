import { access, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { slugify } from "@/lib/utils";
import type { GalleryPiece } from "@/lib/data/types";

export interface LocalGalleryPiece {
  id: string;
  title: string;
  slug: string;
  images: string[];
  description: string | null;
  materials: string[];
  year: number | null;
  isSold: boolean;
  isCommission: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

const localDataDir = path.join(process.cwd(), "data");
const localGalleryPath = path.join(localDataDir, "gallery.json");

async function ensureLocalDataDir() {
  await mkdir(localDataDir, { recursive: true });
}

function toPublicGalleryPiece(piece: LocalGalleryPiece): GalleryPiece {
  return {
    _id: piece.id,
    title: piece.title,
    slug: { current: piece.slug },
    images: piece.images,
    description: piece.description ?? undefined,
    materials: piece.materials,
    year: piece.year ?? undefined,
    isSold: piece.isSold,
    isCommission: piece.isCommission,
    featured: piece.featured,
  };
}

export async function getLocalGalleryPieces() {
  try {
    const raw = await readFile(localGalleryPath, "utf8");
    const pieces = JSON.parse(raw) as LocalGalleryPiece[];
    return pieces.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export async function hasLocalGalleryData() {
  try {
    await access(localGalleryPath);
    return true;
  } catch {
    return false;
  }
}

export async function getLocalGalleryPiece(id: string) {
  const pieces = await getLocalGalleryPieces();
  return pieces.find((piece) => piece.id === id) ?? null;
}

export async function getLocalPublicGalleryPieces() {
  const pieces = await getLocalGalleryPieces();
  return pieces.map(toPublicGalleryPiece);
}

export async function createLocalGalleryPiece(data: Omit<LocalGalleryPiece, "id" | "slug" | "createdAt" | "updatedAt">) {
  const pieces = await getLocalGalleryPieces();
  const now = new Date().toISOString();
  const piece: LocalGalleryPiece = {
    ...data,
    id: crypto.randomUUID(),
    slug: slugify(data.title),
    createdAt: now,
    updatedAt: now,
  };

  await ensureLocalDataDir();
  await writeFile(localGalleryPath, JSON.stringify([piece, ...pieces], null, 2));
  return piece;
}

export async function updateLocalGalleryPiece(
  id: string,
  data: Omit<LocalGalleryPiece, "id" | "slug" | "createdAt" | "updatedAt">
) {
  const pieces = await getLocalGalleryPieces();
  const existing = pieces.find((piece) => piece.id === id);
  if (!existing) return null;

  const updated: LocalGalleryPiece = {
    ...existing,
    ...data,
    slug: slugify(data.title),
    updatedAt: new Date().toISOString(),
  };

  await ensureLocalDataDir();
  await writeFile(
    localGalleryPath,
    JSON.stringify(pieces.map((piece) => (piece.id === id ? updated : piece)), null, 2)
  );
  return updated;
}

export async function deleteLocalGalleryPiece(id: string) {
  const pieces = await getLocalGalleryPieces();
  await ensureLocalDataDir();
  await writeFile(
    localGalleryPath,
    JSON.stringify(pieces.filter((piece) => piece.id !== id), null, 2)
  );
}
