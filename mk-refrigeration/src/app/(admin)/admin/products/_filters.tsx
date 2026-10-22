'use client'

type Option = { id: string; name: string }

type Props = {
  categories: Option[]
  brands: Option[]
  category?: string
  brand?: string
  stock?: string
  q?: string
}

function buildUrl(base: Record<string, string | undefined>, overrides: Record<string, string | undefined>) {
  const params = new URLSearchParams()
  const merged = { ...base, ...overrides }
  Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v) })
  const s = params.toString()
  return `/admin/products${s ? `?${s}` : ''}`
}

export default function ProductFilters({ categories, brands, category, brand, stock, q }: Props) {
  const base = { category, brand, stock, q }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Search */}
      <form method="GET" action="/admin/products" className="flex items-center gap-2">
        {category && <input type="hidden" name="category" value={category} />}
        {brand && <input type="hidden" name="brand" value={brand} />}
        {stock && <input type="hidden" name="stock" value={stock} />}
        <div className="relative">
          <span className="material-symbols-outlined text-sm absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">search</span>
          <input
            type="search"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Name, model, barcode..."
            className="border border-outline-variant/60 rounded-xl pl-8 pr-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 w-48"
          />
        </div>
      </form>

      {/* Category */}
      <select
        value={category ?? ''}
        onChange={(e) => { window.location.href = buildUrl(base, { category: e.target.value || undefined }) }}
        className="border border-outline-variant/60 rounded-xl px-3 py-2 text-sm bg-white text-on-surface-variant cursor-pointer"
      >
        <option value="">All Categories</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {/* Brand */}
      <select
        value={brand ?? ''}
        onChange={(e) => { window.location.href = buildUrl(base, { brand: e.target.value || undefined }) }}
        className="border border-outline-variant/60 rounded-xl px-3 py-2 text-sm bg-white text-on-surface-variant cursor-pointer"
      >
        <option value="">All Brands</option>
        {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>

      {/* Stock chips */}
      <div className="flex gap-1">
        {([['', 'All'], ['in', 'In Stock'], ['out', 'Out of Stock']] as [string, string][]).map(([val, label]) => (
          <a
            key={val}
            href={buildUrl(base, { stock: val || undefined })}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${(stock ?? '') === val ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/60 text-on-surface-variant hover:bg-surface-container'}`}
          >
            {label}
          </a>
        ))}
      </div>

      {/* Clear */}
      {[category, brand, stock, q].some(Boolean) && (
        <a href="/admin/products" className="text-xs text-error font-bold hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">close</span>
          Clear
        </a>
      )}
    </div>
  )
}
