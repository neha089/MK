import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { updateQuotation } from '@/actions/quotations'
import EditQuotationForm from './_client'

export const metadata: Metadata = { title: 'Edit Quotation' }
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function EditQuotationPage({ params }: Props) {
  const { id } = await params

  const [quotation, products] = await Promise.all([
    prisma.quotation.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, model: true, brand: { select: { name: true } } } } },
        },
      },
    }).catch(() => null),
    prisma.product.findMany({
      where: { inStock: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, price: true, mrp: true, model: true, brand: { select: { name: true } } },
    }),
  ])

  if (!quotation) notFound()
  if (quotation.status !== 'PENDING') redirect(`/admin/quotations/${id}`)

  const action = updateQuotation.bind(null, id)

  const initialItems = quotation.items.map((item) => ({
    productId: item.productId,
    name: item.product.name,
    qty: item.qty,
    price: Number(item.price),
    discount: Number(item.discount),
  }))

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <nav className="text-xs text-on-surface-variant mb-1 flex items-center gap-1">
          <Link href="/admin/quotations" className="hover:text-primary transition-colors">Quotations</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <Link href={`/admin/quotations/${id}`} className="hover:text-primary transition-colors font-mono">
            {quotation.quoteNo}
          </Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span>Edit</span>
        </nav>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Edit Quotation</h1>
      </div>

      <EditQuotationForm
        quotation={{
          id: quotation.id,
          customerName: quotation.customerName ?? '',
          customerPhone: quotation.customerPhone ?? '',
          validDays: quotation.validDays,
          notes: quotation.notes ?? '',
        }}
        initialItems={initialItems}
        products={products.map((p) => ({ ...p, price: Number(p.price), mrp: p.mrp ? Number(p.mrp) : null }))}
        action={action}
      />
    </div>
  )
}
