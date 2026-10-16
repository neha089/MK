'use client'

import { useTransition } from 'react'
import { cancelSale } from '@/actions/sales'
import { useRouter } from 'next/navigation'

export default function CancelSaleButton({ saleId }: { saleId: string }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleCancel() {
    if (!confirm('Cancel this sale? Stock will be restored. This cannot be undone.')) return
    startTransition(async () => {
      const result = await cancelSale(saleId)
      if (result?.error) {
        alert(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <button
      onClick={handleCancel}
      disabled={pending}
      className="flex items-center gap-1.5 shrink-0 border border-error/40 text-error font-bold px-4 py-2.5 rounded-xl hover:bg-error/10 transition-colors text-sm disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-base">cancel</span>
      {pending ? 'Cancelling…' : 'Cancel Sale'}
    </button>
  )
}
