import api from "@/lib/axios";
import {
  CreateUser,
  UpdateUser,
  UserResponse,
} from "@/lib/validation/users.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useUsers() {
  return useQuery<UserResponse[]>({
    queryKey: ["users"],
    queryFn: () => api.get("/users").then((res) => res.data),
    staleTime: 60 * 60 * 1000,
  });
}

export function useUser(id: string) {
  return useQuery<UserResponse>({
    queryKey: ["users", id],
    enabled: !!id, // Hanya jalan kalau ada id
    queryFn: () => api.get(`/user/${id}`).then((res) => res.data),
  });
}

// Mutation hook - create user
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateUser) =>
      api.post("/users", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Mutation hook - update product
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<UpdateUser>;
    }) => {
      const res = await api.put(`/users/${id}`, data);
      return res.data;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
    },
  });
}
