import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { CATEGORIES } from '@/lib/constants'
import { formatPrice, discountPercent } from '@/lib/utils'

export const revalidate = 3600

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cat = CATEGORIES.find((c) => c.slug === slug)
  const name = cat?.name ?? slug
  return {
    title: `${name} in Bharuch | Best Price Guaranteed`,
    description: `Buy ${name} at best prices in Bharuch. Authorized dealer, genuine warranty. MK Refrigeration.`,
  }
}

async function getCategoryWithProducts(slug: string) {
  try {
    return await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { inStock: true },
          include: { brand: true },
          orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        },
      },
    })
  } catch {
    return null
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const category = await getCategoryWithProducts(slug)
  const fallback = CATEGORIES.find((c) => c.slug === slug)

  if (!category && !fallback) notFound()

  const name = category?.name ?? fallback?.name ?? slug
  const description = category?.description ?? fallback?.description ?? ''
  const icon = category?.icon ?? fallback?.icon ?? 'devices_other'
  const products = category?.products ?? []

  return (
    <div className="py-16 px-margin-desktop max-w-container-max mx-auto">
      <nav className="text-xs text-on-surface-variant mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <Link href="/categories" className="hover:text-primary transition-colors">Categories</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-on-surface font-semibold">{name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">{name}</h1>
          <p className="text-on-surface-variant text-sm mt-1">{description}</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 bg-surface-container-low rounded-2xl">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">inventory_2</span>
          <p className="font-bold text-on-surface mt-4">Products coming soon</p>
          <p className="text-on-surface-variant text-sm mt-1">Call us or WhatsApp for current availability and pricing.</p>
          <a
            href="tel:9898088292"
            className="inline-flex items-center gap-2 mt-6 bg-primary text-on-primary font-bold px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors"
          >
            <span className="material-symbols-outlined text-lg">call</span>
            Call Now
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => {
            const mrp = Number(p.mrp ?? 0)
            const price = Number(p.price)
            const discount = discountPercent(mrp, price)
            return (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group flex flex-col bg-white rounded-2xl border border-outline-variant/40 hover:border-primary/30 hover:shadow-xl transition-all duration-200 overflow-hidden"
              >
                <div className="relative aspect-[4/3] bg-surface-container-low flex items-center justify-center">
                  {p.images?.[0] ? (
                    <Image src={p.images[0]} alt={p.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-contain p-4 group-hover:scale-105 transition-transform" />
                  ) : (
                    <span className="material-symbols-outlined text-6xl text-primary/20" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {icon}
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="absolute top-3 left-3 bg-error text-on-error text-xs font-extrabold px-2.5 py-1 rounded-lg">
                      -{discount}%
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  {p.brand && <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70 mb-1">{p.brand.name}</span>}
                  <h2 className="font-bold text-sm text-on-surface line-clamp-2 mb-3 group-hover:text-primary transition-colors">{p.name}</h2>
                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      <p className="font-extrabold text-lg text-on-surface">{formatPrice(price)}</p>
                      {discount > 0 && <p className="text-xs text-on-surface-variant line-through">{formatPrice(mrp)}</p>}
                    </div>
                    <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
