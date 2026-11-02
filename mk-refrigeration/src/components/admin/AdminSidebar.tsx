'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { logout } from '@/actions/auth'

type NavItem = { label: string; href: string; icon: string; exact?: boolean }
type NavSection = { title: string; items: NavItem[] }

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard', exact: true },
    ],
  },
  {
    title: 'Catalogue',
    items: [
      { label: 'Products', href: '/admin/products', icon: 'inventory_2' },
      { label: 'Categories', href: '/admin/categories', icon: 'category' },
      { label: 'Brands', href: '/admin/brands', icon: 'verified' },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { label: 'Inventory', href: '/admin/inventory', icon: 'warehouse' },
      { label: 'Suppliers', href: '/admin/suppliers', icon: 'local_shipping' },
      { label: 'Purchases', href: '/admin/purchases', icon: 'shopping_cart' },
    ],
  },
  {
    title: 'Sales',
    items: [
      { label: 'Sales & Billing', href: '/admin/sales', icon: 'receipt_long' },
      { label: 'Quotations', href: '/admin/quotations', icon: 'request_quote' },
      { label: 'Customers', href: '/admin/customers', icon: 'people' },
    ],
  },
  {
    title: 'CRM',
    items: [
      { label: 'Enquiries', href: '/admin/enquiries', icon: 'contact_mail' },
      { label: 'Offers', href: '/admin/offers', icon: 'local_offer' },
    ],
  },
  {
    title: 'Reports',
    items: [
      { label: 'Overview', href: '/admin/reports', icon: 'bar_chart', exact: true },
      { label: 'Sales Analytics', href: '/admin/reports/sales', icon: 'trending_up' },
      { label: 'Enquiry Analytics', href: '/admin/reports/enquiries', icon: 'query_stats' },
      { label: 'Inventory Report', href: '/admin/reports/inventory', icon: 'analytics' },
      { label: 'Low Stock', href: '/admin/reports/low-stock', icon: 'warning' },
      { label: 'Stock Movement', href: '/admin/reports/movement', icon: 'swap_vert' },
      { label: 'Audit Log', href: '/admin/reports/audit', icon: 'policy' },
    ],
  },
  {
    title: 'Team',
    items: [
      { label: 'Staff', href: '/admin/staff', icon: 'manage_accounts' },
    ],
  },
]

type Props = {
  user: { name: string; email: string; role: string }
  enquiryCount?: number
  lowStockCount?: number
}

export default function AdminSidebar({ user, enquiryCount = 0, lowStockCount = 0 }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mk-sidebar-collapsed')
      if (saved === 'true') setCollapsed(true)
    } catch {}
  }, [])

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    try { localStorage.setItem('mk-sidebar-collapsed', String(next)) } catch {}
  }

  const isActive = (item: NavItem) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + '/')

  const badge = (href: string) => {
    if (href === '/admin/enquiries' && enquiryCount > 0) return enquiryCount
    if (href === '/admin/reports/low-stock' && lowStockCount > 0) return lowStockCount
    return 0
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-outline-variant/40"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <span className="material-symbols-outlined text-2xl text-on-surface">
          {mobileOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-outline-variant/40 z-40 flex flex-col transition-all duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'w-[72px]' : 'w-64'}`}
      >
        {/* Brand */}
        <div className={`border-b border-outline-variant/40 flex items-center gap-3 ${collapsed ? 'px-3 py-5 justify-center' : 'px-5 py-4'}`}>
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-on-primary flex-shrink-0">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              ac_unit
            </span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-headline font-extrabold text-sm text-on-surface leading-tight truncate">MK Refrigeration</p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Ctrl+K hint */}
        {!collapsed && (
          <button
            className="mx-3 mt-3 flex items-center gap-2 px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container/60 text-xs text-on-surface-variant hover:border-primary/30 hover:bg-primary/5 transition-colors"
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
            }}
          >
            <span className="material-symbols-outlined text-base">search</span>
            <span className="flex-1 text-left">Search…</span>
            <kbd className="font-bold bg-white border border-outline-variant/40 px-1 py-0.5 rounded text-[10px]">⌘K</kbd>
          </button>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <p className="px-3 pt-3 pb-1 text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">
                  {section.title}
                </p>
              )}
              {collapsed && <div className="my-2 border-t border-outline-variant/20 mx-2" />}
              {section.items.map((item) => {
                const active = isActive(item)
                const b = badge(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 rounded-xl text-sm font-semibold transition-colors relative ${
                      collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5'
                    } ${
                      active
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-xl flex-shrink-0"
                      style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {b > 0 && (
                      <span className={`${collapsed ? 'absolute top-1 right-1' : 'ml-auto'} min-w-[18px] h-[18px] text-[10px] font-extrabold bg-error text-white rounded-full flex items-center justify-center px-1`}>
                        {b > 99 ? '99+' : b}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="px-2 pb-2">
          <button
            onClick={toggleCollapsed}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="material-symbols-outlined text-lg">
              {collapsed ? 'chevron_right' : 'chevron_left'}
            </span>
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* User */}
        <div className={`border-t border-outline-variant/40 p-3 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          {!collapsed && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-base text-primary">person</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-on-surface truncate">{user.name}</p>
                <p className="text-[10px] text-on-surface-variant truncate">{user.role}</p>
              </div>
            </div>
          )}
          <form action={logout}>
            <button
              type="submit"
              title="Sign out"
              className={`flex items-center justify-center gap-2 text-xs font-bold text-error bg-error/10 hover:bg-error/20 px-3 py-2 rounded-xl transition-colors ${collapsed ? 'w-10 h-10 p-0' : 'w-full'}`}
            >
              <span className="material-symbols-outlined text-base">logout</span>
              {!collapsed && 'Sign Out'}
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
