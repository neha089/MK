'use client'

import { useActionState } from 'react'
import type { UpdateStaffFormState } from '@/actions/staff'

type StaffUser = { id: string; name: string; email: string; role: string }

export default function EditStaffForm({
  initialData,
  action,
}: {
  initialData: StaffUser
  action: (state: UpdateStaffFormState, formData: FormData) => Promise<UpdateStaffFormState>
}) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <nav className="text-xs text-on-surface-variant mb-3 flex items-center gap-1">
          <a href="/admin/staff" className="hover:text-primary transition-colors">Staff</a>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-semibold">Edit</span>
        </nav>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Edit Staff Member</h1>
        <p className="text-sm text-on-surface-variant mt-1">{initialData.email}</p>
      </div>

      <form action={formAction} className="bg-white rounded-2xl border border-outline-variant/40 p-6 space-y-5">
        <div>
          <label className="label-xs">Name *</label>
          <input name="name" required className="input-field" defaultValue={initialData.name} />
        </div>
        <div>
          <label className="label-xs">Role *</label>
          <select name="role" className="input-field" defaultValue={initialData.role}>
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div>
          <label className="label-xs">New Password</label>
          <input
            name="password"
            type="password"
            className="input-field"
            placeholder="Leave blank to keep current password"
            autoComplete="new-password"
          />
          <p className="text-xs text-on-surface-variant mt-1">Minimum 6 characters if changing</p>
        </div>

        {state?.error && (
          <p className="text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">{state.error}</p>
        )}
        {state?.success && (
          <p className="text-sm text-success bg-success/10 border border-success/20 rounded-xl px-4 py-3">Staff member updated successfully.</p>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
            {pending
              ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              : <span className="material-symbols-outlined text-lg">save</span>
            }
            Save Changes
          </button>
          <a href="/admin/staff" className="flex items-center border border-outline-variant/60 text-on-surface-variant font-bold px-5 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-sm">Cancel</a>
        </div>
      </form>
    </div>
  )
}
