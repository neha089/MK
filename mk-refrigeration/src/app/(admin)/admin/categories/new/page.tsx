'use client'

import type { Metadata } from 'next'
import { useActionState } from 'react'
import { createCategory } from '@/actions/categories'

export default function NewCategoryPage() {
  const [state, action, pending] = useActionState(createCategory, undefined)

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <nav className="text-xs text-on-surface-variant mb-3 flex items-center gap-1">
          <a href="/admin/categories" className="hover:text-primary transition-colors">Categories</a>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-semibold">New</span>
        </nav>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Add Category</h1>
      </div>

      <form action={action} className="bg-white rounded-2xl border border-outline-variant/40 p-6 space-y-5">
        <div>
          <label className="label-xs">Name *</label>
          <input name="name" required className="input-field" placeholder="Air Conditioners" />
        </div>
        <div>
          <label className="label-xs">Icon (Material Symbol name)</label>
          <input name="icon" className="input-field" placeholder="ac_unit" />
        </div>
        <div>
          <label className="label-xs">Description</label>
          <input name="description" className="input-field" placeholder="Split, Window & Portable ACs" />
        </div>
        <div>
          <label className="label-xs">Display Order</label>
          <input name="order" type="number" min={0} defaultValue={0} className="input-field w-28" />
        </div>

        {state?.error && (
          <div className="text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">{state.error}</div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
            {pending ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : <span className="material-symbols-outlined text-lg">save</span>}
            Save Category
          </button>
          <a href="/admin/categories" className="flex items-center border border-outline-variant/60 text-on-surface-variant font-bold px-5 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-sm">Cancel</a>
        </div>
      </form>
    </div>
  )
}
