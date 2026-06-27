// src/hooks/useOrders.ts

import api from "@/lib/axios";
import { CreateOrderData, Order } from "@/lib/validation/order.schema";
import { ErrorSchema } from "@/types";
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
  return useQuery<Order>({
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
