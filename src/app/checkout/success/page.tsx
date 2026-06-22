"use client";

import Link from "next/link";
import {
  CheckCircle,
  Clock,
  ShoppingBag,
  ArrowRight,
  CreditCard,
  Copy,
  Check,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [status, setStatus] = useState("PENDING");
  const paymentType = searchParams.get("payment_type") || "";
  const [copied, setCopied] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // const isPending = status === "pending";

  const handleCopy = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPaymentLabel = (type: string) => {
    const map: Record<string, string> = {
      bank_transfer: "Bank Transfer / Virtual Account",
      credit_card: "Kartu Kredit / Debit",
      gopay: "GoPay",
      shopeepay: "ShopeePay",
      qris: "QRIS",
      echannel: "Mandiri Bill",
      bca_klikbca: "BCA KlikBCA",
      bca_klikpay: "BCA KlikPay",
      cimb_clicks: "CIMB Clicks",
    };
    return map[type] || type || "—";
  };

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/order/${orderId}`);
      const data = await res.json();

      console.log("Fetched Order:", data);

      setOrder(data);
      setStatus(data.status);
      // if (data.status === "PAID" || data.status === "SETTLEMENT") {
      //   clearInterval(interval);
      // }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/order/${orderId}`);
        const data = await res.json();

        console.log("Fetched Order:", data);

        setOrder(data);
        setStatus(data.status);
        // if (data.status === "PAID" || data.status === "SETTLEMENT") {
        //   clearInterval(interval);
        // }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // const interval = setInterval(fetchOrder, 3000);

    // return () => clearInterval(interval);
  }, [orderId]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center py-20">
      {/* Icon */}
      <div
        className={`p-5 rounded-full mb-6 animate-[fadeIn_0.5s_ease] ${
          status === "PENDING"
            ? "bg-amber-flame-50 text-amber-flame-700 dark:bg-amber-flame-900/20"
            : "bg-steel-blue-50 text-steel-blue-600 dark:bg-steel-blue-900/20"
        }`}
      >
        {status === "PENDING" ? (
          <Clock className="h-16 w-16" />
        ) : (
          <CheckCircle className="h-16 w-16" />
        )}
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tighter mb-4">
        {status === "PENDING" ? "Menunggu Pembayaran" : "Pembayaran Berhasil!"}
      </h1>

      <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
        {status === "PENDING"
          ? "Pesanan Anda sedang menunggu konfirmasi pembayaran. Selesaikan pembayaran sebelum waktu berakhir."
          : "Terima kasih atas pembelian Anda! Pesanan sedang diproses dan akan segera dikirimkan."}
      </p>

      {/* Order Info Card */}
      <div
        className="bg-surface border rounded-xl p-6 mb-10 w-full max-w-sm space-y-4 text-left"
        style={{ borderColor: "var(--surface-border)" }}
      >
        {orderId && (
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">
              ID Pesanan
            </p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono font-bold truncate flex-1">
                {orderId}
              </p>
              <button
                onClick={handleCopy}
                className="shrink-0 p-1.5 hover:bg-deep-space-blue-900/5 rounded transition-colors"
                title="Salin ID"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-steel-blue-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        )}

        {paymentType && (
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">
              Metode Pembayaran
            </p>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold capitalize">
                {getPaymentLabel(paymentType)}
              </p>
            </div>
          </div>
        )}

        {order?.status === "PENDING" && (
          <>
            <p className="text-amber-flame-700 font-medium">
              Silakan selesaikan pembayaran kamu
            </p>

            {order.snapRedirectUrl && (
              <button
                onClick={() => window.open(order.snapRedirectUrl, "_blank")}
                className="bg-surface text-muted-foreground opacity-50 border border-dashed rounded-md px-4 py-2 text-sm font-bold uppercase tracking-wide"
              >
                Lanjutkan Pembayaran
              </button>
            )}
          </>
        )}

        <button
          disabled={status !== "PENDING"}
          onClick={() => fetchOrder()}
          className="bg-surface text-muted-foreground opacity-50 border border-dashed rounded-md px-4 py-2 text-sm font-bold uppercase tracking-wide cursor-pointer"
        >
          Cek Status Pembayaran
        </button>

        <div>
          <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">
            Status
          </p>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1 rounded-full ${
              status === "PENDING"
                ? "bg-amber-flame-100 text-amber-flame-800 dark:bg-amber-flame-900/30 dark:text-amber-flame-400"
                : "bg-steel-blue-100 text-steel-blue-700 dark:bg-steel-blue-900/30 dark:text-steel-blue-300"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                status === "PENDING" ? "bg-amber-flame-500" : "bg-steel-blue-500"
              }`}
            />
            {status === "PENDING" ? "Pending" : "Lunas"}
          </span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Link
          href="/products"
          className="flex-1 bg-deep-space-blue-900 text-white py-4 px-8 uppercase font-bold text-sm tracking-widest hover:bg-steel-blue-700 transition-all flex items-center justify-center gap-2"
        >
          Lanjut Belanja <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/"
          className="flex-1 border-2 border-deep-space-blue-900 py-4 px-8 uppercase font-bold text-sm tracking-widest hover:bg-deep-space-blue-900 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <ShoppingBag className="h-4 w-4" /> Beranda
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}

