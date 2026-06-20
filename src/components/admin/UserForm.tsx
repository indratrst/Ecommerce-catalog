"use client";

import { Loader2, Plus, ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { Role } from "@prisma/client";
import {
  CreateUser,
  CreateUserSchema,
  UserResponse,
} from "@/lib/validation/users.schema";
import { FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

interface UserFormProps {
  initialData?: UserResponse | null;
  onSubmit: (data: CreateUser) => Promise<void>;
  isLoading?: boolean;
}

export function UserForm({ initialData, onSubmit, isLoading }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUser>({
    resolver: standardSchemaResolver(CreateUserSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      password: "",
      role: initialData?.role || ("USER" as Role),
    },
  });

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   await onSubmit(formData);
  // };

  const onFormSubmit = async (data: CreateUser) => {
    // e.preventDefault();
    await onSubmit(data);
  };

  const onFormError = (errors: FieldErrors<CreateUser>) => {
    if (process.env.NODE_ENV === "development") {
      console.log("❌ Validation errors:", errors);
    }

    // 2. Pemicu Toast Error dari sonner
    toast.error("Gagal menyimpan! Silakan periksa kembali form Anda.");

    // 3. Logika auto-scroll kamu yang sebelumnya (tetap dipertahankan)
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey) {
      // Catatan: Karena kamu menggunakan react-hook-form, gunakan querySelector berdasarkan 'name' attribute
      const element = document.querySelector(
        `[name="${firstErrorKey}"]`,
      ) as HTMLElement;
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      element?.focus();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/users"
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
          {initialData ? "Edit User" : "New User"}
        </h2>
      </div>

      <form
        onSubmit={handleSubmit(onFormSubmit, onFormError)}
        className="space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
              Full Name
            </label>
            <input
              required
              placeholder="e.g. John Doe"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
              Email Address
            </label>
            <input
              required
              type="email"
              placeholder="e.g. user@example.com"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
              {initialData
                ? "New Password (Leave blank to keep current)"
                : "Password"}
            </label>
            <input
              required={!initialData}
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
              User Role
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all appearance-none"
                {...register("role")}
              >
                <option value="USER">User (View Only)</option>
                <option value="ADMIN">Admin (Manage Data)</option>
                <option value="SUPERUSER">Superuser (Full Control)</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            {errors.role && (
              <p className="text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {initialData ? "Update User" : "Save User"}
                {!initialData && <Plus className="w-5 h-5" />}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
