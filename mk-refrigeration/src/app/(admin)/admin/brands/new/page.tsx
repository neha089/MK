'use client'

import { useActionState } from 'react'
import { createBrand } from '@/actions/brands'

export default function NewBrandPage() {
  const [state, action, pending] = useActionState(createBrand, undefined)

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <nav className="text-xs text-on-surface-variant mb-3 flex items-center gap-1">
          <a href="/admin/brands" className="hover:text-primary transition-colors">Brands</a>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-semibold">New</span>
        </nav>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Add Brand</h1>
      </div>

      <form action={action} className="bg-white rounded-2xl border border-outline-variant/40 p-6 space-y-5">
        <div>
          <label className="label-xs">Brand Name *</label>
          <input name="name" required className="input-field" placeholder="LG" />
        </div>
        <div>
          <label className="label-xs">Logo URL</label>
          <input name="logo" type="url" className="input-field" placeholder="https://..." />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="featured" className="w-4 h-4 accent-primary" />
          <span className="text-sm font-semibold text-on-surface">Show as featured brand</span>
        </label>

        {state?.error && <div className="text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">{state.error}</div>}

        <div className="flex gap-3">
          <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
            {pending ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : <span className="material-symbols-outlined text-lg">save</span>}
            Save Brand
          </button>
          <a href="/admin/brands" className="flex items-center border border-outline-variant/60 text-on-surface-variant font-bold px-5 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-sm">Cancel</a>
        </div>
      </form>
    </div>
  )
}
