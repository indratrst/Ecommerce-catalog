import { ProductVariant } from "@/lib/validation/products.schema";

export interface BillingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  areaId: string; // Biteship Area ID or wilayah.id code
  areaName: string; // For display
  province_name?: string;
  city_name?: string;
  district_name?: string;
  postcode: string;
  zip_code: string;
}

export interface ShippingRate {
  courier_name: string;
  courier_code: string;
  courier_service_name: string;
  courier_service_code: string;
  price: number;
  duration: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

// export interface OrderItem {
//   productVariantId: string;
//   quantity: number;
//   priceAtPurchase: number;
//   variantNameAtPurchase: string; // Tambahkan ini
//   product: {
//     id: string | number;
//     title: string;
//     image: string;
//   };
// }

export interface OrderItem {
  productVariantId: string;
  productVariant: ProductVariant;
  quantity: number;
  priceAtPurchase: number;
  variantNameAtPurchase: string;
}

export interface OrderData {
  billingAddress: BillingAddress;
  shippingRate: ShippingRate | null;
  paymentMethod: string | null;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
}

export interface ProductResponse {
  id: string;
  title: string;
  price: number;
  description: string;
  image: string;
  ratingRate: number;
  ratingCount: number;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariantWithProduct {
  id: string;
  productId: string;
  size: string;
  color: string | null; // Sesuai JSON, bisa bernilai null
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product: ProductResponse; // Scope product masuk ke dalam productVariant
}

export interface OrderItemDetail {
  id: string;
  orderId: string;
  productVariantId: string;
  quantity: number;
  priceAtPurchase: number;
  variantSnapshot: Omit<ProductVariantWithProduct, "product">; // Snapshot data lama tanpa relasi product live
  productVariant: ProductVariantWithProduct; // Data live variant beserta detail product-nya
}

export interface OrderDataNew {
  id: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress?: string | null;
  totalAmount: number;

  // Murni untuk status pembayaran Midtrans
  paymentStatus: PaymentStatus;

  // Murni untuk progress fisik/operasional barang dan pengiriman
  fulfillmentStatus: FulfillmentStatus;

  // Data Logistik Jalur 1
  shippingMethod: "PICKUP_STORE" | "SHIPPING";
  shippingCourier: string | null;
  shippingService: string | null;
  shippingCost: number;
  trackingNumber: string | null; // Diinput manual oleh Admin saat status berubah jadi SHIPPED
  trackingToken: string;

  snapToken?: string | null;
  snapRedirectUrl?: string | null;
  paymentMethod?: string | null;
  externalId?: string | null;
  stockReduced: boolean;
  items: OrderItemDetail[];
  user?: { name: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

enum PaymentStatus {
  PENDING,
  SETTLEMENT,
  EXPIRED,
  CANCEL,
  FAILED,
}

enum FulfillmentStatus {
  NOT_APPLICABLE = "NOT_APPLICABLE",
  PROCESSING = "PROCESSING",
  READY_TO_PICKUP = "READY_TO_PICKUP",
  PICKED_UP = "PICKED_UP",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
}
