import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { updatePurchase } from '@/actions/purchases'
import EditPurchaseForm from './_client'

export const metadata: Metadata = { title: 'Edit Purchase' }
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function EditPurchasePage({ params }: Props) {
  const { id } = await params

  const [purchase, suppliers] = await Promise.all([
    prisma.purchase.findUnique({
      where: { id },
      select: { id: true, invoiceNo: true, supplierId: true, notes: true, purchaseDate: true },
    }).catch(() => null),
    prisma.supplier.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  if (!purchase) notFound()

  const action = updatePurchase.bind(null, id)

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <nav className="text-xs text-on-surface-variant mb-1 flex items-center gap-1">
          <Link href="/admin/purchases" className="hover:text-primary transition-colors">Purchases</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <Link href={`/admin/purchases/${id}`} className="hover:text-primary transition-colors font-mono">
            {purchase.invoiceNo ?? id.slice(0, 8)}
          </Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span>Edit</span>
        </nav>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Edit Purchase</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">You can only change the supplier, date, and notes. Items cannot be edited as they affect stock.</p>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/40 p-6">
        <EditPurchaseForm purchase={purchase} suppliers={suppliers} action={action} />
      </div>
    </div>
  )
}
