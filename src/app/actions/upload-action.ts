// src/app/actions/upload-action.ts
"use server";

import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

interface UploadResponse {
  success: boolean;
  publicUrl?: string;
  error?: string;
}

export async function UploadProductImageAction(
  formData: FormData,
): Promise<UploadResponse> {
  try {
    // 1. Validasi Autentikasi & Otorisasi di sisi Server
    const session = await getSession();
    if (
      !session ||
      (session.role !== "SUPERUSER" && session.role !== "ADMIN")
    ) {
      return { success: false, error: "Unauthorized access" };
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "No file uploaded" };
    }

    // 2. Validasi tipe file dasar
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "File must be an image" };
    }

    // 3. Konversi file ke ArrayBuffer -> Uint8Array untuk Supabase
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `products/${fileName}`;

    // 4. Upload ke public bucket Supabase
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, fileBuffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    // 5. Dapatkan URL Publik
    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return {
      success: true,
      publicUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error("Upload action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    };
  }
}
