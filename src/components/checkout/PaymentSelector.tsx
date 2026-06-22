"use client";

import { useState } from "react";
import { CreditCard, Wallet, Landmark, QrCode, ShieldCheck } from "lucide-react";

const PAYMENT_METHODS = [
  {
    id: "bank_transfer",
    name: "Bank Transfer / VA",
    description: "BCA, BNI, BRI, Mandiri, Permata",
    icon: Landmark,
    type: "Virtual Account",
  },
  {
    id: "credit_card",
    name: "Credit / Debit Card",
    description: "Visa, Mastercard, JCB",
    icon: CreditCard,
    type: "Card",
  },
  {
    id: "gopay",
    name: "GoPay / GoPayLater",
    description: "Dompet digital Gojek",
    icon: Wallet,
    type: "E-Wallet",
  },
  {
    id: "shopeepay",
    name: "ShopeePay",
    description: "Dompet digital Shopee",
    icon: Wallet,
    type: "E-Wallet",
  },
  {
    id: "qris",
    name: "QRIS",
    description: "Scan & Pay dengan aplikasi apapun",
    icon: QrCode,
    type: "QR Code",
  },
];

interface PaymentSelectorProps {
  onSelect: (methodId: string) => void;
}

export function PaymentSelector({ onSelect }: PaymentSelectorProps) {
  const [selectedId, setSelectedId] = useState("");

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelect(id);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
        <CreditCard className="h-4 w-4" /> Payment Method
      </h3>

      <div className="grid grid-cols-1 gap-2">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedId === method.id;
          const Icon = method.icon;
          return (
            <label
              key={method.id}
              className={`flex items-center gap-4 p-4 border cursor-pointer transition-all ${
                isSelected
                  ? "bg-deep-space-blue-900 text-white border-deep-space-blue-900 dark:bg-card-bg dark:text-deep-space-blue-950 dark:border-card-bg"
                  : "bg-surface border-transparent hover:border-steel-blue-300"
              }`}
              onClick={() => handleSelect(method.id)}
            >
              <input
                type="radio"
                name="payment_method"
                className="hidden"
                checked={isSelected}
                readOnly
              />
              <Icon
                className={`h-5 w-5 shrink-0 ${
                  isSelected ? "text-white dark:text-deep-space-blue-950" : "text-muted-foreground"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold uppercase leading-tight">{method.name}</p>
                <p
                  className={`text-[10px] mt-0.5 ${
                    isSelected ? "text-cool-steel-300 dark:text-cool-steel-600" : "text-muted-foreground"
                  }`}
                >
                  {method.description}
                </p>
              </div>
              <span
                className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                  isSelected
                    ? "bg-card-bg/20 dark:bg-deep-space-blue-900/20 text-white dark:text-deep-space-blue-950"
                    : "bg-surface-border text-muted-foreground"
                }`}
              >
                {method.type}
              </span>
              {isSelected && (
                <div className="h-2 w-2 rounded-full bg-card-bg dark:bg-deep-space-blue-900 shrink-0" />
              )}
            </label>
          );
        })}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <ShieldCheck className="h-3.5 w-3.5 text-steel-blue-600 shrink-0" />
        <p className="text-[10px] text-muted-foreground">
          Pembayaran diproses secara aman oleh{" "}
          <span className="font-bold text-foreground">Midtrans</span>. Data Anda terenkripsi.
        </p>
      </div>
    </div>
  );
}

