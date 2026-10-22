import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Reports' }
export const dynamic = 'force-dynamic'

function monthRange(monthsAgo: number) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
  const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0, 23, 59, 59)
  return { gte: start, lte: end }
}

function monthLabel(monthsAgo: number) {
  const d = new Date()
  d.setMonth(d.getMonth() - monthsAgo)
  return d.toLocaleString('en-IN', { month: 'short', year: '2-digit' })
}

async function getReport() {
  try {
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
    const yearStart = new Date(now.getFullYear(), 0, 1)

    const [
      totalSales,
      totalPurchases,
      thisMonthSales,
      lastMonthSales,
      thisMonthPurchases,
      lastMonthPurchases,
      ytdSales,
      ytdPurchases,
      totalDiscount,
    ] = await Promise.all([
      prisma.sale.aggregate({ _sum: { totalAmount: true } }),
      prisma.purchase.aggregate({ _sum: { totalAmount: true } }),
      prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: thisMonthStart } } }),
      prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      prisma.purchase.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: thisMonthStart } } }),
      prisma.purchase.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: yearStart } } }),
      prisma.purchase.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: yearStart } } }),
      prisma.sale.aggregate({ _sum: { discount: true } }),
    ])

    const monthly = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const range = monthRange(5 - i)
        return Promise.all([
          prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { createdAt: range } }),
          prisma.purchase.aggregate({ _sum: { totalAmount: true }, where: { createdAt: range } }),
        ])
      })
    )

    return {
      totalRevenue: Number(totalSales._sum.totalAmount ?? 0),
      totalCogs: Number(totalPurchases._sum.totalAmount ?? 0),
      thisMonthRevenue: Number(thisMonthSales._sum.totalAmount ?? 0),
      lastMonthRevenue: Number(lastMonthSales._sum.totalAmount ?? 0),
      thisMonthCogs: Number(thisMonthPurchases._sum.totalAmount ?? 0),
      lastMonthCogs: Number(lastMonthPurchases._sum.totalAmount ?? 0),
      ytdRevenue: Number(ytdSales._sum.totalAmount ?? 0),
      ytdCogs: Number(ytdPurchases._sum.totalAmount ?? 0),
      totalDiscount: Number(totalDiscount._sum.discount ?? 0),
      monthly: monthly.map(([s, p], i) => ({
        label: monthLabel(5 - i),
        revenue: Number(s._sum.totalAmount ?? 0),
        cogs: Number(p._sum.totalAmount ?? 0),
      })),
    }
  } catch {
    return null
  }
}

function StatCard({
  label,
  value,
  sub,
  color = 'text-on-surface',
}: {
  label: string
  value: string
  sub?: string
  color?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-outline-variant/40 p-5">
      <p className="text-xs text-on-surface-variant font-medium mb-1">{label}</p>
      <p className={`text-2xl font-extrabold font-headline ${color}`}>{value}</p>
      {sub && <p className="text-xs text-on-surface-variant mt-1">{sub}</p>}
    </div>
  )
}

