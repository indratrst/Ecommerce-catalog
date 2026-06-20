import { prisma } from "@/lib/prisma";
import {
  Package,
  Tag,
  Users,
  ShoppingBag,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function AdminDashboard() {
  const productCount = await prisma.product.count();
  const categoryCount = await prisma.category.count();
  const userCount = await prisma.user.count();
  const recentProducts = await prisma.product.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  const stats = [
    {
      name: "Total Products",
      value: productCount,
      icon: Package,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      name: "Categories",
      value: categoryCount,
      icon: Tag,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      name: "Admin Users",
      value: userCount,
      icon: Users,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Welcome back to your store management system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {stat.name}
              </p>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Products */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-500" />
              Recent Arrivals
            </h3>
            <Link
              href="/admin/products"
              className="text-xs font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentProducts.map((product) => (
              <div
                key={product.id}
                className="p-4 flex items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
              >
                <div className="relative w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                  {product.image && (
                    <Image
                      src={product.image}
                      alt={product.title}
                      className="object-cover w-full h-full"
                      fill
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {product.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {product.category.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-indigo-600">
                    IDR {product.price.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    New
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2 italic">
                Grow Your Catalog
              </h3>
              <p className="text-indigo-50/90 mb-6 text-sm italic font-medium">
                Add new high-quality products to elevate your store&apos;s
                appeal.
              </p>
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-indigo-50 transition-colors shadow-lg shadow-black/20"
              >
                <Plus className="w-4 h-4" />
                New Product
              </Link>
            </div>
            <Package className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10 rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-20" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/admin/categories/new"
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 transition-all flex flex-col gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Manage
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Categories
                </p>
              </div>
            </Link>
            <Link
              href="/admin/users"
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 transition-all flex flex-col gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Settings
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  User Roles
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
