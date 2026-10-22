import { BRANDS } from '@/lib/constants'

export default function BrandsSection() {
  return (
    <section id="brands" className="py-16 bg-surface-container-low border-t border-outline-variant/40">
      <div className="px-margin-desktop max-w-container-max mx-auto">
        <div className="text-center mb-10">
          <span className="text-primary text-xs font-bold uppercase tracking-widest">Our Brand Partners</span>
          <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-on-surface mt-2">
            Authorized Dealer for 12+ Brands
          </h2>
          <p className="text-on-surface-variant text-sm mt-2">
            Every brand we sell is official — genuine products, manufacturer warranty, factory support.
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {BRANDS.map((brand) => (
            <div
              key={brand}
              className="group flex items-center justify-center h-16 bg-white rounded-xl border border-outline-variant/40 hover:border-primary/30 hover:shadow-md transition-all duration-200 px-4"
            >
              <span className="font-extrabold text-sm text-on-surface-variant group-hover:text-primary transition-colors tracking-wide">
                {brand}
              </span>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-on-surface-variant mt-8">
          Don't see your preferred brand? <span className="text-primary font-bold">Call us</span> — we can source it for you.
        </p>
      </div>
    </section>
  )
}
