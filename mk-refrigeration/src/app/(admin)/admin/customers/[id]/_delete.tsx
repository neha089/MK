'use client'

import { useTransition } from 'react'
import { deleteCustomer } from '@/actions/customers'

export default function DeleteCustomerButton({ customerId }: { customerId: string }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Delete this customer? This action cannot be undone.')) return
    startTransition(async () => {
      await deleteCustomer(customerId)
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="flex items-center gap-1.5 shrink-0 border border-error/40 text-error font-bold px-4 py-2.5 rounded-xl hover:bg-error/10 transition-colors text-sm disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-base">delete</span>
      {pending ? 'Deleting…' : 'Delete Customer'}
    </button>
  )
}
