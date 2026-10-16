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
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { brand: true, category: true },
    })
    if (!product) return { title: 'Product Not Found' }
    const description = product.description ?? `Buy ${product.name} at best price in Bharuch. ${product.brand?.name ?? ''} authorized dealer.`
    return {
      title: `${product.name} | MK Refrigeration Bharuch`,
      description,
      openGraph: {
        title: `${product.name} | MK Refrigeration`,
        description,
        type: 'website',
        images: product.images?.[0] ? [{ url: product.images[0], alt: product.name }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} | MK Refrigeration`,
        description,
        images: product.images?.[0] ? [product.images[0]] : [],
      },
    }
  } catch {
    return { title: 'Product' }
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  let product = null
  try {
    product = await prisma.product.findUnique({
      where: { slug },
      include: { brand: true, category: true },
    })
  } catch {}

  if (!product) notFound()

  const price = Number(product.price)
  const mrp = Number(product.mrp ?? 0)
  const discount = discountPercent(mrp, price)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? `${product.name} available at MK Refrigeration, Bharuch.`,
    brand: { '@type': 'Brand', name: product.brand?.name ?? 'Unknown' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: Number(product.price),
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'MK Refrigeration' },
    },
  }

  // Escape </> to prevent early tag termination in JSON-LD
  const jsonLdString = JSON.stringify(jsonLd)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString }} />
    <div className="py-16 px-margin-desktop max-w-container-max mx-auto">
      <nav className="text-xs text-on-surface-variant mb-6 flex items-center gap-1 flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <Link href="/categories" className="hover:text-primary transition-colors">Categories</Link>
        {product.category && (
          <>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <Link href={`/categories/${product.category.slug}`} className="hover:text-primary transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-on-surface font-semibold line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Image */}
        <div className="bg-white rounded-3xl border border-outline-variant/40 p-8 flex items-center justify-center aspect-square">
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images?.[0]} alt={product.name} className="object-contain max-h-80 w-full" />
          ) : (
            <span className="material-symbols-outlined text-[120px] text-primary/20" style={{ fontVariationSettings: "'FILL' 1" }}>
              devices_other
            </span>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {product.brand && (
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              {product.brand.name} — Authorized Dealer
            </span>
          )}

          <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-on-surface leading-tight">
            {product.name}
          </h1>

          {product.model && (
            <p className="text-xs text-on-surface-variant">Model: <span className="font-mono font-bold">{product.model}</span></p>
          )}

          {/* Pricing */}
          <div className="flex items-end gap-4">
            <p className="font-headline text-4xl font-extrabold text-on-surface">{formatPrice(price)}</p>
            {discount > 0 && (
              <>
                <p className="text-lg text-on-surface-variant line-through">{formatPrice(mrp)}</p>
                <span className="bg-error text-on-error text-sm font-extrabold px-3 py-1 rounded-xl">
                  -{discount}% OFF
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className="text-on-surface-variant text-sm leading-relaxed">{product.description}</p>
          )}

          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl ${product.inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-error/10 text-error'}`}>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                {product.inStock ? 'check_circle' : 'cancel'}
              </span>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`https://wa.me/${SHOP.whatsapp}?text=Hi, I'm interested in: ${product.name} (${product.model ?? ''}) — Price: ${formatPrice(price)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3.5 rounded-xl hover:bg-[#1db954] transition-colors shadow-lg"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Enquire on WhatsApp
            </a>
            <a
              href={`tel:${SHOP.phone}`}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-on-primary font-bold py-3.5 rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-xl">call</span>
              Call {SHOP.phone}
            </a>
          </div>

          {/* Share */}
          <div className="flex items-center gap-3 pt-2 border-t border-outline-variant/20">
            <span className="text-xs text-on-surface-variant">Share:</span>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out ${product.name} at MK Refrigeration, Bharuch — ${formatPrice(price)}\nhttps://mkrefrigeration.com/products/${product.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold text-[#25D366] hover:underline"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#25D366]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          </div>

          <p className="text-xs text-on-surface-variant">
            Free delivery in Bharuch. Expert installation available. Manufacturer warranty included.
          </p>
        </div>
      </div>
    </div>
    </>
  )
}
