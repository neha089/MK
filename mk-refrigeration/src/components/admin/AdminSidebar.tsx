'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { logout } from '@/actions/auth'

const NAV = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
  { label: 'Products', href: '/admin/products', icon: 'inventory_2' },
  { label: 'Categories', href: '/admin/categories', icon: 'category' },
  { label: 'Brands', href: '/admin/brands', icon: 'verified' },
  { label: 'Inventory', href: '/admin/inventory', icon: 'warehouse' },
  { label: 'Suppliers', href: '/admin/suppliers', icon: 'local_shipping' },
  { label: 'Purchases', href: '/admin/purchases', icon: 'shopping_cart' },
  { label: 'Sales & Billing', href: '/admin/sales', icon: 'receipt_long' },
  { label: 'Quotations', href: '/admin/quotations', icon: 'request_quote' },
  { label: 'Customers', href: '/admin/customers', icon: 'people' },
  { label: 'Enquiries', href: '/admin/enquiries', icon: 'contact_mail' },
  { label: 'Staff', href: '/admin/staff', icon: 'manage_accounts' },
  { label: 'Offers', href: '/admin/offers', icon: 'local_offer' },
  { label: 'Reports', href: '/admin/reports', icon: 'bar_chart' },
  { label: 'Inventory Report', href: '/admin/reports/inventory', icon: 'analytics' },
  { label: 'Low Stock', href: '/admin/reports/low-stock', icon: 'warning' },
  { label: 'Stock Movement', href: '/admin/reports/movement', icon: 'swap_vert' },
  { label: 'Audit Log', href: '/admin/reports/audit', icon: 'policy' },
]

type Props = { user: { name: string; email: string; role: string } }

export default function AdminSidebar({ user }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-outline-variant/40"
        onClick={() => setOpen(!open)}
      >
        <span className="material-symbols-outlined text-2xl text-on-surface">
          {open ? 'close' : 'menu'}
        </span>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-outline-variant/40 z-40 flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-outline-variant/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>ac_unit</span>
            </div>
            <div>
              <p className="font-headline font-extrabold text-sm text-on-surface leading-tight">MK Refrigeration</p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-xl" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-outline-variant/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-base text-primary">person</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-xs text-on-surface truncate">{user.name}</p>
              <p className="text-[10px] text-on-surface-variant truncate">{user.role}</p>
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 text-xs font-bold text-error bg-error/10 hover:bg-error/20 px-3 py-2 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Sign Out
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
