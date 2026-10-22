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
  if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const quotations = await prisma.quotation.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: { include: { product: { select: { name: true, model: true } } } },
    },
  })

  const lines: string[] = [
    row(['Quote No', 'Date', 'Customer Name', 'Customer Phone', 'Status', 'Total Amount', 'Validity', 'Items', 'Notes']),
  ]

  for (const q of quotations) {
    const itemsSummary = q.items
      .map((i) => `${i.product.name}${i.product.model ? ` (${i.product.model})` : ''} x${i.qty} @${Number(i.price)}`)
      .join('; ')
    lines.push(row([
      q.quoteNo,
      new Date(q.createdAt).toLocaleDateString('en-IN'),
      q.customerName,
      q.customerPhone,
      q.status,
      Number(q.totalAmount),
      `Valid ${q.validDays} days`,
      itemsSummary,
      q.notes,
    ]))
  }

  const csv = lines.join('\n')
  const filename = `quotations-export-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
