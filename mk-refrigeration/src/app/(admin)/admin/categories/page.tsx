import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { deleteCategory } from '@/actions/categories'

export const metadata: Metadata = { title: 'Categories' }
export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { products: true } } },
  }).catch(() => [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Categories</h1>
        <Link href="/admin/categories/new" className="btn-primary">
          <span className="material-symbols-outlined text-xl">add</span>
          Add Category
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-container border-b border-outline-variant/40 text-xs text-on-surface-variant uppercase tracking-wider">
            <tr>
              <th className="text-left px-5 py-3.5">Name</th>
              <th className="text-left px-4 py-3.5">Slug</th>
              <th className="text-center px-4 py-3.5">Products</th>
              <th className="text-right px-4 py-3.5">Order</th>
              <th className="px-4 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-surface-container/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    {c.icon && <span className="material-symbols-outlined text-xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{c.icon}</span>}
                    <span className="font-bold text-on-surface">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-on-surface-variant font-mono text-xs">{c.slug}</td>
                <td className="px-4 py-3.5 text-center font-bold text-on-surface">{c._count.products}</td>
                <td className="px-4 py-3.5 text-right text-on-surface-variant">{c.order}</td>
                <td className="px-4 py-3.5">
                  <form action={deleteCategory.bind(null, c.id)} className="flex justify-end">
                    <button type="submit"
                      onClick={(e) => { if (!confirm('Delete category?')) e.preventDefault() }}
                      className="p-1.5 hover:bg-error/10 rounded-lg text-on-surface-variant hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
