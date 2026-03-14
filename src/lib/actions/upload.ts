"use server";

import { put } from "@vercel/blob";

export async function uploadImage(formData: FormData): Promise<string> {
  const file = formData.get("file") as File;
  if (!file || file.size === 0) {
    throw new Error("No file provided");
  }

  const blob = await put(file.name, file, {
    access: "public",
  });

  return blob.url;
}
