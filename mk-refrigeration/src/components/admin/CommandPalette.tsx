'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

const COMMANDS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard', group: 'Pages' },
  { label: 'Products', href: '/admin/products', icon: 'inventory_2', group: 'Pages' },
  { label: 'Categories', href: '/admin/categories', icon: 'category', group: 'Pages' },
  { label: 'Brands', href: '/admin/brands', icon: 'verified', group: 'Pages' },
  { label: 'Inventory', href: '/admin/inventory', icon: 'warehouse', group: 'Pages' },
  { label: 'Suppliers', href: '/admin/suppliers', icon: 'local_shipping', group: 'Pages' },
  { label: 'Purchases', href: '/admin/purchases', icon: 'shopping_cart', group: 'Pages' },
  { label: 'Sales & Billing', href: '/admin/sales', icon: 'receipt_long', group: 'Pages' },
  { label: 'Quotations', href: '/admin/quotations', icon: 'request_quote', group: 'Pages' },
  { label: 'Customers', href: '/admin/customers', icon: 'people', group: 'Pages' },
  { label: 'Enquiries', href: '/admin/enquiries', icon: 'contact_mail', group: 'Pages' },
  { label: 'Offers', href: '/admin/offers', icon: 'local_offer', group: 'Pages' },
  { label: 'Staff', href: '/admin/staff', icon: 'manage_accounts', group: 'Pages' },
  { label: 'Reports', href: '/admin/reports', icon: 'bar_chart', group: 'Reports' },
  { label: 'Sales Analytics', href: '/admin/reports/sales', icon: 'trending_up', group: 'Reports' },
  { label: 'Enquiry Analytics', href: '/admin/reports/enquiries', icon: 'query_stats', group: 'Reports' },
  { label: 'Inventory Report', href: '/admin/reports/inventory', icon: 'analytics', group: 'Reports' },
  { label: 'Low Stock', href: '/admin/reports/low-stock', icon: 'warning', group: 'Reports' },
  { label: 'Stock Movement', href: '/admin/reports/movement', icon: 'swap_vert', group: 'Reports' },
  { label: 'Audit Log', href: '/admin/reports/audit', icon: 'policy', group: 'Reports' },
  { label: 'New Sale', href: '/admin/sales/new', icon: 'add_circle', group: 'Actions' },
  { label: 'New Quotation', href: '/admin/quotations/new', icon: 'add_circle', group: 'Actions' },
  { label: 'Add Product', href: '/admin/products/new', icon: 'add_box', group: 'Actions' },
  { label: 'New Purchase', href: '/admin/purchases/new', icon: 'shopping_cart', group: 'Actions' },
  { label: 'Add Customer', href: '/admin/customers/new', icon: 'person_add', group: 'Actions' },
]

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = query.trim()
    ? COMMANDS.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : COMMANDS

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setSelected(0)
  }, [])

  const navigate = useCallback(
    (href: string) => {
      close()
      router.push(href)
    },
    [close, router],
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [close])

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 30)
      setSelected(0)
      return () => clearTimeout(t)
    }
  }, [open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter' && filtered[selected]) {
      navigate(filtered[selected].href)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4"
      onClick={close}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-label="Command palette"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-outline-variant/40">
          <span className="material-symbols-outlined text-xl text-on-surface-variant flex-shrink-0">search</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected(0)
            }}
            placeholder="Search pages, actions…"
            className="flex-1 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none bg-transparent"
            aria-label="Search"
          />
          <kbd className="text-[10px] font-bold text-on-surface-variant bg-surface-container border border-outline-variant/40 px-1.5 py-0.5 rounded flex-shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-1.5">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-on-surface-variant py-10">
              No results for &ldquo;{query}&rdquo;
            </p>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={`${cmd.href}-${i}`}
                onClick={() => navigate(cmd.href)}
                onMouseEnter={() => setSelected(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                  i === selected
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface hover:bg-surface-container'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-lg flex-shrink-0 ${i === selected ? 'text-primary' : 'text-on-surface-variant'}`}
                >
                  {cmd.icon}
                </span>
                <span className="flex-1 font-medium">{cmd.label}</span>
                <span className="text-[10px] text-on-surface-variant font-semibold bg-surface-container px-1.5 py-0.5 rounded">
                  {cmd.group}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-outline-variant/40 flex gap-4 text-[10px] text-on-surface-variant">
          <span><kbd className="font-bold">↑↓</kbd> navigate</span>
          <span><kbd className="font-bold">↵</kbd> open</span>
          <span><kbd className="font-bold">esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
