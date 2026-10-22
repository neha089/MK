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

  const purchases = await prisma.purchase.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      supplier: { select: { name: true } },
      items: { include: { product: { select: { name: true, model: true } } } },
    },
  })

  const lines: string[] = [
    row(['Invoice No', 'Date', 'Supplier', 'Total Amount', 'Items', 'Notes']),
  ]

  for (const p of purchases) {
    const itemsSummary = p.items
      .map((i) => `${i.product.name}${i.product.model ? ` (${i.product.model})` : ''} x${i.qty} @${Number(i.costPrice)}`)
      .join('; ')
    lines.push(row([
      p.invoiceNo,
      new Date(p.createdAt).toLocaleDateString('en-IN'),
      p.supplier?.name,
      Number(p.totalAmount),
      itemsSummary,
      p.notes,
    ]))
  }

  const csv = lines.join('\n')
  const filename = `purchases-export-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
