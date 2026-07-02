// src/components/ImageUpload.tsx
"use client";

import React, { useState, useRef, useTransition } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { UploadProductImageAction } from "@/app/actions/upload-action";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    // Menjalankan Server Action menggunakan transition state
    startTransition(async () => {
      const res = await UploadProductImageAction(formData);

      if (res.success && res.publicUrl) {
        onChange(res.publicUrl);
      } else {
        setError(res.error || "Failed to upload image");
        console.error("Upload failed:", res.error);
      }
    });
  };

  return (
    <div className="space-y-4 w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
          {label}
        </label>
      )}

      {value ? (
        <div className="relative w-full aspect-video rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm group overflow-hidden">
          <Image
            src={value}
            alt="Upload preview"
            fill
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all hover:scale-110 shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !isPending && fileInputRef.current?.click()}
          className={`w-full aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group ${
            isPending
              ? "border-slate-300 bg-slate-50/50 cursor-not-allowed"
              : "border-slate-300 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/10"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleUpload}
            disabled={isPending}
          />

          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isPending
                ? "bg-slate-100 dark:bg-slate-800"
                : "bg-slate-100 dark:bg-slate-800 group-hover:scale-110 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30"
            }`}
          >
            {isPending ? (
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            )}
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {isPending ? "Uploading to cloud..." : "Click to upload image"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports PNG, JPG, WEBP (Max 5MB)
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
