'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createStaff } from '@/actions/staff'

export default function AddStaffForm() {
  const [state, action, pending] = useActionState(createStaff, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) formRef.current?.reset()
  }, [state?.success])

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/40 p-6 space-y-4">
      <h2 className="font-bold text-sm text-on-surface">Add Staff / Admin</h2>
      <form ref={formRef} action={action} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-xs">Full Name *</label>
            <input name="name" required className="input-field" placeholder="Rahul Shah" />
          </div>
          <div>
            <label className="label-xs">Email *</label>
            <input name="email" type="email" required className="input-field" placeholder="rahul@mkrefrigeration.com" />
          </div>
          <div>
            <label className="label-xs">Password *</label>
            <input name="password" type="password" required minLength={6} className="input-field" placeholder="Min 6 characters" />
          </div>
          <div>
            <label className="label-xs">Role</label>
            <select name="role" className="input-field">
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        {state?.error && <p className="text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">{state.error}</p>}
        {state?.success && <p className="text-sm text-success bg-success/10 border border-success/20 rounded-xl px-4 py-3">Staff added successfully.</p>}

        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
          {pending ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : <span className="material-symbols-outlined text-lg">person_add</span>}
          Add Staff
        </button>
      </form>
    </div>
  )
}
