import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0f172a]">
      <AdminSidebar role={session.role} userName="Administrator" />
      <main className="flex-1 overflow-y-auto h-screen p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
        <Toaster richColors position="top-right" />
      </main>
    </div>
  );
}
