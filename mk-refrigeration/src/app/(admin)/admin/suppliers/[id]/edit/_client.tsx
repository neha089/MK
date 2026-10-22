'use client'

import { useActionState } from 'react'
import type { SupplierFormState } from '@/actions/suppliers'

type Supplier = { id: string; name: string; phone: string | null; email: string | null; address: string | null; gstin: string | null }

export default function EditSupplierForm({
  initialData,
  action,
}: {
  initialData: Supplier
  action: (state: SupplierFormState, formData: FormData) => Promise<SupplierFormState>
}) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <nav className="text-xs text-on-surface-variant mb-3 flex items-center gap-1">
          <a href="/admin/suppliers" className="hover:text-primary transition-colors">Suppliers</a>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-semibold">Edit</span>
        </nav>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Edit Supplier</h1>
      </div>

      <form action={formAction} className="bg-white rounded-2xl border border-outline-variant/40 p-6 space-y-5">
        <div>
          <label className="label-xs">Supplier Name *</label>
          <input name="name" required className="input-field" defaultValue={initialData.name} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-xs">Phone</label>
            <input name="phone" className="input-field" defaultValue={initialData.phone ?? ''} />
          </div>
          <div>
            <label className="label-xs">Email</label>
            <input name="email" type="email" className="input-field" defaultValue={initialData.email ?? ''} />
          </div>
        </div>
        <div>
          <label className="label-xs">Address</label>
          <textarea name="address" rows={2} className="input-field resize-none" defaultValue={initialData.address ?? ''} />
        </div>
        <div>
          <label className="label-xs">GSTIN</label>
          <input name="gstin" className="input-field font-mono" placeholder="22AAAAA0000A1Z5" defaultValue={initialData.gstin ?? ''} />
        </div>

        {state?.error && (
          <p className="text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">{state.error}</p>
        )}
        {state?.success && (
          <p className="text-sm text-success bg-success/10 border border-success/20 rounded-xl px-4 py-3">Supplier updated successfully.</p>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
            {pending
              ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              : <span className="material-symbols-outlined text-lg">save</span>
            }
            Save Changes
          </button>
          <a href="/admin/suppliers" className="flex items-center border border-outline-variant/60 text-on-surface-variant font-bold px-5 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-sm">Cancel</a>
        </div>
      </form>
    </div>
  )
}
