import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { SHOP } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Offers & Promotions | ${SHOP.name}`,
  description: `Latest deals, discounts, and promotional offers on AC, Refrigerator, Washing Machine and home appliances at ${SHOP.name}, Bharuch.`,
}

export const dynamic = 'force-dynamic'

export default async function OffersPage() {
  const now = new Date()

  const [activeOffers, upcomingOffers] = await Promise.all([
    prisma.offer.findMany({
      where: {
        active: true,
        OR: [
          { validUntil: null },
          { validUntil: { gte: now } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.offer.findMany({
      where: {
        active: true,
        validFrom: { gt: now },
      },
      orderBy: { validFrom: 'asc' },
      take: 4,
    }),
  ]).catch(() => [[], []] as [never[], never[]])

  return (
    <div className="py-12">
      <div className="px-margin-desktop max-w-container-max mx-auto">

        {/* Breadcrumb */}
        <nav className="text-xs text-on-surface-variant mb-6 flex items-center gap-1">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-semibold">Offers & Sale</span>
        </nav>

        <div className="mb-10">
          <span className="text-primary text-xs font-bold uppercase tracking-widest">Special Deals</span>
          <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface mt-2">
            Current Offers & Promotions
          </h1>
          <p className="text-on-surface-variant mt-2">Exclusive deals on premium home appliances. Limited time only.</p>
        </div>

        {(activeOffers as { id: string; title: string; description: string | null; discount: number | null; validFrom: Date | null; validUntil: Date | null }[]).length === 0 ? (
          <div className="bg-white rounded-3xl border border-outline-variant/40 p-16 text-center">
            <span className="material-symbols-outlined text-5xl text-primary mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>local_offer</span>
            <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">No Active Offers Right Now</h2>
            <p className="text-on-surface-variant mb-6">Check back soon — great deals are always around the corner!</p>
            <Link href="/products" className="btn-primary inline-flex">Browse All Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeOffers as { id: string; title: string; description: string | null; discount: number | null; validFrom: Date | null; validUntil: Date | null }[]).map((offer) => {
              const isExpiringSoon = offer.validUntil &&
                (new Date(offer.validUntil).getTime() - now.getTime()) < 3 * 24 * 60 * 60 * 1000

              return (
                <div key={offer.id} className="relative bg-white rounded-3xl border border-outline-variant/40 overflow-hidden group hover:shadow-lg transition-all duration-300">
                  {/* Discount badge */}
                  {offer.discount != null && (
                    <div className="absolute top-4 right-4 w-16 h-16 bg-primary rounded-full flex flex-col items-center justify-center text-on-primary shadow-lg">
                      <span className="text-xl font-extrabold leading-none">{offer.discount}%</span>
                      <span className="text-[9px] font-bold uppercase tracking-wide">OFF</span>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>local_offer</span>
                      </div>
                      <div className="flex-1 min-w-0 pr-16">
                        <h2 className="font-headline font-extrabold text-on-surface text-lg leading-tight">{offer.title}</h2>
                      </div>
                    </div>

                    {offer.description && (
                      <p className="text-on-surface-variant text-sm leading-relaxed mb-4">{offer.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      {offer.validFrom && (
                        <span className="text-xs bg-surface-container text-on-surface-variant px-2.5 py-1 rounded-full">
                          From {new Date(offer.validFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                      {offer.validUntil && (
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${isExpiringSoon ? 'bg-error/10 text-error' : 'bg-surface-container text-on-surface-variant'}`}>
                          Until {new Date(offer.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {isExpiringSoon && ' ⚡'}
                        </span>
                      )}
                      {!offer.validFrom && !offer.validUntil && (
                        <span className="text-xs bg-success/10 text-success px-2.5 py-1 rounded-full font-semibold">Limited Time</span>
                      )}
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <Link
                      href={`/products?offer=${offer.id}`}
                      className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary text-primary hover:text-on-primary font-bold py-3 rounded-xl transition-all text-sm"
                    >
                      <span className="material-symbols-outlined text-base">shopping_bag</span>
                      Shop This Offer
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* WhatsApp CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl border border-primary/20 p-8 text-center">
          <h2 className="font-headline text-2xl font-extrabold text-on-surface mb-2">Want a Custom Deal?</h2>
          <p className="text-on-surface-variant mb-6">Contact us directly for bulk orders, special pricing, or exclusive offers.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={`https://wa.me/${SHOP.whatsapp}?text=Hi! I'd like to know about your current offers.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex"
            >
              <span className="material-symbols-outlined text-xl">chat</span>
              WhatsApp Us
            </a>
            <Link href="/contact" className="flex items-center gap-2 border border-outline-variant/60 text-on-surface-variant font-bold px-5 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-sm">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
