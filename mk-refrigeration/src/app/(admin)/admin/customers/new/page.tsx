import type { Metadata } from 'next'
import Link from 'next/link'
import NewCustomerForm from './_client'

export const metadata: Metadata = { title: 'Add Customer' }

export default function NewCustomerPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <nav className="text-xs text-on-surface-variant mb-1 flex items-center gap-1">
          <Link href="/admin/customers" className="hover:text-primary transition-colors">Customers</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span>Add Customer</span>
        </nav>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Add Customer</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Customers are also created automatically when recording a sale.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/40 p-6">
        <NewCustomerForm />
      </div>
    </div>
  )
}
