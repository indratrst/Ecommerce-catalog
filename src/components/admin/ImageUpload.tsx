"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
        {label}
      </label>

      {value ? (
        <div className="relative w-full aspect-video rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm group">
          <Image
            src={value}
            width={500}
            height={900}
            alt="Upload preview"
            className="object-cover"
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
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-video border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/10 transition-all group"
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleUpload}
          />

          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-all">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            )}
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {isUploading ? "Uploading..." : "Click to upload image"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports PNG, JPG, WEBP (Max 5MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
