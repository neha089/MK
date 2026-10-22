'use client'

import { useActionState } from 'react'
import { createOffer } from '@/actions/offers'

export default function NewOfferPage() {
  const [state, action, pending] = useActionState(createOffer, undefined)

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <nav className="text-xs text-on-surface-variant mb-3 flex items-center gap-1">
          <a href="/admin/offers" className="hover:text-primary transition-colors">Offers</a>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-semibold">New</span>
        </nav>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Add Offer</h1>
      </div>

      <form action={action} className="bg-white rounded-2xl border border-outline-variant/40 p-6 space-y-5">
        <div>
          <label className="label-xs">Offer Title *</label>
          <input name="title" required className="input-field" placeholder="Summer Sale — Up to 30% Off" />
        </div>
        <div>
          <label className="label-xs">Description</label>
          <textarea name="description" rows={2} className="input-field resize-none" placeholder="Valid on all ACs and Refrigerators..." />
        </div>
        <div>
          <label className="label-xs">Discount % (optional)</label>
          <input name="discount" type="number" min={0} max={100} className="input-field w-32" placeholder="20" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-xs">Valid From</label>
            <input name="validFrom" type="date" className="input-field" />
          </div>
          <div>
            <label className="label-xs">Valid Until</label>
            <input name="validUntil" type="date" className="input-field" />
          </div>
        </div>

        {state?.error && <p className="text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">{state.error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
            {pending ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : <span className="material-symbols-outlined text-lg">save</span>}
            Save Offer
          </button>
          <a href="/admin/offers" className="flex items-center border border-outline-variant/60 text-on-surface-variant font-bold px-5 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-sm">Cancel</a>
        </div>
      </form>
    </div>
  )
}
