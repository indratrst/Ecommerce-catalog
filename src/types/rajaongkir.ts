export interface LocationResult {
  id: string;
  label: string;
  province_name: string;
  city_name: string;
  district_name: string | null;
  subdistrict_name: string | null;
  zip_code: string;
  type: "province" | "city" | "district" | "subdistrict";
}

export interface ShippingRate {
  courier_name: string;
  courier_code: string;
  courier_service_name: string;
  courier_service_code: string;
  price: number;
  duration: string;
}

export interface RajaOngkirRate {
  courier_name?: string;
  courier_code?: string;
  courier_service_name?: string;
  courier_service_code?: string;
  service?: string;
  price?: number;
  duration?: string;
  etd?: string;
}

export interface CalculateRatesParams {
  originId: string;
  destinationId: string;
  weight: number;
  courier: string;
}
