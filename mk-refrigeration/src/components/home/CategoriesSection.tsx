import Link from 'next/link'
import { CATEGORIES } from '@/lib/constants'

type Category = {
  id: string
  name: string
  slug: string
  icon?: string | null
  description?: string | null
  _count?: { products: number }
}

type Props = { categories: Category[] }

const FALLBACK = CATEGORIES

export default function CategoriesSection({ categories }: Props) {
  const items = categories.length > 0
    ? categories.map((c) => ({
        name: c.name,
        slug: c.slug,
        icon: c.icon ?? 'devices_other',
        description: c.description ?? '',
        count: c._count?.products ?? 0,
      }))
    : FALLBACK.map((c) => ({ ...c, count: 0 }))

  return (
    <section id="categories" className="py-20 bg-surface-container-low">
      <div className="px-margin-desktop max-w-container-max mx-auto">
        <div className="text-center mb-12">
          <span className="text-primary text-xs font-bold uppercase tracking-widest">Browse by Type</span>
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface mt-2">
            All Categories
          </h2>
          <p className="text-on-surface-variant text-sm mt-3 max-w-md mx-auto">
            From inverter ACs to deep freezers — find exactly what you need for your home or business.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {items.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-outline-variant/40 hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <span
                  className="material-symbols-outlined text-3xl text-primary group-hover:text-on-primary transition-colors"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {cat.icon}
                </span>
              </div>
              <div className="text-center">
                <p className="font-bold text-sm text-on-surface leading-tight">{cat.name}</p>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-tight">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
