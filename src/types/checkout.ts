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

export interface OrderData {
  billingAddress: BillingAddress;
  shippingRate: ShippingRate | null;
  paymentMethod: string | null;
  items: any[];
  subtotal: number;
  shippingCost: number;
  total: number;
}
