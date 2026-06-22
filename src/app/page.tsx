import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, RefreshCcw, Package } from "lucide-react";
import { getProducts } from "@/lib/data";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ProductListClient } from "@/components/products/ProductListClient";
import { dummyCategories } from "@/data/categories";



export default async function Home() {
  const queryClient = new QueryClient();

  // Prefetch products data
  await queryClient.prefetchQuery({
    queryKey: ["products", { category: undefined }],
    queryFn: () => getProducts(),
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 flex flex-col items-center">
          <span className="text-white/85 font-semibold tracking-[0.28em] uppercase mb-4 text-xs md:text-sm">
            Latest Collection
          </span>
          <h1 className="font-heading text-6xl md:text-8xl font-semibold text-white mb-6 leading-[0.95]">
            Elevate Your <br className="hidden md:block" /> Everyday
          </h1>
          <p className="text-base md:text-lg text-gray-200 mb-10 max-w-2xl font-medium leading-8">
            Discover premium streetwear and lifestyle essentials designed for
            those who appreciate quality and style.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="#new-arrivals"
              className="bg-white text-black px-10 py-4 font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 group"
            >
              Shop New Arrivals
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#categories"
              className="bg-transparent border-2 border-white text-white px-10 py-4 font-bold uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              Explore Categories
            </Link>
          </div>
        </div>
      </section>



      {/* CATEGORIES SECTION */}
      <section
        id="categories"
        className="py-20 "

      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-left mb-12">
            <h2
              className="font-heading text-4xl md:text-5xl font-semibold text-deep-space-blue-800"
            >
              Shop by Category
            </h2>
            <div
              className="h-1 w-24 mt-4 bg-black"
            ></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {dummyCategories.map((category) => (
              <Link
                key={category.name}
                href={`/products?category=${category.name.toLowerCase()}`}
                className="group relative h-100 overflow-hidden flex items-center justify-center"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url('${category.image}')` }}
                >
                  <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:bg-black/50" />
                </div>
                <div className="relative z-10 text-center">
                  <h3 className="font-heading text-4xl md:text-5xl font-semibold text-white mb-2 inline-block border-b-2 border-white   transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WORK & OFFICE ATTIRE SECTION */}
      <section className="relative h-[70vh] w-full flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-fixed "
          style={{ backgroundImage: "url('/images/homepage/work-office-hero.png')" }}
        >
          <div className="absolute inset-0 bg-linear-to-r
from-black
to-transparent" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-xl text-white">
            <h6 className="uppercase tracking-[0.3em] text-sm font-bold mb-4 text-white/90">
              Work & Office Attire
            </h6>
            <h2 className="font-heading text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Professional pinstripe <br /> blazers collection
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-lg leading-relaxed">
              Dive into a world of style with our latest collection! Shop now and redefine your wardrobe narrative!
            </p>
            <Link
              href="/products?category=work"
              className="inline-block bg-white text-black px-10 py-4 font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* COLLECTION GRID SECTION */}
      {/* <section className="py-24 bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Professional Pinstripe Blazer",
                price: "$109.99",
                category: "Activewear", // As per reference markdown category but naming suggests office
                image: "/images/homepage/pinstripe-blazer.png"
              },
              {
                name: "Relaxed Fit Joggers",
                price: "$250.00",
                category: "Work & Office",
                image: "/images/homepage/joggers.png"
              },
              {
                name: "Urban Chic Ensemble",
                price: "$224.95",
                category: "Evening Dresses",
                image: "/images/homepage/urban-chic.png"
              },
              {
                name: "Weekend Wanderlust Wardrobe",
                price: "$119.95",
                category: "Activewear",
                image: "/images/homepage/weekend-wanderlust.png"
              }
            ].map((item, index) => (
              <div key={index} className="group flex flex-col">
                <div className="relative aspect-[3/4] overflow-hidden mb-6 bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-black text-[10px] uppercase tracking-widest font-bold px-3 py-1">
                      New
                    </span>
                  </div>
                  <button className="absolute bottom-0 left-0 right-0 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] transform translate-y-full transition-transform duration-300 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">
                    Add to Cart
                  </button>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-semibold">{item.category}</span>
                  <h3 className="font-heading text-lg font-semibold mb-2 group-hover:text-gray-600 transition-colors">{item.name}</h3>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}


      {/* NEW ARRIVALS SECTION */}
      <section
        id="new-arrivals"
        className="py-16 "

      // style={{ borderColor: "var(--surface-border)" }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-left mb-10">
            <h2
              className="font-heading text-4xl md:text-5xl font-semibold text-left"
              style={{ color: "var(--foreground)" }}
            >
              New Arrivals
            </h2>
            <div
              className="h-1 w-24 mt-4 bg-black"
            ></div>
          </div>

          <HydrationBoundary state={dehydrate(queryClient)}>
            <ProductListClient />
          </HydrationBoundary>
        </div>
      </section>




      {/* BOTTOM CTA SECTION */}
      <section
        className="relative  h-[70vh] text-white text-right overflow-hidden bg-cover ">

        <div
          style={{ backgroundImage: "url('/images/homepage/weekend-wanderlust.png')" }}
          className="absolute inset-0 bg-cover bg-fixed">
          <div className="absolute inset-0 bg-linear-to-l
from-black via-transparent
to-transparent" />
        </div>

        <div className="grid grid-cols-2 md:px-28">
          <div className=""></div>
          <div className="px-4 relative z-10  top-1/4 ">
            <h6 className="uppercase tracking-[0.4em] text-xs font-bold mb-6 text-white/70">
              Explore
            </h6>
            <h2 className="font-heading text-4xl md:text-6xl font-bold mb-8 max-w-4xl  leading-tight">
              Elevate your wardrobe, embrace timeless style!
            </h2>
            <p className="text-lg text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
              Explore our collections today and experience the joy of fashion. Shop now for the epitome of chic sophistication!
            </p>
            <Link
              href="/products"
              className="inline-block border-2 border-white text-white px-12 py-4 font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300"
            >
              Shop Now
            </Link>
          </div>
        </div>

      </section>

      {/* SERVICES SECTION */}
      <section
        className="py-20 ">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              {
                title: "Secure Payments",
                desc: "Shop with confidence knowing that your transactions are safeguarded.",
                icon: <ShieldCheck className="w-8 h-8" strokeWidth={1.5} />
              },
              {
                title: "Free Shipping",
                desc: "Shopping with no extra charges – savor the liberty of complimentary shipping on every order.",
                icon: <Truck className="w-8 h-8" strokeWidth={1.5} />
              },
              {
                title: "Easy Returns",
                desc: "With our hassle-free Easy Returns, changing your mind has never been more convenient.",
                icon: <RefreshCcw className="w-8 h-8" strokeWidth={1.5} />
              },
              {
                title: "Order Tracking",
                desc: "Stay in the loop with our Order Tracking feature – from checkout to your doorstep.",
                icon: <Package className="w-8 h-8" strokeWidth={1.5} />
              }
            ].map((service, index) => (
              <div key={index} className="flex flex-col items-center text-center group">
                <div style={{ backgroundColor: "var(--foreground)", color: "var(--background)" }} className="mb-6 p-4 rounded-full  transition-all duration-300">
                  {service.icon}
                </div>
                <h4 className="font-heading text-xl font-bold mb-3 uppercase tracking-wider text-black">{service.title}</h4>
                <p className="text-black text-sm leading-relaxed max-w-xs">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL SECTION */}
      <section className="relative h-[90vh] text-white  overflow-hidden ">

        <div
          style={{ backgroundImage: "url('/images/homepage/urban-chic.png')" }}
          className="absolute inset-0 bg-cover bg-fixed">
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 px-4 max-w-4xl translate-y-1/3 text-center mx-auto">
          <div className="mb-10 text-6xl text-gray-300 font-serif">“</div>
          <h4 className=" text-2xl md:text-3xl font-medium leading-relaxed italic mb-10 text-gray-800 dark:text-gray-200">
            ”FemmeWardrobe is my fashion sanctuary! The curated collection effortlessly blends chic trends with timeless elegance, making every purchase a delightful discovery. The quality of their pieces is unmatched, and I appreciate the brand's commitment to sustainable fashion. What truly sets FemmeWardrobe apart is their customer-centric approach.”
          </h4>
          <div className="h-1 w-12 bg-black dark:bg-white mx-auto mb-6"></div>
          <h6 className="uppercase tracking-[0.2em] text-xs font-bold">
            Sarah M., Devoted FemmeWardrobe Fan
          </h6>
        </div>
      </section>





    </div >
  );
}
