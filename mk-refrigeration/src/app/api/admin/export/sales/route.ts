import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'
import { prisma } from '@/lib/db'

function escape(v: string | number | null | undefined): string {
  const s = String(v ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function row(cols: (string | number | null | undefined)[]) {
  return cols.map(escape).join(',')
}

export async function GET() {
  const cookieStore = await cookies()
  const session = await decrypt(cookieStore.get('session')?.value)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: { include: { product: { select: { name: true, model: true } } } },
    },
  })

  const lines: string[] = [
    row(['Invoice No', 'Date', 'Customer Name', 'Customer Phone', 'Payment Mode', 'Subtotal', 'Discount', 'GST Amount', 'Total Amount', 'Items', 'Notes']),
  ]

  for (const s of sales) {
    const itemsSummary = s.items
      .map((i) => `${i.product.name}${i.product.model ? ` (${i.product.model})` : ''} x${i.qty}`)
      .join('; ')
    lines.push(row([
      s.invoiceNo,
      new Date(s.createdAt).toLocaleDateString('en-IN'),
      s.customerName,
      s.customerPhone,
      s.paymentMode,
      Number(s.subtotal),
      Number(s.discount),
      Number(s.gstAmount),
      Number(s.totalAmount),
      itemsSummary,
      s.notes,
    ]))
  }

  const csv = lines.join('\n')
  const filename = `sales-export-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
