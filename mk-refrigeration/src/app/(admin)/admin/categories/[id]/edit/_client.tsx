'use client'

import { useActionState } from 'react'
import type { CatFormState } from '@/actions/categories'

type Category = { id: string; name: string; icon: string | null; description: string | null; order: number }

export default function EditCategoryForm({
  initialData,
  action,
}: {
  initialData: Category
  action: (state: CatFormState, formData: FormData) => Promise<CatFormState>
}) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <nav className="text-xs text-on-surface-variant mb-3 flex items-center gap-1">
          <a href="/admin/categories" className="hover:text-primary transition-colors">Categories</a>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-semibold">Edit</span>
        </nav>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Edit Category</h1>
      </div>

      <form action={formAction} className="bg-white rounded-2xl border border-outline-variant/40 p-6 space-y-5">
        <div>
          <label className="label-xs">Name *</label>
          <input name="name" required className="input-field" defaultValue={initialData.name} />
        </div>
        <div>
          <label className="label-xs">Icon (Material Symbol name)</label>
          <input name="icon" className="input-field" placeholder="e.g. ac_unit" defaultValue={initialData.icon ?? ''} />
        </div>
        <div>
          <label className="label-xs">Description</label>
          <textarea name="description" rows={2} className="input-field resize-none" defaultValue={initialData.description ?? ''} />
        </div>
        <div>
          <label className="label-xs">Sort Order</label>
          <input name="order" type="number" min={0} className="input-field w-24" defaultValue={initialData.order} />
        </div>

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
          <a href="/admin/categories" className="flex items-center border border-outline-variant/60 text-on-surface-variant font-bold px-5 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-sm">Cancel</a>
        </div>
      </form>
    </div>
  )
}
