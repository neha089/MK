import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import PrintQuotation from './_print'

export const dynamic = 'force-dynamic'

export default async function QuotationPDFPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { name: true, model: true } } } },
      createdBy: { select: { name: true } },
    },
  })

  if (!quotation) notFound()

  const data = {
    id: quotation.id,
    quoteNo: quotation.quoteNo,
    customerName: quotation.customerName,
    customerPhone: quotation.customerPhone,
    validDays: quotation.validDays,
    subtotal: Number(quotation.subtotal),
    discount: Number(quotation.discount),
    totalAmount: Number(quotation.totalAmount),
    notes: quotation.notes,
    status: quotation.status,
    createdAt: quotation.createdAt,
    createdBy: quotation.createdBy,
    items: quotation.items.map((i) => ({
      id: i.id,
      qty: i.qty,
      price: Number(i.price),
      discount: Number(i.discount),
      product: i.product,
    })),
  }

  return <PrintQuotation quotation={data} />
}
