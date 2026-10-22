import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import ProductForm from '@/components/admin/ProductForm'
import { updateProduct } from '@/actions/products'

export const metadata: Metadata = { title: 'Edit Product' }
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const [product, brands, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }).catch(() => null),
    prisma.brand.findMany({ orderBy: { name: 'asc' } }).catch(() => []),
    prisma.category.findMany({ orderBy: { order: 'asc' } }).catch(() => []),
  ])

  if (!product) notFound()

  const action = updateProduct.bind(null, id)

  return (
    <div className="space-y-6">
      <div>
        <nav className="text-xs text-on-surface-variant mb-3 flex items-center gap-1">
          <a href="/admin/products" className="hover:text-primary transition-colors">Products</a>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-semibold">Edit</span>
        </nav>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Edit Product</h1>
      </div>
      <ProductForm
        brands={brands}
        categories={categories}
        product={{ ...product, price: Number(product.price), mrp: product.mrp ? Number(product.mrp) : null }}
        action={action}
      />
    </div>
  )
}
