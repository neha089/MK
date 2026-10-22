'use client'

import { useActionState } from 'react'
import { createCustomer } from '@/actions/customers'
import type { CustomerFormState } from '@/actions/customers'

export default function NewCustomerForm() {
  const [state, action, pending] = useActionState<CustomerFormState, FormData>(createCustomer, undefined)
  const err = (f: string) => (state as { fieldErrors?: Record<string, string[]> } | undefined)?.fieldErrors?.[f]?.[0]

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-xs">Name *</label>
          <input name="name" required className="input-field" placeholder="Customer name" />
          {err('name') && <p className="text-xs text-error mt-1">{err('name')}</p>}
        </div>
        <div>
          <label className="label-xs">Phone</label>
          <input name="phone" type="tel" className="input-field" placeholder="9876543210" />
        </div>
        <div>
          <label className="label-xs">Email</label>
          <input name="email" type="email" className="input-field" placeholder="customer@email.com" />
          {err('email') && <p className="text-xs text-error mt-1">{err('email')}</p>}
        </div>
        <div>
          <label className="label-xs">GSTIN</label>
          <input name="gstin" className="input-field" placeholder="22AAAAA0000A1Z5" />
        </div>
      </div>
      <div>
        <label className="label-xs">Address</label>
        <textarea name="address" rows={2} className="input-field resize-none" placeholder="Full address..." />
      </div>

      {state?.error && (
        <p className="text-xs text-error flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">error</span>
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
        {pending
          ? <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
          : <span className="material-symbols-outlined text-lg">person_add</span>}
        Add Customer
      </button>
    </form>
  )
}
