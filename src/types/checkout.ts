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
  quantity: number;
  priceAtPurchase: number;
  variantNameAtPurchase: string;
  product: {
    id: string;
    title: string;
    image: string;
  };
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

export interface OrderDataNew {
  id: string;
  userId?: string; // Optional, if user is not null
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress?: string; // Optional
  totalAmount: number;
  status: "PENDING" | "SETTLEMENT" | "EXPIRED" | "CANCEL" | "FAILED";
  snapToken?: string;
  snapRedirectUrl?: string;
  paymentMethod?: string;
  externalId?: string;
  stockReduced: boolean;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}
