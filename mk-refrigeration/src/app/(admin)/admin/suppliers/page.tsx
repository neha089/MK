import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import SuppliersClient from './_client'

export const metadata: Metadata = { title: 'Suppliers' }
export const dynamic = 'force-dynamic'

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { purchases: true } } },
  }).catch(() => [])

  return <SuppliersClient suppliers={suppliers} />
}