export default async function ReportsPage() {
  const data = await getReport()

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Reports</h1>
        <p className="text-on-surface-variant">Unable to load report data.</p>
      </div>
    )
  }

  const grossProfit = data.thisMonthRevenue - data.thisMonthCogs
  const grossMargin = data.thisMonthRevenue > 0 ? (grossProfit / data.thisMonthRevenue) * 100 : 0
  const lastMonthProfit = data.lastMonthRevenue - data.lastMonthCogs
  const revenueGrowth = data.lastMonthRevenue > 0
    ? ((data.thisMonthRevenue - data.lastMonthRevenue) / data.lastMonthRevenue) * 100
    : null

  const ytdProfit = data.ytdRevenue - data.ytdCogs
  const ytdMargin = data.ytdRevenue > 0 ? (ytdProfit / data.ytdRevenue) * 100 : 0

  const maxMonthlyRevenue = Math.max(...data.monthly.map((m) => m.revenue), 1)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Reports</h1>
        <p className="text-on-surface-variant text-sm mt-1">P&amp;L overview · all figures in ₹</p>
      </div>

      {/* This Month */}
      <section>
        <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">This Month</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Revenue"
            value={formatPrice(data.thisMonthRevenue)}
            sub={revenueGrowth !== null ? `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}% vs last month` : undefined}
            color="text-primary"
          />
          <StatCard
            label="Purchases (Cost)"
            value={formatPrice(data.thisMonthCogs)}
            sub={`Last month: ${formatPrice(data.lastMonthCogs)}`}
            color="text-on-surface"
          />
          <StatCard
            label="Gross Profit"
            value={formatPrice(grossProfit)}
            sub={`Last month: ${formatPrice(lastMonthProfit)}`}
            color={grossProfit >= 0 ? 'text-success' : 'text-error'}
          />
          <StatCard
            label="Gross Margin"
            value={`${grossMargin.toFixed(1)}%`}
            sub="Revenue − Purchases ÷ Revenue"
            color={grossMargin >= 20 ? 'text-success' : grossMargin >= 0 ? 'text-warning' : 'text-error'}
          />
        </div>
      </section>

      {/* Year to Date */}
      <section>
        <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Year to Date ({new Date().getFullYear()})</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Revenue" value={formatPrice(data.ytdRevenue)} color="text-primary" />
          <StatCard label="Total Purchases" value={formatPrice(data.ytdCogs)} />
          <StatCard
            label="Gross Profit"
            value={formatPrice(ytdProfit)}
            color={ytdProfit >= 0 ? 'text-success' : 'text-error'}
          />
          <StatCard
            label="Gross Margin"
            value={`${ytdMargin.toFixed(1)}%`}
            color={ytdMargin >= 20 ? 'text-success' : ytdMargin >= 0 ? 'text-warning' : 'text-error'}
          />
        </div>
      </section>

      {/* All Time */}
      <section>
        <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">All Time</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total Revenue" value={formatPrice(data.totalRevenue)} color="text-primary" />
          <StatCard label="Total Purchases" value={formatPrice(data.totalCogs)} />
          <StatCard label="Total Discounts Given" value={formatPrice(data.totalDiscount)} color="text-warning" />
        </div>
      </section>

      {/* Monthly Bar Chart (HTML/CSS, no JS charting lib) */}
      <section>
        <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">Last 6 Months</h2>
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-6">
          <div className="flex items-end gap-3 h-48">
            {data.monthly.map((m) => {
              const revH = maxMonthlyRevenue > 0 ? (m.revenue / maxMonthlyRevenue) * 100 : 0
              const cogsH = maxMonthlyRevenue > 0 ? (m.cogs / maxMonthlyRevenue) * 100 : 0
              const profit = m.revenue - m.cogs
              return (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full flex items-end gap-0.5 h-40">
                    <div
                      className="flex-1 rounded-t-md bg-primary/80 transition-all"
                      style={{ height: `${revH}%` }}
                      title={`Revenue: ${formatPrice(m.revenue)}`}
                    />
                    <div
                      className="flex-1 rounded-t-md bg-outline-variant/60 transition-all"
                      style={{ height: `${cogsH}%` }}
                      title={`Purchases: ${formatPrice(m.cogs)}`}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-on-surface-variant">{m.label}</p>
                  <p className={`text-[9px] font-bold ${profit >= 0 ? 'text-success' : 'text-error'}`}>
                    {profit >= 0 ? '+' : ''}{formatPrice(profit)}
                  </p>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-outline-variant/30">
            <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <span className="w-3 h-3 rounded-sm bg-primary/80 inline-block" /> Revenue
            </span>
            <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <span className="w-3 h-3 rounded-sm bg-outline-variant/60 inline-block" /> Purchases
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
