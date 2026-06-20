"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  Users,
  LogOut,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { Role } from "@prisma/client";

interface SidebarProps {
  role: Role;
  userName: string;
}

export function AdminSidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      roles: ["SUPERUSER", "ADMIN", "USER"],
    },
    {
      name: "Products",
      icon: Package,
      href: "/admin/products",
      roles: ["SUPERUSER", "ADMIN", "USER"],
    },
    {
      name: "Categories",
      icon: Tag,
      href: "/admin/categories",
      roles: ["SUPERUSER", "ADMIN", "USER"],
    },
    { name: "Users", icon: Users, href: "/admin/users", roles: ["SUPERUSER"] },
  ];

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  return (
    <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800">
      <div className="p-6">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            CMS Admin
          </span>
        </div>

        <nav className="space-y-1">
          {menuItems
            .filter((item) => item.roles.includes(role))
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-indigo-600/10 text-indigo-400 font-semibold"
                      : "hover:bg-slate-800/50 hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${isActive ? "text-indigo-500" : "group-hover:text-indigo-400 transition-colors"}`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
        </nav>
      </div>

      <div className="mt-auto p-4 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-4 py-3 text-sm rounded-xl bg-slate-800/30 hover:bg-slate-800 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            <span>Storefront</span>
          </div>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
            ↗
          </span>
        </Link>

        <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">
            Signed in as
          </p>
          <p className="text-sm font-semibold text-white truncate">
            {userName}
          </p>
          <div className="mt-2 inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">
            {role}
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-4 flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
