"use client";

import { useEffect, useRef, useState } from "react";

interface ImageUploaderProps {
  /** Already-uploaded image URLs. */
  images: string[];
  onImagesChange: (images: string[]) => void;
  /** Newly added local files, not yet uploaded. */
  pendingFiles: File[];
  onPendingFilesChange: (files: File[]) => void;
  hint?: string;
}

/**
 * Drop zone for product / gallery photos. Accepts images via drag-and-drop,
 * clipboard paste, or the file picker, and previews existing + pending
 * images with per-image remove. The parent owns the state so it can fold
 * `images` + uploaded `pendingFiles` into the form submission.
 */
export function ImageUploader({
  images,
  onImagesChange,
  pendingFiles,
  onPendingFilesChange,
  hint,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Object URLs for pending-file previews, revoked on change/unmount.
  const [previews, setPreviews] = useState<string[]>([]);
  useEffect(() => {
    const urls = pendingFiles.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [pendingFiles]);

  const addFiles = (list: FileList | File[] | null) => {
    const files = Array.from(list ?? []).filter((file) =>
      file.type.startsWith("image/")
    );
    if (files.length) onPendingFilesChange([...pendingFiles, ...files]);
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        onPaste={(event) => {
          const files = Array.from(event.clipboardData.files);
          if (files.length) {
            event.preventDefault();
            addFiles(files);
          }
        }}
        className={`flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-copper ${
          isDragging
            ? "border-copper bg-copper/10"
            : "border-warm-white/20 bg-warm-white/5 hover:border-copper/70"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <span className="text-sm text-warm-white/70">
          Drag &amp; drop, paste, or click to choose photos
        </span>
        {hint && <span className="mt-1 text-xs text-warm-white/40">{hint}</span>}
      </div>

      {(images.length > 0 || pendingFiles.length > 0) && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div
              key={image}
              className="relative aspect-square overflow-hidden rounded-lg border border-warm-white/10 bg-warm-white/5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() =>
                  onImagesChange(images.filter((_, i) => i !== index))
                }
                className="absolute right-2 top-2 rounded bg-charcoal/80 px-2 py-1 text-xs text-warm-white hover:bg-rose-gold"
              >
                Remove
              </button>
            </div>
          ))}
          {pendingFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="relative aspect-square overflow-hidden rounded-lg border border-copper/30 bg-warm-white/5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previews[index]}
                alt=""
                className="h-full w-full object-cover"
              />
              <span className="absolute left-2 top-2 rounded bg-copper px-2 py-1 text-xs text-white">
                New
              </span>
              <button
                type="button"
                onClick={() =>
                  onPendingFilesChange(pendingFiles.filter((_, i) => i !== index))
                }
                className="absolute right-2 top-2 rounded bg-charcoal/80 px-2 py-1 text-xs text-warm-white hover:bg-rose-gold"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
