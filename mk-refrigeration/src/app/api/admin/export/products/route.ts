import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'
import { prisma } from '@/lib/db'

function escape(v: string | number | boolean | null | undefined): string {
  const s = String(v ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function row(cols: (string | number | boolean | null | undefined)[]) {
  return cols.map(escape).join(',')
}

export async function GET() {
  const cookieStore = await cookies()
  const session = await decrypt(cookieStore.get('session')?.value)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const products = await prisma.product.findMany({
    orderBy: { name: 'asc' },
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
    },
  })

  const lines: string[] = [
    row(['Name', 'Model', 'Brand', 'Category', 'Price', 'MRP', 'Discount%', 'Stock Qty', 'In Stock', 'Star Rating', 'Barcode', 'Featured', 'Created']),
  ]

  for (const p of products) {
    lines.push(row([
      p.name,
      p.model,
      p.brand.name,
      p.category.name,
      Number(p.price),
      p.mrp ? Number(p.mrp) : '',
      p.discount,
      p.stockQty,
      p.inStock ? 'Yes' : 'No',
      p.starRating,
      p.barcode,
      p.featured ? 'Yes' : 'No',
      new Date(p.createdAt).toLocaleDateString('en-IN'),
    ]))
  }

  const csv = lines.join('\n')
  const filename = `products-export-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
