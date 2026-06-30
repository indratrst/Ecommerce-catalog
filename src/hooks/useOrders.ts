"use client";
import api from "@/lib/axios";
import { CreateOrderData, Order } from "@/lib/validation/order.schema";
import { ErrorSchema } from "@/types";
import { OrderDataNew } from "@/types/checkout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

// Query hook
export function useOrders() {
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: () => api.get("/order").then((res) => res.data),
    staleTime: 60 * 60 * 1000,
  });
}

export function useOrder(id: string) {
  return useQuery<OrderDataNew>({
    queryKey: ["orders", id],
    enabled: !!id, // Only run if there's an id
    queryFn: () => api.get(`/order/${id}`).then((res) => res.data),
  });
}

// Mutation hook for creating a new order
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateOrderData) =>
      api.post("/order", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      router.push("/admin/order");
    },
    onError: (error: ErrorSchema) => {
      const message = error.message ?? "Failed to create order";
      alert(message); // Replace with toast if available
    },
  });
}

// Mutation hook - update an order
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateOrderData>;
    }) => {
      const res = await api.put(`/order/${id}`, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", variables.id] });
    },
  });
}

// Mutation hook - delete an order
export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/order/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

// Optional: For admin panel with stats
export function useOrdersWithStats() {
  return useQuery<{ order: Order; totalAmount: number }[]>({
    queryKey: ["orders", "with-stats"],
    queryFn: async () => {
      const res = await api.get("/orders?includeStats=true");
      return res.data;
    },
  });
}

// Mutation hook - Mengubah Order Status secara umum (misal dari dashboard admin)
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "PENDING" | "SETTLEMENT" | "EXPIRED" | "CANCEL" | "FAILED";
    }) => {
      const res = await api.put(`/order/${id}/status`, { status });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", variables.id] });
    },
    onError: (error: ErrorSchema) => {
      alert(error.message ?? "Gagal memperbarui status order");
    },
  });
}

// BARU: Mutation hook - Khusus Admin mengonfirmasi pengambilan barang (Pick Up)
export function useConfirmPickup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Menembak ke API khusus logistik/pickup order
      const res = await api.put(`/order/${id}/mark-picked-up`, {
        fulfillmentStatus: "PICKED_UP",
      });
      return res.data;
    },
    onSuccess: (_, id) => {
      // Invalidation otomatis memperbarui UI Admin agar lencana berubah jadi 'PICKED_UP'
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", id] });
    },
    onError: (error: ErrorSchema) => {
      alert(error.message ?? "Gagal mengonfirmasi pengambilan barang");
    },
  });
}

export function formatDate(date: Date) {
  const options = { year: "numeric", month: "long", day: "numeric" } as const;
  return new Date(date).toLocaleDateString(undefined, options);
}
