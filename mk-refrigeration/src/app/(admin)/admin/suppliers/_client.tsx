'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createSupplier, deleteSupplier } from '@/actions/suppliers'
import type { SupplierFormState } from '@/actions/suppliers'

interface Supplier {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  gstin: string | null
  createdAt: Date
  _count: { purchases: number }
}

export default function SuppliersClient({ suppliers }: { suppliers: Supplier[] }) {
  const [state, action, pending] = useActionState<SupplierFormState, FormData>(createSupplier, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) formRef.current?.reset()
  }, [state])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Suppliers</h1>
        <p className="text-on-surface-variant text-sm mt-1">{suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Add supplier form */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 p-6">
        <h2 className="font-bold text-sm text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-primary">add_circle</span>
          Add New Supplier
        </h2>
        <form ref={formRef} action={action}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                Name <span className="text-error">*</span>
              </label>
              <input
                name="name"
                required
                placeholder="Supplier / Company name"
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Phone</label>
              <input
                name="phone"
                placeholder="Contact number"
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                placeholder="email@example.com"
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">GSTIN</label>
              <input
                name="gstin"
                placeholder="GST number (optional)"
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Address</label>
              <input
                name="address"
                placeholder="Full address"
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>

          {state?.error && (
            <p className="text-sm text-error bg-error/10 px-3 py-2 rounded-xl mb-4">{state.error}</p>
          )}
          {state?.success && (
            <p className="text-sm text-success bg-success/10 px-3 py-2 rounded-xl mb-4">Supplier added successfully.</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn-primary disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            {pending ? 'Adding…' : 'Add Supplier'}
          </button>
        </form>
      </div>

      {/* Suppliers list */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b border-outline-variant/40 text-xs text-on-surface-variant uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3.5">Name</th>
                <th className="text-left px-4 py-3.5">Phone</th>
                <th className="text-left px-4 py-3.5">Email</th>
                <th className="text-left px-4 py-3.5">GSTIN</th>
                <th className="text-left px-4 py-3.5">Address</th>
                <th className="text-center px-4 py-3.5">Purchases</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-on-surface-variant">
                    No suppliers yet. Add one above.
                  </td>
                </tr>
              ) : suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-on-surface">{s.name}</td>
                  <td className="px-4 py-3.5 text-on-surface-variant">
                    {s.phone ? (
                      <a href={`tel:${s.phone}`} className="hover:text-primary transition-colors">{s.phone}</a>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-on-surface-variant text-xs">
                    {s.email ? (
                      <a href={`mailto:${s.email}`} className="hover:text-primary transition-colors">{s.email}</a>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-on-surface-variant">{s.gstin ?? '—'}</td>
                  <td className="px-4 py-3.5 text-on-surface-variant text-xs max-w-[180px] truncate">{s.address ?? '—'}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {s._count.purchases}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {s._count.purchases === 0 && (
                      <form action={deleteSupplier.bind(null, s.id)}>
                        <button
                          type="submit"
                          className="p-1.5 hover:bg-error/10 rounded-lg text-on-surface-variant hover:text-error transition-colors"
                          title="Delete supplier"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
