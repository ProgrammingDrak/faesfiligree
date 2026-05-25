"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

export async function uploadImage(formData: FormData): Promise<string> {
  const file = formData.get("file") as File;
  if (!file || file.size === 0) {
    throw new Error("No file provided");
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads", "gallery");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filename = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), bytes);

    return `/uploads/gallery/${filename}`;
  }

  const blob = await put(file.name, file, {
    access: "public",
  });

  return blob.url;
}
