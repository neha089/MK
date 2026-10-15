import Link from 'next/link'
import { SHOP } from '@/lib/constants'

type DbOffer = {
  id: string
  title: string
  description: string | null
  discount: number | null
  type: string
  validUntil: Date | null
}

const GRADIENTS = [
  'from-blue-600 to-indigo-700',
  'from-emerald-600 to-teal-700',
  'from-violet-600 to-purple-700',
  'from-orange-500 to-red-600',
  'from-pink-600 to-rose-700',
  'from-cyan-600 to-sky-700',
]

const STATIC_OFFERS = [
  {
    tag: 'Exchange Offer',
    title: 'Old for New Scheme',
    desc: 'Bring your old appliance and get exchange bonus on Refrigerators & Washing Machines.',
    cta: 'Know More',
    href: `https://wa.me/${SHOP.whatsapp}?text=I want to know about the exchange offer`,
    icon: 'swap_horiz',
    gradient: 'from-emerald-600 to-teal-700',
  },
  {
    tag: 'EMI Available',
    title: 'Easy EMI — 0% Interest',
    desc: 'No-cost EMI on all products above ₹15,000. Available on all major bank cards and finance options.',
    cta: 'View Products',
    href: '/categories',
    icon: 'payments',
    gradient: 'from-violet-600 to-purple-700',
  },
]

function daysLeft(validUntil: Date) {
  const diff = validUntil.getTime() - Date.now()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days <= 0) return null
  if (days === 1) return 'Ends today'
  if (days <= 7) return `${days} days left`
  return null
}

function OfferTag({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider self-start">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      {text}
    </span>
  )
}

export default function OffersSection({ offers = [] }: { offers?: DbOffer[] }) {
  const hasDbOffers = offers.length > 0

  return (
    <section id="offers" className="py-20 bg-surface-container-low">
      <div className="px-margin-desktop max-w-container-max mx-auto">
        <div className="text-center mb-12">
          <span className="text-primary text-xs font-bold uppercase tracking-widest">Deals & Discounts</span>
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface mt-2">
            Current Offers
          </h2>
          <p className="text-on-surface-variant text-sm mt-3 max-w-md mx-auto">
            Best prices in Bharuch — genuine products with manufacturer warranty.
          </p>
        </div>

        {/* DB offers (dynamic) */}
        {hasDbOffers && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {offers.map((offer, i) => {
              const gradient = GRADIENTS[i % GRADIENTS.length]
              const expiry = offer.validUntil ? daysLeft(offer.validUntil) : null
              const discountLabel = offer.discount
                ? offer.type === 'FLAT'
                  ? `Flat ₹${offer.discount} off`
                  : `${offer.discount}% off`
                : null
              return (
                <div
                  key={offer.id}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-7 flex flex-col gap-4 text-white`}
                >
                  <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 translate-x-16 -translate-y-16" />
                  <OfferTag text={expiry ?? discountLabel ?? 'Special Offer'} />
                  <span
                    className="material-symbols-outlined text-5xl opacity-90 self-start"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    local_offer
                  </span>
                  <div>
                    <h3 className="font-headline text-xl font-extrabold leading-tight mb-2">{offer.title}</h3>
                    {offer.description && (
                      <p className="text-white/80 text-sm leading-relaxed">{offer.description}</p>
                    )}
                    {discountLabel && !offer.description && (
                      <p className="text-white/80 text-sm">{discountLabel}</p>
                    )}
                  </div>
                  <a
                    href={`https://wa.me/${SHOP.whatsapp}?text=I am interested in the offer: ${encodeURIComponent(offer.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors self-start"
                  >
                    Enquire Now
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </a>
                </div>
              )
            })}
          </div>
        )}

        {/* Static fallback offers (always show if no DB offers, or show alongside) */}
        {!hasDbOffers && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-7 flex flex-col gap-4 text-white">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 translate-x-16 -translate-y-16" />
              <OfferTag text="Limited Time" />
              <span className="material-symbols-outlined text-5xl opacity-90 self-start" style={{ fontVariationSettings: "'FILL' 1" }}>ac_unit</span>
              <div>
                <h3 className="font-headline text-xl font-extrabold leading-tight mb-2">Summer AC Mega Sale</h3>
                <p className="text-white/80 text-sm leading-relaxed">Up to 40% off on all split and window ACs. Inverter models, 5-star BEE rating, free installation.</p>
              </div>
              <Link href="/categories/ac" className="mt-auto inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors self-start">
                Shop ACs <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
            {STATIC_OFFERS.map((offer) => (
              <div key={offer.title} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${offer.gradient} p-7 flex flex-col gap-4 text-white`}>
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 translate-x-16 -translate-y-16" />
                <OfferTag text={offer.tag} />
                <span className="material-symbols-outlined text-5xl opacity-90 self-start" style={{ fontVariationSettings: "'FILL' 1" }}>{offer.icon}</span>
                <div>
                  <h3 className="font-headline text-xl font-extrabold leading-tight mb-2">{offer.title}</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{offer.desc}</p>
                </div>
                <Link href={offer.href} className="mt-auto inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors self-start">
                  {offer.cta} <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* CTA banner */}
        <div className="mt-8 bg-primary rounded-2xl px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-on-primary">
            <p className="font-headline text-xl font-extrabold">Need a custom quote for bulk purchase?</p>
            <p className="text-on-primary/80 text-sm mt-1">Call us or WhatsApp — we respond within minutes.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`tel:${SHOP.phone}`}
              className="flex items-center gap-2 bg-white text-primary font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-on-primary/90 transition-colors shadow"
            >
              <span className="material-symbols-outlined text-lg">call</span>
              Call Now
            </a>
            <a
              href={`https://wa.me/${SHOP.whatsapp}?text=I need a bulk purchase quote`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#1db954] transition-colors shadow"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
