"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { ShippingSelector } from "@/components/checkout/ShippingSelector";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { BillingAddress, ShippingRate } from "@/types/checkout";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { PaymentConfirmationModal } from "@/components/checkout/PaymentConfirmationModal";
import { toast } from "sonner";
import axios from "axios";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [billingData, setBillingData] = useState<Partial<BillingAddress>>({});
  const [shippingRate, setShippingRate] = useState<ShippingRate | null>(null);

  // 💡 Menggunakan tipe literal yang sesuai dengan Enum ShippingMethod di Prisma
  const [deliveryMethod, setDeliveryMethod] = useState<
    "SHIPPING" | "PICKUP_STORE"
  >("SHIPPING");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const shippingCost = shippingRate?.price || 0;
  const totalAmount = cartTotal + shippingCost;

  const isFormValid =
    billingData.firstName &&
    billingData.lastName &&
    billingData.email &&
    billingData.phone &&
    (deliveryMethod === "PICKUP_STORE" ||
      (billingData.areaId && billingData.address)) &&
    (deliveryMethod === "PICKUP_STORE" || shippingRate);

  // Memicu modal konfirmasi muncul
  const handleConfirmPayment = () => {
    setErrorMsg(null);
    setIsSubmitting(true);
  };

  // Dipanggil dari dalam PaymentConfirmationModal setelah user klik konfirmasi final
  const handlePlaceOrder = async () => {
    try {
      // 💡 Menggunakan axios untuk mengirim payload ke backend
      const response = await axios.post("/api/payment/midtrans", {
        items: cart,
        billingData,
        shippingCost,
        subtotal: cartTotal,
        total: totalAmount,
        shippingMethod: deliveryMethod,
        shippingCourier: shippingRate?.courier_code || null,
        shippingService: shippingRate?.courier_service_code || null,
      });

      // Axios secara otomatis melakukan parsing JSON, jadi langsung ambil dari response.data
      const data = response.data;

      if (!data.token) {
        setErrorMsg("Gagal membuat transaksi. Token tidak ditemukan.");
        setIsSubmitting(false);
        return;
      }

      const { token, order_id } = data;

      // Jalankan pop-up Midtrans Snap
      window.snap.pay(token, {
        onSuccess(result) {
          clearCart();
          router.push(
            `/checkout/success?order_id=${order_id}&status=success&payment_type=${result.payment_type || ""}`,
          );
        },
        onPending(result) {
          clearCart();
          router.push(
            `/checkout/success?order_id=${order_id}&status=pending&payment_type=${result.payment_type || ""}`,
          );
        },
        onError(result) {
          console.error("Midtrans payment error:", result);
          setErrorMsg("Pembayaran gagal. Silakan coba metode lain.");
          setIsSubmitting(false);
        },
        onClose() {
          clearCart();
          router.push(`/checkout/success?order_id=${order_id}&status=pending`);
        },
      });
    } catch (error) {
      setIsSubmitting(false);

      // 💡 Menangani error catch khusus untuk Axios
      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data;
        const msg = Array.isArray(data.error)
          ? data.error.join(", ")
          : data.error || "Gagal membuat transaksi. Coba lagi.";
        setErrorMsg(msg);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        console.error("An unexpected error occurred", error);
      }
    }
  };

  if (cart.length === 0 && !isSubmitting) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <h2 className="font-heading text-4xl font-semibold">
          Your cart is empty
        </h2>
        <Link
          href="/products"
          className="bg-deep-space-blue-900 text-white px-8 py-3 uppercase text-sm font-bold hover:bg-steel-blue-700 transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <div className="mb-8">
        <Link
          href="/products"
          className="text-xs font-bold uppercase flex items-center gap-2 hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Products
        </Link>
        <h1 className="font-heading text-5xl md:text-6xl font-semibold mt-4">
          Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Forms */}
        <div className="lg:col-span-8 space-y-12">
          {/* Delivery Method Toggle */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setDeliveryMethod("SHIPPING");
                setShippingRate(null);
              }}
              className={`flex-1 py-4 border-2 font-bold uppercase transition-all ${
                deliveryMethod === "SHIPPING"
                  ? "border-deep-space-blue-900 bg-deep-space-blue-900 text-white"
                  : "border-cool-steel-200 text-muted-foreground"
              }`}
            >
              Delivery Shipping
            </button>
            <button
              onClick={() => {
                setDeliveryMethod("PICKUP_STORE");
                setShippingRate({
                  courier_name: "Store Pickup",
                  courier_code: "PICKUP",
                  courier_service_name: "Self Pickup",
                  courier_service_code: "PICKUP",
                  price: 0,
                  duration: "Same Day",
                });
              }}
              className={`flex-1 py-4 border-2 font-bold uppercase transition-all ${
                deliveryMethod === "PICKUP_STORE"
                  ? "border-deep-space-blue-900 bg-deep-space-blue-900 text-white"
                  : "border-cool-steel-200 text-muted-foreground"
              }`}
            >
              Ambil di Store
            </button>
          </div>

          <CheckoutForm
            deliveryMethod={deliveryMethod}
            onChange={(data) =>
              setBillingData((prev) => ({ ...prev, ...data }))
            }
          />

          <div
            className="grid md:grid-cols-1 gap-8 pt-8 border-t"
            style={{ borderColor: "var(--surface-border)" }}
          >
            {deliveryMethod === "SHIPPING" ? (
              <ShippingSelector
                billingData={billingData}
                items={cart}
                onSelect={(rate: ShippingRate) => setShippingRate(rate)}
              />
            ) : (
              <div
                className="p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center space-y-2"
                style={{ borderColor: "var(--surface-border)" }}
              >
                <p className="text-sm font-bold uppercase">Store Location</p>
                <p className="text-xs text-muted-foreground">
                  BITEWORKS Flagship Store
                  <br />
                  Jl. Sultan Agung No. 24, Bandung
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-brick-ember-50 border border-brick-ember-200 text-brick-ember-700 p-4 text-sm rounded-lg font-medium">
              ⚠️ {errorMsg}
            </div>
          )}
        </div>

        {/* Right Column: Summary */}
        <div className="lg:col-span-4 top-24 self-start">
          <OrderSummary
            items={cart}
            subtotal={cartTotal}
            shippingRate={shippingRate}
          />

          <button
            id="place-order-btn"
            onClick={handleConfirmPayment}
            disabled={!isFormValid || isSubmitting}
            className={`w-full mt-6 py-4 uppercase font-bold tracking-widest transition-all shadow-md flex items-center justify-center gap-2 ${
              isFormValid && !isSubmitting
                ? "bg-deep-space-blue-900 text-white hover:bg-steel-blue-700 dark:bg-card-bg dark:text-deep-space-blue-950 dark:hover:bg-cool-steel-100 scale-[1.02]"
                : "bg-cool-steel-100 text-muted-foreground opacity-60 cursor-not-allowed border border-dashed border-cool-steel-300"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Menyiapkan
                pembayaran...
              </>
            ) : (
              "Bayar Sekarang"
            )}
          </button>

          <PaymentConfirmationModal
            isOpen={isSubmitting}
            onClose={() => setIsSubmitting(false)}
            onConfirm={handlePlaceOrder}
            items={cart}
            deliveryMethod={deliveryMethod}
            shippingRate={shippingRate}
            total={totalAmount}
          />

          {isFormValid && !isSubmitting && (
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <ShieldCheck className="h-3.5 w-3.5 text-steel-blue-600" />
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-tighter">
                Aman & dienkripsi via Midtrans
              </p>
            </div>
          )}

          {!isFormValid && (
            <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-tighter">
              Lengkapi semua field, pilih pengiriman & metode bayar
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
