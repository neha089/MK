import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { SHOP } from '@/lib/constants'
import { formatPrice, discountPercent } from '@/lib/utils'

export const revalidate = 3600

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const brand = await prisma.brand.findUnique({ where: { slug } })
    if (!brand) return { title: 'Brand Not Found' }
    return {
      title: `${brand.name} Products in Bharuch | ${SHOP.name}`,
      description: `Buy genuine ${brand.name} products at best price in Bharuch. Authorized dealer, manufacturer warranty. ${SHOP.name}.`,
    }
  } catch {
    return { title: 'Brand' }
  }
}

export default async function BrandDetailPage({ params }: Props) {
  const { slug } = await params

  const brand = await prisma.brand.findUnique({
    where: { slug },
    include: {
      products: {
        where: { inStock: true },
        include: { category: true },
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      },
      _count: { select: { products: true } },
    },
  }).catch(() => null)

  if (!brand) notFound()

  return (
    <div className="py-12">
      <div className="px-margin-desktop max-w-container-max mx-auto">
        {/* Breadcrumb */}
        <nav className="text-xs text-on-surface-variant mb-6 flex items-center gap-1">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <Link href="/brands" className="hover:text-primary transition-colors">Brands</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-semibold">{brand.name}</span>
        </nav>

        {/* Brand header */}
        <div className="flex items-center gap-6 mb-10">
          {brand.logo ? (
            <img src={brand.logo} alt={brand.name} className="h-16 object-contain" />
          ) : (
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
          )}
          <div>
            {brand.featured && (
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 uppercase tracking-wider">Featured Brand</span>
            )}
            <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface mt-1">{brand.name}</h1>
            <p className="text-on-surface-variant text-sm mt-1">
              {brand._count.products} products · {brand.products.length} in stock
            </p>
          </div>
        </div>

        {/* Products grid */}
        {brand.products.length === 0 ? (
          <div className="bg-white rounded-3xl border border-outline-variant/40 p-16 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 block mb-3">inventory_2</span>
            <p className="font-bold text-on-surface">No products in stock right now</p>
            <p className="text-sm text-on-surface-variant mt-1">Check back soon or contact us for availability</p>
            <Link href="/contact" className="mt-4 inline-block text-sm text-primary font-bold hover:underline">Contact Us</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {brand.products.map((p) => {
              const disc = p.mrp ? discountPercent(Number(p.mrp), Number(p.price)) : p.discount
              return (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="group bg-white rounded-2xl border border-outline-variant/40 hover:border-primary/40 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                >
                  <div className="aspect-square bg-surface-container flex items-center justify-center relative overflow-hidden">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <span className="material-symbols-outlined text-5xl text-on-surface-variant/30" style={{ fontVariationSettings: "'FILL' 1" }}>ac_unit</span>
                    )}
                    {disc && disc > 0 && (
                      <span className="absolute top-2 right-2 bg-error text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg">−{disc}%</span>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <p className="text-[10px] text-on-surface-variant">{p.category.name}</p>
                    <p className="font-bold text-on-surface text-sm leading-tight mt-0.5 line-clamp-2 flex-1">{p.name}</p>
                    {p.model && <p className="text-[10px] text-on-surface-variant mt-1">{p.model}</p>}
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="font-extrabold text-primary text-base">{formatPrice(Number(p.price))}</span>
                      {p.mrp && Number(p.mrp) > Number(p.price) && (
                        <span className="text-[10px] text-on-surface-variant line-through">{formatPrice(Number(p.mrp))}</span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl border border-primary/20 p-8 flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div>
            <p className="font-headline text-xl font-extrabold text-on-surface">Looking for a specific {brand.name} model?</p>
            <p className="text-sm text-on-surface-variant mt-1">Call us or send an enquiry — we can source any model for you.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <a href={`tel:${SHOP.phone}`} className="flex items-center gap-2 bg-primary text-on-primary font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
              Call Now
            </a>
            <Link href="/contact" className="flex items-center gap-2 border border-outline-variant/60 text-on-surface font-bold px-5 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-sm">
              Enquire
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
