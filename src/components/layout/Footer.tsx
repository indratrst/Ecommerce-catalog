import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t border-white/10" style={{ backgroundColor: "var(--foreground)", color: "var(--background)" }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand/Newsletter */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-black tracking-tighter uppercase mb-6 border-b-2 inline-block pb-1" style={{ borderColor: "var(--background)" }}>Ecommerce</h3>
            <p className="opacity-80 text-sm mb-6 leading-relaxed">
              Join our newsletter for updates on new drops, special offers, and events.
            </p>
            <form className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                className="bg-transparent border px-4 py-3 text-sm focus:outline-none transition-colors"
                style={{ borderColor: "var(--background)/30", color: "var(--background)" }}
              />
              <button
                type="submit"
                className="font-bold text-sm tracking-widest uppercase px-4 py-3 transition-colors hover:opacity-80"
                style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-bold tracking-widest uppercase mb-6 text-sm">Shop</h4>
            <ul className="flex flex-col gap-4 text-sm opacity-80">
              <li><Link href="/#new-arrivals" className="hover:opacity-100 transition-opacity">New Arrivals</Link></li>
              <li><Link href="/#categories" className="hover:opacity-100 transition-opacity">Clothing</Link></li>
              <li><Link href="/#categories" className="hover:opacity-100 transition-opacity">Accessories</Link></li>
              <li><Link href="/#categories" className="hover:opacity-100 transition-opacity">Special Edition</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-bold tracking-widest uppercase mb-6 text-sm">Info</h4>
            <ul className="flex flex-col gap-4 text-sm opacity-80">
              <li><Link href="#" className="hover:opacity-100 transition-opacity">About Us</Link></li>
              <li><Link href="#" className="hover:opacity-100 transition-opacity">How to Order</Link></li>
              <li><Link href="#" className="hover:opacity-100 transition-opacity">Shipping & Returns</Link></li>
              <li><Link href="#" className="hover:opacity-100 transition-opacity">Size Guide</Link></li>
              <li><Link href="#" className="hover:opacity-100 transition-opacity">FAQ</Link></li>
            </ul>
          </div>

          {/* Social / Contact */}
          <div>
            <h4 className="font-bold tracking-widest uppercase mb-6 text-sm">Connect</h4>
            <ul className="flex flex-col gap-4 text-sm opacity-80">
              <li><a href="#" className="hover:opacity-100 transition-opacity">Instagram</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Twitter</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Facebook</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Spotify</a></li>
            </ul>
            <div className="mt-8 text-sm opacity-80">
              <p>Email: info@example.com</p>
              <p className="mt-2">WhatsApp: +62 812 3456 7890</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-60" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <p>&copy; {new Date().getFullYear()} ECOMMERCE CATALOG. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:opacity-100 transition-opacity">PRIVACY POLICY</Link>
            <Link href="#" className="hover:opacity-100 transition-opacity">TERMS OF SERVICE</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
