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

  const logs = await prisma.inventoryLog.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { name: true, model: true, barcode: true } },
    },
  })

  const lines: string[] = [
    row(['Date', 'Product', 'Model', 'Barcode', 'Type', 'Qty', 'Note', 'Ref ID']),
  ]

  for (const l of logs) {
    lines.push(row([
      new Date(l.createdAt).toLocaleDateString('en-IN'),
      l.product.name,
      l.product.model,
      l.product.barcode,
      l.type,
      l.qty,
      l.note,
      l.refId,
    ]))
  }

  const csv = lines.join('\n')
  const filename = `inventory-log-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
