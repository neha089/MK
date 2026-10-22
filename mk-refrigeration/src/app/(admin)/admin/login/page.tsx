'use client'

import { useActionState } from 'react'
import { login } from '@/actions/auth'
import type { LoginState } from '@/actions/auth'

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <div className="min-h-screen bg-surface-container-low flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-on-primary shadow-lg">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                ac_unit
              </span>
            </div>
            <div className="text-left">
              <p className="font-headline text-lg font-extrabold text-on-surface leading-none">MK Refrigeration</p>
              <p className="text-xs text-on-surface-variant">Admin Portal</p>
            </div>
          </div>
          <h1 className="font-headline text-2xl font-extrabold text-on-surface">Sign In</h1>
          <p className="text-on-surface-variant text-sm mt-1">Access the management dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-outline-variant/40">
          <form action={action} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@mkrefrigeration.com"
                className="w-full px-4 py-3 bg-surface-container border border-outline-variant/60 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-blue-100 transition-all text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-surface-container border border-outline-variant/60 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-blue-100 transition-all text-sm"
              />
            </div>

            {(state?.message || state?.errors) && (
              <div className="flex items-center gap-2 bg-error/10 text-error border border-error/20 rounded-xl px-4 py-3 text-sm">
                <span className="material-symbols-outlined text-base">error</span>
                {state.message ?? Object.values(state.errors ?? {}).flat()[0]}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-bold py-3.5 rounded-xl hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary/20"
            >
              {pending ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  Signing in...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">login</span>
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-on-surface-variant mt-6">
          MK Refrigeration Internal System
        </p>
      </div>
    </div>
  )
}
