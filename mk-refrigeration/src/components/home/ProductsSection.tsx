import Link from 'next/link'
import { formatPrice, discountPercent } from '@/lib/utils'

type Product = {
  id: string
  name: string
  slug: string
  mrp: number | { toNumber(): number } | null
  price: number | { toNumber(): number }
  imageUrl?: string | null
  brand?: { name: string } | null
  category?: { name: string } | null
  featured: boolean
  inStock: boolean
}

type Props = { products: Product[] }

function ProductCard({ product }: { product: Product }) {
  const toNum = (v: number | { toNumber(): number } | null | undefined) =>
    v == null ? 0 : typeof v === 'number' ? v : v.toNumber()
  const discount = discountPercent(toNum(product.mrp), toNum(product.price))

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-outline-variant/40 hover:border-primary/30 hover:shadow-xl transition-all duration-200 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-surface-container-low flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="object-contain w-full h-full p-4 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="material-symbols-outlined text-7xl text-primary/20" style={{ fontVariationSettings: "'FILL' 1" }}>
            devices_other
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-error text-on-error text-xs font-extrabold px-2.5 py-1 rounded-lg">
            -{discount}%
          </span>
        )}
        {product.featured && (
          <span className="absolute top-3 right-3 bg-primary text-on-primary text-[10px] font-bold px-2 py-1 rounded-lg">
            Featured
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {product.brand && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70 mb-1">
            {product.brand.name}
          </span>
        )}
        <h3 className="font-bold text-sm text-on-surface leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        {product.category && (
          <span className="text-xs text-on-surface-variant mb-3">{product.category.name}</span>
        )}
        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <p className="font-extrabold text-lg text-on-surface leading-none">
              {formatPrice(toNum(product.price))}
            </p>
            {discount > 0 && (
              <p className="text-xs text-on-surface-variant line-through mt-0.5">
                {formatPrice(toNum(product.mrp))}
              </p>
            )}
          </div>
          <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-xl group-hover:bg-primary group-hover:text-on-primary transition-colors">
            View
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function ProductsSection({ products }: Props) {
  if (products.length === 0) return null

  return (
    <section id="products" className="py-20 bg-surface">
      <div className="px-margin-desktop max-w-container-max mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-primary text-xs font-bold uppercase tracking-widest">Best Sellers</span>
            <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface mt-2">
              Featured Products
            </h2>
            <p className="text-on-surface-variant text-sm mt-2">
              Handpicked appliances at unbeatable prices.
            </p>
          </div>
          <Link
            href="/categories"
            className="hidden md:flex items-center gap-2 text-primary font-bold text-sm hover:underline"
          >
            View All
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 border-2 border-primary/30 text-primary px-8 py-3 rounded-xl font-bold text-sm hover:bg-primary/10 transition-colors"
          >
            View All Products
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
