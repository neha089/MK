import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import ProductForm from '@/components/admin/ProductForm'
import { createProduct } from '@/actions/products'

export const metadata: Metadata = { title: 'Add Product' }
export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: 'asc' } }).catch(() => []),
    prisma.category.findMany({ orderBy: { order: 'asc' } }).catch(() => []),
  ])

  return (
    <div className="space-y-6">
      <div>
        <nav className="text-xs text-on-surface-variant mb-3 flex items-center gap-1">
          <a href="/admin/products" className="hover:text-primary transition-colors">Products</a>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-semibold">New Product</span>
        </nav>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Add New Product</h1>
      </div>
      <ProductForm brands={brands} categories={categories} action={createProduct} />
    </div>
  )
}
