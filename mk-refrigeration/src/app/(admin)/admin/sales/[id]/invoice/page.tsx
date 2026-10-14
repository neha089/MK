import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import PrintInvoice from './_print'

export const dynamic = 'force-dynamic'

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { name: true, model: true } } } },
      createdBy: { select: { name: true } },
    },
  })

  if (!sale) notFound()

  const data = {
    id: sale.id,
    invoiceNo: sale.invoiceNo,
    customerName: sale.customerName,
    customerPhone: sale.customerPhone,
    paymentMode: sale.paymentMode,
    subtotal: Number(sale.subtotal),
    discount: Number(sale.discount),
    gstAmount: Number(sale.gstAmount),
    totalAmount: Number(sale.totalAmount),
    notes: sale.notes,
    createdAt: sale.createdAt,
    createdBy: sale.createdBy,
    items: sale.items.map((i) => ({
      id: i.id,
      qty: i.qty,
      price: Number(i.price),
      discount: Number(i.discount),
      product: i.product,
    })),
  }

  return <PrintInvoice sale={data} />
}
