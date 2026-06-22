"use client";

import Link from "next/link";
import { Clock, ShoppingBag, ArrowRight, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PendingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center py-20">
      <div className="bg-amber-flame-50 text-amber-flame-700 dark:bg-amber-flame-900/20 p-5 rounded-full mb-6 animate-[fadeIn_0.5s_ease]">
        <Clock className="h-16 w-16" />
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tighter mb-4">
        Menunggu Pembayaran
      </h1>

      <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
        Pesanan Anda telah dibuat. Selesaikan pembayaran melalui instruksi yang
        dikirim ke email Anda, atau cek aplikasi pembayaran Anda.
      </p>

      {orderId && (
        <div
          className="bg-surface border rounded-xl p-6 mb-10 w-full max-w-sm text-left"
          style={{ borderColor: "var(--surface-border)" }}
        >
          <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">
            ID Pesanan
          </p>
          <p className="text-sm font-mono font-bold break-all">{orderId}</p>
        </div>
      )}

      <div className="flex items-center gap-2 mb-8 text-amber-flame-700 dark:text-amber-flame-400 bg-amber-flame-50 dark:bg-amber-flame-900/20 px-4 py-3 rounded-lg">
        <RefreshCw className="h-4 w-4 shrink-0" />
        <p className="text-xs font-medium text-left">
          Status pesanan akan diperbarui otomatis setelah pembayaran
          dikonfirmasi.
        </p>
      </div>

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

export default function PendingPage() {
  return (
    <Suspense>
      <PendingContent />
    </Suspense>
  );
}

