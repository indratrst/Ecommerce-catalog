"use client";

import Link from "next/link";
import {
  ShoppingBag,
  Search,
  User,
  X,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useDebounce } from "@/hooks/useDebounce";
import { isMockMode, setMockMode } from "@/services/rajaongkir/mock";
import Image from "next/image";

export function Header() {
  const { cart, setIsCartOpen } = useCart();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMock, setIsMock] = useState(false);
  const [isDev, setIsDev] = useState(false);

  const { data: searchResults, isLoading: isSearching } = useProducts(
    undefined,
    debouncedSearch.length >= 2 ? debouncedSearch : undefined,
  );

  const { data: categories } = useCategories();

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    setIsDev(process.env.NODE_ENV === "development");
    setIsMock(isMockMode());
  }, []);

  // Sync search input with URL params if it changes from outside
  useEffect(() => {
    const currentSearch = searchParams.get("search");
    if (currentSearch) {
      setSearchQuery(currentSearch);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isSearchVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchVisible]);

  // Lock scroll when search is open
  useEffect(() => {
    if (isSearchVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSearchVisible]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchVisible(false);
    }
  };

  const filteredCategories = categories
    ?.filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .slice(0, 5);

  return (
    <>
      <header
        className="w-full transition-all duration-300 absolute top-0 z-40 bg-black"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="flex items-center">
              {isDev && (
                <button
                  onClick={() => {
                    const newMode = !isMock;
                    setIsMock(newMode);
                    setMockMode(newMode);
                    window.location.reload();
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full ${isMock
                    ? "bg-amber-flame-500/20 text-amber-flame-700 border border-amber-flame-500/50"
                    : "bg-steel-blue-500/20 text-steel-blue-600 border border-steel-blue-500/50"
                    }`}
                >
                  {isMock ? "⚡ Mock" : "🌐 Live"}
                </button>
              )}
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-2xl tracking-tighter"
              >
                <span
                  className="px-2 py-1 uppercase text-lg font-black"
                  style={{ color: "var(--texted)" }}
                >
                  BITEWORKS
                </span>
              </Link>

              <nav
                className="hidden md:ml-10 md:flex md:space-x-8"
                style={{ color: "var(--texted)" }}
              >

                <Link
                  href={`/products?category=clothing`}
                  className="font-medium transition-colors hover:text-texted"
                  style={{ color: "var(--texted)" }}
                >
                  Clothing
                </Link>
                <Link
                  href={`/products?category=bags`}
                  className="font-medium transition-colors hover:text-texted"
                  style={{ color: "var(--texted)" }}
                >
                  Bags
                </Link>
                <Link
                  href={`/products?category=accessories`}
                  className="font-medium transition-colors hover:text-texted"
                  style={{ color: "var(--texted)" }}
                >
                  Accessories
                </Link>
                <Link
                  href={`/products?category=special-edition`}
                  className="font-medium transition-colors hover:text-texted"
                  style={{ color: "var(--texted)" }}
                >
                  Special Edition
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-6">
              <button
                style={{ color: "var(--texted)" }}
                onClick={() => setIsSearchVisible(true)}
                className="hover:text-texted transition-colors"
                aria-label="Open search"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                style={{ color: "var(--texted)" }}
                className="hover:text-texted transition-colors"
              >
                <User className="h-5 w-5" />
              </button>
              <button
                className="relative group flex items-center transition-colors"
                style={{ color: "var(--texted)" }}
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag className="h-5 w-5 mr-1" />
                <span className="font-medium hidden sm:inline-block">Cart</span>
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-brick-ember-500 rounded-full border-2 border-card-bg dark:border-deep-space-blue-950">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* SEARCH OVERLAY */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-500 ease-in-out ${isSearchVisible
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-deep-space-blue-950/45 backdrop-blur-sm"
          onClick={() => setIsSearchVisible(false)}
        />

        {/* Search Panel */}
        <div
          className={`bg-redabsolute top-0 inset-x-0 transition-transform duration-500 ease-in-out ${isSearchVisible ? "translate-y-0" : "-translate-y-full"
            }`}
          style={{
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            background: "var(--black)"
          }}
        >
          <div
            className="border-b"
            style={{ borderColor: "var(--surface-border)" }}
          >
            <div className="container mx-auto px-4 md:px-8 py-4 md:py-6 flex items-center gap-4">
              <Search className="h-6 w-6" style={{ color: "var(--texted)" }} />
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="What are you looking for?"
                  className="w-full text-xl md:text-2xl font-medium outline-none bg-transparent"
                  style={{ color: "var(--texted)" }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              {isSearching && searchQuery.length >= 2 && (
                <Loader2
                  className="h-5 w-5 animate-spin"
                  style={{ color: "var(--muted)" }}
                />
              )}
              <button
                onClick={() => setIsSearchVisible(false)}
                className="p-2 transition-colors hover:opacity-70"
                style={{ color: "var(--texted)" }}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto"
            style={{ background: "var(--black)" }}
          >
            <div className="container mx-auto px-4 md:px-8 py-10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                {/* Left Column: Suggestions */}
                <div className="md:col-span-4 lg:col-span-3">
                  <h3
                    className="text-xs font-bold uppercase tracking-widest mb-6"
                    style={{ color: "var(--texted)" }}
                  >
                    Suggestions
                  </h3>
                  <div className="space-y-4">
                    {filteredCategories && filteredCategories.length > 0 ? (
                      filteredCategories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/products?category=${cat.slug}`}
                          onClick={() => setIsSearchVisible(false)}
                          className="block text-lg font-bold hover:translate-x-1 transition-transform uppercase tracking-tighter"
                          style={{ color: "var(--texted)" }}
                        >
                          {cat.name}
                        </Link>
                      ))
                    ) : (
                      <p
                        className="text-sm italic"
                        style={{ color: "var(--muted)" }}
                      >
                        No category matches
                      </p>
                    )}

                    {searchQuery.length >= 2 && (
                      <Link
                        href={`/products?search=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setIsSearchVisible(false)}
                        className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest mt-8 pt-6 border-t"
                        style={{
                          color: "var(--texted)",
                          borderColor: "var(--surface-border)",
                        }}
                      >
                        See all results for &quot;{searchQuery}&quot;{" "}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Right Column: Products */}
                <div className="md:col-span-8 lg:col-span-9">
                  <h3
                    className="text-xs font-bold uppercase tracking-widest mb-6"
                    style={{ color: "var(--texted)" }}
                  >
                    Products
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults && searchResults.length > 0 ? (
                      searchResults.slice(0, 6).map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          onClick={() => setIsSearchVisible(false)}
                          className="flex items-center gap-4 group p-3 border transition-all shadow-sm"
                          style={{
                            background: "var(--card-bg)",
                            borderColor: "var(--surface-border)",
                          }}
                        >
                          <div
                            className="h-20 w-16 shrink-0 relative overflow-hidden"
                            style={{ background: "var(--surface)" }}
                          >
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.title}
                                height={400}
                                width={400}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center text-[10px]"
                                style={{ color: "var(--muted)" }}
                              >
                                IMG
                              </div>
                            )}
                          </div>
                          <div>
                            <h4
                              className="text-xs font-black uppercase tracking-tighter line-clamp-2 transition-colors"
                              style={{ color: "var(--foreground)" }}
                            >
                              {product.title}
                            </h4>
                            <p
                              className="text-[10px] uppercase tracking-widest mt-1"
                              style={{ color: "var(--foreground)" }}
                            >
                              {product.category.name}
                            </p>
                            <p
                              className="text-xs font-bold mt-2"
                              style={{ color: "var(--foreground)" }}
                            >
                              Rp {product.price.toLocaleString("id-ID")}
                            </p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="col-span-full py-10 flex flex-col items-center justify-center text-center">
                        <p
                          className="italic mb-4"
                          style={{ color: "var(--texted)" }}
                        >
                          {searchQuery.length < 2
                            ? "Start typing to search products..."
                            : `No products found for "${searchQuery}"`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
