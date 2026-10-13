import Link from 'next/link'
import { SHOP, CATEGORIES } from '@/lib/constants'

export default function Footer() {
  return (
    <footer className="w-full bg-inverse-surface text-white pt-20 pb-8">
      <div className="px-margin-desktop max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-md">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  ac_unit
                </span>
              </div>
              <div>
                <span className="font-headline text-xl font-extrabold tracking-tight block">
                  MK Refrigeration
                </span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                  Bharuch, Gujarat
                </span>
              </div>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
              Your trusted electronics partner in Bharuch. Authorized dealer for AC,
              Refrigerator, Washing Machine, Deep Freezer, Cooler & Home Appliances since years.
            </p>
            <div className="flex gap-4">
              <a
                href={`tel:${SHOP.phone}`}
                className="flex items-center gap-2 text-xs text-gray-300 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-base text-primary">call</span>
                {SHOP.phone}
              </a>
            </div>
            <a
              href={`https://wa.me/${SHOP.whatsapp}?text=Hello, I need help with electronics.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#25D366]/20 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#25D366]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h5 className="font-bold text-sm uppercase tracking-wider text-primary">Quick Links</h5>
            <ul className="space-y-3.5 text-xs text-gray-400">
              {[
                { label: 'About Our Store', href: '/about' },
                { label: 'All Products', href: '/categories' },
                { label: 'Current Offers', href: '/#offers' },
                { label: 'Our Brands', href: '/#brands' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'Admin Portal', href: '/admin/login' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            <h5 className="font-bold text-sm uppercase tracking-wider text-primary">Categories</h5>
            <ul className="space-y-3.5 text-xs text-gray-400">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/categories/${cat.slug}`} className="hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h5 className="font-bold text-sm uppercase tracking-wider text-primary">Visit Us</h5>
            <address className="not-italic text-xs text-gray-400 leading-relaxed space-y-3">
              <p className="flex items-start gap-2">
                <span className="material-symbols-outlined text-base text-primary mt-0.5">location_on</span>
                <span>Bharuch, Gujarat, India — 392001</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="material-symbols-outlined text-base text-primary mt-0.5">call</span>
                <a href={`tel:${SHOP.phone}`} className="hover:text-white transition-colors">
                  +91 {SHOP.phone}
                </a>
              </p>
              <p className="flex items-start gap-2">
                <span className="material-symbols-outlined text-base text-primary mt-0.5">mail</span>
                <a href={`mailto:${SHOP.email}`} className="hover:text-white transition-colors break-all">
                  {SHOP.email}
                </a>
              </p>
              <p className="flex items-start gap-2">
                <span className="material-symbols-outlined text-base text-primary mt-0.5">schedule</span>
                <span>Mon–Sat: 10am – 8pm</span>
              </p>
            </address>
            <a
              href={SHOP.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors"
            >
              <span className="material-symbols-outlined text-base">map</span>
              Get Directions
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            © 2025 MK Refrigeration, Bharuch. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Warranty Policy', href: '/warranty' },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="text-gray-500 hover:text-white text-xs transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
