"use client";

import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteModal } from "@/components/admin/DeleteModal";
import { UserForm } from "@/components/admin/UserForm";
import { Plus, Shield, ShieldCheck, ShieldAlert, X } from "lucide-react";
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUsers,
} from "@/hooks/useUsers";
import { CreateUser, UpdateUser } from "@/lib/validation/users.schema";

export default function UsersPage() {
  const { data: users = [], isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal for creating/editing users
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  // async function fetchUsers() {
  //   setIsLoading(true);
  //   try {
  //     const res = await fetch("/api/users");
  //     const data = await res.json();
  //     setUsers(data);
  //   } catch (error) {
  //     console.error("Failed to fetch users:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  // useEffect(() => {
  //   fetchUsers();
  // }, []);

  // const handleDelete = async () => {
  //   if (!deleteId) return;
  //   setIsDeleting(true);
  //   try {
  //     const res = await fetch(`/api/users/${deleteId}`, {
  //       method: "DELETE",
  //     });
  //     if (res.ok) {
  //       setUsers(users.filter((u) => u.id !== deleteId));
  //       setDeleteId(null);
  //     }
  //   } catch (error) {
  //     console.error("Failed to delete user:", error);
  //   } finally {
  //     setIsDeleting(false);
  //   }
  // };

  const deleteUser = useDeleteUser();

  const handleDelete = async () => {
    if (!deleteId) return;
    // setIsDeleting(true);
    // try {
    //   const res = await fetch(`/api/users/${deleteId}`, {
    //     method: "DELETE",
    //   });
    //   if (res.ok) {
    //     // Refetch data setelah delete
    //     await refetch();
    //     setDeleteId(null);
    //   }
    deleteUser.mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null);
        // fetchCategories(); // atau invalidate query
      },
    });
  };

  const handleSubmit = async (data: CreateUser | UpdateUser) => {
    setFormLoading(true);
    try {
      if (editingUser) {
        // Mode update
        const updateData: Partial<UpdateUser> = {
          name: data.name,
          email: data.email,
          role: data.role,
          // tambahkan field lain yang perlu diupdate
        };
        await updateUser.mutateAsync({ id: editingUser.id, data: updateData });
      } else {
        // Mode create
        await createUser.mutateAsync(data as CreateUser);
      }
      setIsModalOpen(false);
      setEditingUser(null);
      // Data akan otomatis refetch karena onSuccess di hook sudah handle invalidateQueries
    } catch (error) {
      console.error("User action failed:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (name: string, item: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-white">
            {name}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {item.email}
          </span>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (role: string) => {
        const config: any = {
          SUPERUSER: {
            bg: "bg-purple-100",
            text: "text-purple-700",
            icon: ShieldCheck,
          },
          ADMIN: { bg: "bg-blue-100", text: "text-blue-700", icon: Shield },
          USER: {
            bg: "bg-slate-100",
            text: "text-slate-700",
            icon: ShieldAlert,
          },
        };
        const { bg, text, icon: Icon } = config[role] || config.USER;
        return (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${bg} ${text}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {role}
          </div>
        );
      },
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (date: string) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            User Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage access and permissions for your staff.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Access
        </button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        onEdit={(item) => {
          setEditingUser(item);
          setIsModalOpen(true);
        }}
        onDelete={(item) => setDeleteId(item.id)}
        searchPlaceholder="Filter users by name, email..."
      />

      {/* User Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-slate-50 dark:bg-slate-950 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-y-auto relative animate-in zoom-in-95 duration-200 scrollbar-hide">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-8">
              <UserForm
                initialData={editingUser}
                onSubmit={handleSubmit}
                isLoading={formLoading}
              />
            </div>
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Revoke Access"
        description="Are you sure you want to remove this user? They will lose all access to the CMS immediately."
      />
    </div>
  );
}
