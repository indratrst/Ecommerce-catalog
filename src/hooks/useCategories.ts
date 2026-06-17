import api from "@/lib/axios";
import {
  CategoryResponse,
  CreateCategory,
} from "@/lib/validation/category.schema";
import { ErrorSchema } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

// Query hook
export function useCategories() {
  return useQuery<CategoryResponse[]>({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then((res) => res.data),
    staleTime: 60 * 60 * 1000,
  });
}

export function useCategory(id: string) {
  return useQuery<CategoryResponse>({
    queryKey: ["categories", id],
    enabled: !!id, // Hanya jalan kalau ada id
    queryFn: () => api.get(`/categories/${id}`).then((res) => res.data),
  });
}

// Mutation hook untuk create
export function useCreateCategory() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateCategory) =>
      api.post("/categories", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.push("/admin/categories");
    },
    onError: (error: ErrorSchema) => {
      const message = error.message ?? "Failed to create category";
      alert(message); // ganti dengan toast jika ada
    },
  });
}

// Mutation hook - update product
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateCategory>;
    }) => {
      const res = await api.put(`/categories/${id}`, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories", variables.id] });
    },
  });
}

// Mutation hook - delete category
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/categories/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

// Optional: Untuk admin panel dengan count
export function useCategoriesWithStats() {
  return useQuery<(CategoryResponse & { productCount: number })[]>({
    queryKey: ["categories", "with-stats"],
    queryFn: async () => {
      const res = await api.get("/categories?includeStats=true");
      return res.data;
    },
  });
}
