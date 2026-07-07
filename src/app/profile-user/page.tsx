"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Image as ImageIcon,
  Save,
  Loader2,
} from "lucide-react";

export default function ProfilePage() {
  // Mock data awal untuk simulasi data dari database
  const [formData, setFormData] = useState({
    name: "Ahmad Rifai",
    email: "ahmad.rifai@example.com",
    password: "",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop", // Foto default placeholder yang estetik
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    // Simulasi loading jeda waktu 1.5 detik seolah-olah sedang menyimpan ke database
    setTimeout(() => {
      setSubmitting(false);
      setMessage({
        type: "success",
        text: "Profil simulasi berhasil diperbarui (Lokal State)!",
      });

      // Kosongkan kembali field password setelah sukses simpan
      setFormData((prev) => ({ ...prev, password: "" }));
    }, 1500);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 mt-10">
      <div
        className="w-5xl mx-auto bg-zinc-100 border rounded-2xl shadow-sm p-8"
        style={{ borderColor: "var(--surface-border)" }}
      >
        {/* Profile Picture Section (Bulat di Tengah) */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative h-28 w-28 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-inner">
            {formData.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={formData.image}
                alt="Profile Preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  // Jika URL gambar yang dimasukkan rusak/error, fallback ke icon user biasa
                  e.currentTarget.style.display = "none";
                  const fallback =
                    e.currentTarget.parentElement?.querySelector(
                      ".fallback-icon",
                    );
                  if (fallback) fallback.classList.remove("hidden");
                }}
              />
            ) : null}
            <User
              className={`fallback-icon h-12 w-12 text-zinc-400 ${formData.image ? "hidden" : ""}`}
            />
          </div>

          <h2 className="mt-4 text-xl font-bold tracking-tight animate-[fadeIn_0.3s_ease]">
            {formData.name || "Nama Pengguna"}
          </h2>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">
            Mode Simulasi Frontend
          </p>
        </div>

        {/* Notifikasi Status */}
        {message.text && (
          <div
            className={`p-3 rounded-xl text-sm mb-5 text-center font-medium animate-[fadeIn_0.2s_ease] ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form Data User */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Input Nama */}
          <div>
            <label className="block text-xs font-bold uppercase mb-2 text-muted-foreground">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Masukkan nama lengkap"
                className="w-full pl-10 pr-4 py-2.5 bg-transparent border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all"
                style={{ borderColor: "var(--surface-border)" }}
              />
            </div>
          </div>

          {/* Input Email */}
          <div>
            <label className="block text-xs font-bold uppercase mb-2 text-muted-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-transparent border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all"
                style={{ borderColor: "var(--surface-border)" }}
              />
            </div>
          </div>

          {/* Input Password */}
          <div>
            <label className="block text-xs font-bold uppercase mb-2 text-muted-foreground">
              Password Baru
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-transparent border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all"
                style={{ borderColor: "var(--surface-border)" }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Biarkan kosong jika tidak ingin mensimulasikan ganti password.
            </p>
          </div>

          {/* Input Image URL */}
          <div>
            <label className="block text-xs font-bold uppercase mb-2 text-muted-foreground">
              URL Foto Profil
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                name="image"
                placeholder="https://example.com/avatar.jpg"
                value={formData.image}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-transparent border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all"
                style={{ borderColor: "var(--surface-border)" }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Foto di atas otomatis berubah jika URL gambar valid.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 py-3 rounded-xl font-bold text-sm tracking-wide hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Simpan Perubahan
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
