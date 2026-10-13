import type { Metadata } from 'next'
import Link from 'next/link'
import { SHOP, BRANDS, CATEGORIES } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'About MK Refrigeration | AC & Appliance Dealer Bharuch',
  description: 'Learn about MK Refrigeration — your trusted authorized electronics dealer in Bharuch, Gujarat. AC, Refrigerator, Washing Machine, Deep Freezer dealer.',
}

export default function AboutPage() {
  return (
    <div className="py-16">
      {/* Hero */}
      <div className="px-margin-desktop max-w-container-max mx-auto mb-16">
        <nav className="text-xs text-on-surface-variant mb-6 flex items-center gap-1">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-semibold">About Us</span>
        </nav>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-primary text-xs font-bold uppercase tracking-widest">About Us</span>
            <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface mt-2 mb-4">
              Bharuch's Most Trusted Electronics Dealer
            </h1>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              MK Refrigeration is an authorized dealer of premium home appliances and electronics in Bharuch, Gujarat.
              We stock a wide range of ACs, Refrigerators, Washing Machines, Deep Freezers, Air Coolers, and Home Appliances from India's top brands.
            </p>
            <p className="text-on-surface-variant leading-relaxed mb-6">
              Our mission is simple: provide genuine products at honest prices, backed by expert service and installation.
              Every product we sell comes with the manufacturer's warranty and our personal commitment to your satisfaction.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={`tel:${SHOP.phone}`} className="flex items-center gap-2 bg-primary text-on-primary font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-primary-dark transition-colors">
                <span className="material-symbols-outlined text-lg">call</span>
                Call Us
              </a>
              <Link href="/contact" className="flex items-center gap-2 border-2 border-primary/30 text-primary font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-primary/10 transition-colors">
                Get Directions
                <span className="material-symbols-outlined text-lg">map</span>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: '12+', label: 'Brands Available', icon: 'verified' },
              { num: '6', label: 'Product Categories', icon: 'category' },
              { num: '1000+', label: 'Happy Customers', icon: 'people' },
              { num: '100%', label: 'Genuine Products', icon: 'workspace_premium' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-outline-variant/40 p-6 text-center">
                <span className="material-symbols-outlined text-3xl text-primary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {s.icon}
                </span>
                <p className="font-headline text-3xl font-extrabold text-on-surface">{s.num}</p>
                <p className="text-xs text-on-surface-variant mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Brands */}
      <div className="bg-surface-container-low py-12">
        <div className="px-margin-desktop max-w-container-max mx-auto">
          <h2 className="font-headline text-xl font-extrabold text-on-surface mb-6 text-center">Brands We Carry</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {BRANDS.map((b) => (
              <span key={b} className="bg-white border border-outline-variant/40 px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="py-12 px-margin-desktop max-w-container-max mx-auto">
        <h2 className="font-headline text-xl font-extrabold text-on-surface mb-6 text-center">What We Sell</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group flex flex-col items-center gap-2 p-5 bg-white rounded-2xl border border-outline-variant/40 hover:border-primary/40 hover:shadow-md transition-all"
            >
              <span className="material-symbols-outlined text-3xl text-primary group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
                {cat.icon}
              </span>
              <span className="text-xs font-bold text-on-surface text-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
