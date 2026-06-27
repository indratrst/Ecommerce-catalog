export async function getRajaOngkirProvinces() {
  const res = await fetch("/api/rajaongkir?type=destination/province");
  const data = await res.json();
  return data.data || [];
}

export async function getRajaOngkirCities(provinceId: string) {
  const res = await fetch(
    `/api/rajaongkir?type=destination/city/${provinceId}`,
  );
  const data = await res.json();
  return data.data || [];
}

export async function getRajaOngkirDistricts(cityId: string) {
  const res = await fetch(
    `/api/rajaongkir?type=destination/district/${cityId}`,
  );
  const data = await res.json();
  return data.data || [];
}

export async function calculateRates(
  originId: string,
  destinationId: string,
  weight: number,
  courier: string,
  isDistrict = false,
) {
  const res = await fetch("/api/rajaongkir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: isDistrict ? "district" : "city",
      origin: originId,
      destination: destinationId,
      weight,
      courier,
    }),
  });
  const data = await res.json();
  return data.data || [];
}

// Matching logic
export function findMatch<T extends Record<string, unknown>>(
  list: T[],
  name: string,
  keyName: keyof T,
): T | undefined {
  if (!name || !list || !Array.isArray(list)) return undefined;
  const normalized = name
    .toLowerCase()
    .replace(/^(kab|kota|kabupaten)\.?\s+/i, "")
    .trim();
  return list.find((item) =>
    String(item[keyName]).toLowerCase().includes(normalized),
  );
}
