import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  return (
    <div className="flex min-h-screen bg-surface-container-low">
      <AdminSidebar user={{ name: session.name, email: session.email, role: session.role }} />
      <main className="flex-1 ml-0 lg:ml-64 p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
