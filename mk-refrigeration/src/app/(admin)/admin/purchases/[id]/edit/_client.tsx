'use client'

import { useActionState } from 'react'
import type { UpdatePurchaseState } from '@/actions/purchases'

type Supplier = { id: string; name: string }
type Purchase = { id: string; supplierId: string | null; notes: string | null; purchaseDate: Date }

type Props = {
  purchase: Purchase
  suppliers: Supplier[]
  action: (_: UpdatePurchaseState, fd: FormData) => Promise<UpdatePurchaseState>
}

export default function EditPurchaseForm({ purchase, suppliers, action }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined)

  const dateStr = new Date(purchase.purchaseDate).toISOString().split('T')[0]

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label-xs">Supplier</label>
        <select name="supplierId" defaultValue={purchase.supplierId ?? ''} className="input-field">
          <option value="">— No Supplier —</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-xs">Purchase Date</label>
        <input
          name="purchaseDate"
          type="date"
          defaultValue={dateStr}
          className="input-field"
        />
      </div>

      <div>
        <label className="label-xs">Notes</label>
        <textarea
          name="notes"
          defaultValue={purchase.notes ?? ''}
          rows={3}
          className="input-field resize-none"
          placeholder="Optional notes..."
        />
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 bg-error/10 text-error border border-error/20 rounded-xl px-4 py-3 text-sm">
          <span className="material-symbols-outlined text-base">error</span>
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="flex items-center gap-2 bg-success/10 text-success border border-success/20 rounded-xl px-4 py-3 text-sm">
          <span className="material-symbols-outlined text-base">check_circle</span>
          Purchase updated successfully.
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 bg-primary text-on-primary font-bold px-6 py-3 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {pending ? (
            <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-lg">save</span>
          )}
          Save Changes
        </button>
        <a
          href={`/admin/purchases/${purchase.id}`}
          className="flex items-center gap-2 border border-outline-variant/60 text-on-surface-variant font-bold px-6 py-3 rounded-xl hover:bg-surface-container transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
