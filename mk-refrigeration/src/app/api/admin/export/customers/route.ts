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

  const customers = await prisma.customer.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { sales: true, quotations: true } },
      sales: { select: { totalAmount: true } },
    },
  })

  const lines: string[] = [
    row(['Name', 'Phone', 'Email', 'Address', 'GSTIN', 'Total Sales', 'Total Spent', 'Since']),
  ]

  for (const c of customers) {
    const totalSpent = c.sales.reduce((sum, s) => sum + Number(s.totalAmount), 0)
    lines.push(row([
      c.name,
      c.phone,
      c.email,
      c.address,
      c.gstin,
      c._count.sales,
      totalSpent.toFixed(2),
      new Date(c.createdAt).toLocaleDateString('en-IN'),
    ]))
  }

  const csv = lines.join('\n')
  const filename = `customers-export-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
