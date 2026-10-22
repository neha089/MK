'use client'

import { useActionState } from 'react'
import type { BrandFormState } from '@/actions/brands'

type Brand = { id: string; name: string; logo: string | null; featured: boolean }

export default function EditBrandForm({
  initialData,
  action,
}: {
  initialData: Brand
  action: (state: BrandFormState, formData: FormData) => Promise<BrandFormState>
}) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <nav className="text-xs text-on-surface-variant mb-3 flex items-center gap-1">
          <a href="/admin/brands" className="hover:text-primary transition-colors">Brands</a>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-semibold">Edit</span>
        </nav>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Edit Brand</h1>
      </div>

      <form action={formAction} className="bg-white rounded-2xl border border-outline-variant/40 p-6 space-y-5">
        <div>
          <label className="label-xs">Name *</label>
          <input name="name" required className="input-field" defaultValue={initialData.name} />
        </div>
        <div>
          <label className="label-xs">Logo URL</label>
          <input name="logo" type="url" className="input-field" placeholder="https://..." defaultValue={initialData.logo ?? ''} />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="featured" defaultChecked={initialData.featured} className="w-4 h-4 accent-primary" />
          <span className="text-sm font-medium text-on-surface">Featured brand</span>
        </label>

        {state?.error && (
          <p className="text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">{state.error}</p>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
            {pending
              ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              : <span className="material-symbols-outlined text-lg">save</span>
            }
            Save Changes
          </button>
          <a href="/admin/brands" className="flex items-center border border-outline-variant/60 text-on-surface-variant font-bold px-5 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-sm">Cancel</a>
        </div>
      </form>
    </div>
  )
}
