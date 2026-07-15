"use client";

import { Column, DataTable } from "@/components/admin/DataTable";
import { useOrders } from "@/hooks/useOrders";
import { Order } from "@/lib/validation/order.schema";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function OrdersPage() {
  const router = useRouter();
  const { data: orders } = useOrders();
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("ALL");

  const sortedOrders = useMemo(() => {
    return [...(orders ?? [])].sort((a, b) => {
      const aTime = new Date(a.createdAt ?? 0).getTime();
      const bTime = new Date(b.createdAt ?? 0).getTime();
      return bTime - aTime;
    });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return sortedOrders.filter((order) => {
      const paymentMatch =
        paymentFilter === "ALL" || order.paymentStatus === paymentFilter;
      const fulfillmentMatch =
        fulfillmentFilter === "ALL" ||
        order.fulfillmentStatus === fulfillmentFilter;

      return paymentMatch && fulfillmentMatch;
    });
  }, [sortedOrders, paymentFilter, fulfillmentFilter]);

  const columns: Column<Order>[] = [
    {
      key: "id",
      label: "Order ID",
      render: (id) => (
        <span className="text-slate-900 dark:text-white font-medium">{id}</span>
      ),
    },
    {
      key: "customerName",
      label: "Customer Name",
      render: (name) => (
        <span className="text-slate-900 dark:text-white font-medium">
          {name}
        </span>
      ),
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      render: (amount) => (
        <span className="text-slate-900 dark:text-white font-medium">
          IDR {amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "paymentStatus",
      label: "Payment Status",
      render: (paymentStatus) => (
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block w-fit  capitalize ${
            paymentStatus === "PENDING"
              ? "bg-amber-100 text-amber-700"
              : paymentStatus === "SETTLEMENT"
                ? "bg-emerald-100 text-emerald-700"
                : ""
          }`}
        >
          {paymentStatus}
        </span>
      ),
    },
    {
      key: "fulfillmentStatus",
      label: "fulfillmentStatus",
      render: (fulfillmentStatus) => (
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block w-fit  capitalize ${
            fulfillmentStatus === "NOT_APPLICABLE"
              ? "bg-red-100 text-amber-900"
              : fulfillmentStatus === "PICKED_UP"
                ? "bg-emerald-100 text-emerald-700"
                : fulfillmentStatus === "PROCESSING"
                  ? "bg-orange-200 text-red-900"
                  : ""
          }`}
        >
          {fulfillmentStatus}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (date) => (
        <span className="text-slate-900 dark:text-white font-medium">
          {date ? new Date(date).toLocaleDateString() : "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            Order Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage and track orders for your customers.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-end">
        <label className="flex flex-1 flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="font-semibold">Payment Status</span>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="ALL">Semua</option>
            <option value="PENDING">Pending</option>
            <option value="SETTLEMENT">Settlement</option>
            <option value="CANCEL">Cancel</option>
            <option value="FAILED">Failed</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </label>

        <label className="flex flex-1 flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="font-semibold">Fulfillment Status</span>
          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="ALL">Semua</option>
            <option value="NOT_APPLICABLE">Not Applicable</option>
            <option value="PROCESSING">Processing</option>
            <option value="READY_TO_PICKUP">Ready to Pickup</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </label>

        <button
          type="button"
          onClick={() => {
            setPaymentFilter("ALL");
            setFulfillmentFilter("ALL");
          }}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Reset Filter
        </button>
      </div>

      {/* DataTable for Orders */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        searchPlaceholder="Cari nama pelanggan, status, ID order..."
        onEdit={(item) => router.push(`/admin/orders/${item.id}/detail/`)}
      />
    </div>
  );
}
