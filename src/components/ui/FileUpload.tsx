"use client";

import { useCallback, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  label?: string;
  error?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  onChange: (files: File[]) => void;
  value?: File[];
}

export function FileUpload({
  label,
  error,
  maxFiles = 5,
  maxSizeMB = 10,
  accept = "image/*",
  onChange,
  value = [],
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;

      const validFiles: File[] = [];
      const maxBytes = maxSizeMB * 1024 * 1024;

      Array.from(newFiles).forEach((file) => {
        if (value.length + validFiles.length >= maxFiles) return;
        if (file.size > maxBytes) return;
        if (!file.type.startsWith("image/")) return;
        validFiles.push(file);
      });

      if (validFiles.length > 0) {
        onChange([...value, ...validFiles]);
      }
    },
    [value, maxFiles, maxSizeMB, onChange]
  );

  const removeFile = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-charcoal">
          {label}
        </label>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragOver
            ? "border-copper bg-copper/5"
            : "border-charcoal/20 hover:border-copper/50",
          value.length >= maxFiles && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={value.length >= maxFiles}
        />
        <div className="text-charcoal/60">
          <svg
            className="mx-auto h-8 w-8 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">
            Drop images here or <span className="text-copper">browse</span>
          </p>
          <p className="text-xs mt-1">
            Up to {maxFiles} images, {maxSizeMB}MB each
          </p>
        </div>
      </div>

      {/* Previews */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((file, i) => (
            <div key={i} className="relative group">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="h-20 w-20 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove ${file.name}`}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
