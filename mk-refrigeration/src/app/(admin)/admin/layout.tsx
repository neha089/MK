import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import AdminSidebar from '@/components/admin/AdminSidebar'
import CommandPalette from '@/components/admin/CommandPalette'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) {
    return <>{children}</>
  }

  const [enquiryCount, lowStockCount] = await Promise.all([
    prisma.enquiry.count({ where: { status: 'NEW' } }).catch(() => 0),
    prisma.product.count({ where: { stockQty: { lte: 2 }, inStock: true } }).catch(() => 0),
  ])

  return (
    <div className="flex min-h-screen bg-surface-container-low">
      <AdminSidebar
        user={{ name: session.name, email: session.email, role: session.role }}
        enquiryCount={enquiryCount}
        lowStockCount={lowStockCount}
      />
      <CommandPalette />
      <main className="flex-1 ml-0 lg:ml-64 pt-16 lg:pt-0 p-4 lg:p-8">
        {children}
      </main>
    </div>
  )
}
