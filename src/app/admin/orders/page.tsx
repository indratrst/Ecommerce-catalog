"use client";

import { Column, DataTable } from "@/components/admin/DataTable";
import { useOrders } from "@/hooks/useOrders";
import { Order } from "@/lib/validation/order.schema";
import { useRouter } from "next/navigation";
export default function OrdersPage() {
  const router = useRouter();
  const { data: orders } = useOrders();

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
    // {
    //   key: "createdAt",
    //   label: "Created At",
    //   render: (date) => (
    //     <span className="text-slate-900 dark:text-white font-medium">
    //       {new Date(date).toLocaleDateString()}
    //     </span>
    //   ),
    // },
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

      {/* DataTable for Orders */}
      <DataTable
        columns={columns}
        data={orders}
        searchPlaceholder="Filter orders by customer name, status..."
        onEdit={(item) => router.push(`/admin/orders/${item.id}/detail/`)}
      />
    </div>
  );
}
