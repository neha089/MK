'use client'

import { useTransition } from 'react'
import { returnSale } from '@/actions/sales'
import { useRouter } from 'next/navigation'

export default function ReturnSaleButton({ saleId }: { saleId: string }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleReturn() {
    if (!confirm('Mark this sale as returned? Stock will be restored. This cannot be undone.')) return
    startTransition(async () => {
      const result = await returnSale(saleId)
      if (result?.error) {
        alert(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <button
      onClick={handleReturn}
      disabled={pending}
      className="flex items-center gap-1.5 shrink-0 border border-warning/40 text-warning font-bold px-4 py-2.5 rounded-xl hover:bg-warning/10 transition-colors text-sm disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-base">assignment_return</span>
      {pending ? 'Processing…' : 'Return Sale'}
    </button>
  )
}
