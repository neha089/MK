import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { SHOP } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Brands We Carry | ${SHOP.name}`,
  description: `Authorized dealer of LG, Samsung, Whirlpool, Voltas, Daikin, Hitachi and more top brands at ${SHOP.name}, Bharuch, Gujarat.`,
}

export const revalidate = 3600

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: [{ featured: 'desc' }, { name: 'asc' }],
    include: { _count: { select: { products: true } } },
  }).catch(() => [])

  const featured = brands.filter((b) => b.featured)
  const regular = brands.filter((b) => !b.featured)

  return (
    <div className="py-12">
      <div className="px-margin-desktop max-w-container-max mx-auto">

        {/* Breadcrumb */}
        <nav className="text-xs text-on-surface-variant mb-6 flex items-center gap-1">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-semibold">Our Brands</span>
        </nav>

        <div className="mb-10">
          <span className="text-primary text-xs font-bold uppercase tracking-widest">Authorized Dealer</span>
          <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface mt-2">Brands We Carry</h1>
          <p className="text-on-surface-variant mt-2">
            We are an authorized dealer of India's most trusted home appliance brands.
            Every product is 100% genuine with manufacturer warranty.
          </p>
        </div>

        {/* Featured brands */}
        {featured.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">Featured Brands</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/products?brand=${brand.id}`}
                  className="group bg-white rounded-3xl border-2 border-primary/20 p-6 flex flex-col items-center text-center hover:border-primary hover:shadow-lg transition-all duration-300"
                >
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="h-12 object-contain mb-3 group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                      <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    </div>
                  )}
                  <p className="font-headline font-extrabold text-on-surface">{brand.name}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{brand._count.products} products</p>
                  <span className="mt-2 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Featured</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All brands */}
        {regular.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">
              {featured.length > 0 ? 'More Brands' : 'All Brands'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {regular.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/products?brand=${brand.id}`}
                  className="group bg-white rounded-2xl border border-outline-variant/40 p-5 flex flex-col items-center text-center hover:border-primary/40 hover:shadow-md transition-all duration-300"
                >
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="h-10 object-contain mb-2 group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
                      <span className="material-symbols-outlined text-xl text-on-surface-variant group-hover:text-primary transition-colors">verified</span>
                    </div>
                  )}
                  <p className="font-bold text-on-surface text-sm">{brand.name}</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">{brand._count.products} products</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {brands.length === 0 && (
          <div className="bg-white rounded-3xl border border-outline-variant/40 p-16 text-center">
            <p className="text-on-surface-variant">No brand information available yet.</p>
          </div>
        )}

        {/* Why genuine banner */}
        <div className="mt-12 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl border border-primary/20 p-8">
          <h2 className="font-headline text-2xl font-extrabold text-on-surface mb-4">Why Buy from Authorized Dealers?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: 'verified', title: '100% Genuine Products', desc: 'Every product is original and sourced directly from the manufacturer.' },
              { icon: 'warranty', title: 'Full Manufacturer Warranty', desc: "Valid warranty from the brand — no grey market or import stock." },
              { icon: 'support_agent', title: 'After-Sales Support', desc: 'Our team assists with installation and any service needs.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface text-sm">{item.title}</p>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
