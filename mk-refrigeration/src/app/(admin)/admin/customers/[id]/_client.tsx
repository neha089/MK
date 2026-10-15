'use client'

import { useActionState } from 'react'
import type { CustomerFormState } from '@/actions/customers'

type Customer = {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  gstin: string | null
}

type Props = {
  customer: Customer
  action: (state: CustomerFormState, formData: FormData) => Promise<CustomerFormState>
}

export default function CustomerEditForm({ customer, action }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined)
  const err = (f: string) => state?.fieldErrors?.[f]?.[0]

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-xs">Name *</label>
          <input name="name" required defaultValue={customer.name} className="input-field" />
          {err('name') && <p className="text-xs text-error mt-1">{err('name')}</p>}
        </div>
        <div>
          <label className="label-xs">Phone</label>
          <input name="phone" type="tel" defaultValue={customer.phone ?? ''} className="input-field" placeholder="9876543210" />
        </div>
        <div>
          <label className="label-xs">Email</label>
          <input name="email" type="email" defaultValue={customer.email ?? ''} className="input-field" placeholder="customer@email.com" />
          {err('email') && <p className="text-xs text-error mt-1">{err('email')}</p>}
        </div>
        <div>
          <label className="label-xs">GSTIN</label>
          <input name="gstin" defaultValue={customer.gstin ?? ''} className="input-field" placeholder="22AAAAA0000A1Z5" />
        </div>
      </div>
      <div>
        <label className="label-xs">Address</label>
        <textarea name="address" rows={2} defaultValue={customer.address ?? ''} className="input-field resize-none" placeholder="Full address..." />
      </div>

      {state?.error && (
        <p className="text-xs text-error flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">error</span>
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-xs text-emerald-600 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          Saved
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
        {pending
          ? <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
          : <span className="material-symbols-outlined text-lg">save</span>}
        Save Changes
      </button>
    </form>
  )
}
