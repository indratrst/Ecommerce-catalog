"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { BillingAddress } from "@/types/checkout";
import { MapPin, Phone, Mail, User, X } from "lucide-react";
import { searchLocations } from "@/services/rajaongkir/client";
import { LocationResult } from "@/types/rajaongkir";

interface CheckoutFormProps {
  deliveryMethod: "SHIPPING" | "PICKUP_STORE";
  onChange: (data: Partial<BillingAddress>) => void;
}

export function CheckoutForm({ deliveryMethod, onChange }: CheckoutFormProps) {
  const [formData, setFormData] = useState<Partial<BillingAddress>>({});

  console.log(formData,'tt')

  // State untuk autocomplete
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search locations with debounce
  const performSearch = useCallback(async (keyword: string) => {
    if (keyword.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    const results = await searchLocations(keyword);
    setSearchResults(results);
    setShowDropdown(results.length > 0);
    setIsSearching(false);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  const handleLocationSelect = (location: LocationResult) => {
    setSelectedLocation(location);
    setSearchQuery(location.label);
    setShowDropdown(false);

    const areaName = location.label;
    const provinceName = location.province_name;
    const cityName = location.city_name;
    const districtName = location.district_name || undefined;

    const newData: Partial<BillingAddress> = {
      ...formData,
      areaId: location.id,
      areaName,
      province_name: provinceName,
      city_name: cityName,
      district_name: districtName,
      postcode: location.zip_code || "",
      zip_code: location.zip_code || "",
    };

    setFormData(newData);
    onChange(newData);
  };

  const handleClearLocation = () => {
    setSelectedLocation(null);
    setSearchQuery("");
    setSearchResults([]);

    const newData: Partial<BillingAddress> = {
      ...formData,
      areaId: undefined,
      areaName: undefined,
      province_name: undefined,
      city_name: undefined,
      district_name: undefined,
      postcode: undefined,
      zip_code: undefined,
    };

    setFormData(newData);
    onChange(newData);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };

    console.log(newData,'ss')
    setFormData(newData);
    onChange(newData);
  };

  const getLocationBadge = (type: LocationResult["type"]) => {
    switch (type) {
      case "province":
        return (
          <span className="text-xs px-1.5 py-0.5 rounded bg-steel-blue-100 text-steel-blue-700">
            Province
          </span>
        );
      case "city":
        return (
          <span className="text-xs px-1.5 py-0.5 rounded bg-steel-blue-100 text-steel-blue-700">
            City
          </span>
        );
      case "district":
        return (
          <span className="text-xs px-1.5 py-0.5 rounded bg-amber-flame-100 text-amber-flame-700">
            District
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h2
        className="text-xl font-bold uppercase tracking-wider border-b pb-2"
        style={{ borderColor: "var(--surface-border)" }}
      >
        Billing Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground block">
            First Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
            <input
              type="text"
              name="firstName"
              value={formData.firstName || ""}
              required
              className="w-full bg-surface border-none p-3 pl-10 text-sm focus:ring-1 focus:ring-foreground"
              style={{
                backgroundColor: "var(--surface)",
                color: "var(--foreground)",
              }}
              placeholder="First Name"
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground block">
            Last Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
            <input
              type="text"
              name="lastName"
              value={formData.lastName || ""}
              required
              className="w-full bg-surface border-none p-3 pl-10 text-sm focus:ring-1 focus:ring-foreground"
              style={{
                backgroundColor: "var(--surface)",
                color: "var(--foreground)",
              }}
              placeholder="Last Name"
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground block">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              required
              className="w-full bg-surface border-none p-3 pl-10 text-sm focus:ring-1 focus:ring-foreground"
              style={{
                backgroundColor: "var(--surface)",
                color: "var(--foreground)",
              }}
              placeholder="Email"
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground block">
            Phone *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
            <input
              type="tel"
              name="phone"
              value={formData.phone || ""}
              required
              className="w-full bg-surface border-none p-3 pl-10 text-sm focus:ring-1 focus:ring-foreground"
              style={{
                backgroundColor: "var(--surface)",
                color: "var(--foreground)",
              }}
              placeholder="Phone Number"
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      {deliveryMethod === "SHIPPING" && (
        <>
          {/* Location Search - Autocomplete */}
          <div className="space-y-2" ref={searchRef}>
            <label className="text-xs font-bold uppercase text-muted-foreground block">
              City / District *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40 z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() =>
                  searchQuery.length >= 2 &&
                  searchResults.length > 0 &&
                  setShowDropdown(true)
                }
                className="w-full bg-surface border-none p-3 pl-10 pr-10 text-sm focus:ring-1 focus:ring-foreground"
                style={{
                  backgroundColor: "var(--surface)",
                  color: "var(--foreground)",
                }}
                placeholder="Search for city or district (min 2 characters)..."
              />
              {searchQuery && selectedLocation && (
                <button
                  type="button"
                  onClick={handleClearLocation}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
                >
                  <X className="h-4 w-4 opacity-40 hover:opacity-100" />
                </button>
              )}
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-cool-steel-500 border-t-transparent rounded-full" />
                </div>
              )}
            </div>

            {/* Dropdown Results */}
            {showDropdown && searchResults.length > 0 && (
              <div
                className="z-50 w-full max-h-64 overflow-y-auto rounded-md shadow-lg border mt-1"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--surface-border)",
                }}
              >
                {searchResults.map((result) => (
                  <button
                    type="button"
                    key={result.id}
                    onClick={() => handleLocationSelect(result)}
                    className="w-full text-left p-3 hover:bg-surface-hover transition-colors border-b last:border-b-0"
                    style={{
                      borderBottomColor: "var(--surface-border)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{result.label}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {result.province_name}
                          {result.city_name && `  ${result.city_name}`}
                          {result.district_name && `  ${result.district_name}`}
                          {result.zip_code && ` (${result.zip_code})`}
                        </p>
                      </div>
                      <div className="shrink-0">
                        {getLocationBadge(result.type)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {showDropdown &&
              searchQuery.length >= 2 &&
              !isSearching &&
              searchResults.length === 0 && (
                <div
                  className="absolute z-50 w-full rounded-md shadow-lg border p-4 text-center"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--surface-border)",
                  }}
                >
                  <p className="text-sm opacity-60">
                    No locations found. Try another keyword.
                  </p>
                </div>
              )}

            <p className="text-xs opacity-50 mt-1">
              Type at least 2 characters to search for your city or district
            </p>
          </div>

          {/* Selected Location Summary */}
          {selectedLocation && (
            <div
              className="p-3 rounded-md"
              style={{
                backgroundColor: "var(--surface-hover)",
                border: "1px solid var(--surface-border)",
              }}
            >
              <p className="text-xs font-bold uppercase mb-1">
                Selected Location
              </p>
              <p className="text-sm">{selectedLocation.label}</p>
              <p className="text-xs opacity-60 mt-1">
                Zip Code: {selectedLocation.zip_code || "N/A"}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground block">
              Street Address *
            </label>
            <textarea
              name="address"
              value={formData.address || ""}
              required
              rows={3}
              className="w-full bg-surface border-none p-3 text-sm focus:ring-1 focus:ring-foreground"
              style={{
                backgroundColor: "var(--surface)",
                color: "var(--foreground)",
              }}
              placeholder="House number and street name"
              onChange={handleInputChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
