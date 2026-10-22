'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createQuotation } from '@/actions/quotations'
import BillingForm from '@/components/admin/BillingForm'

type Product = { id: string; name: string; price: number; mrp: number | null; model: string | null; brand: { name: string } | null }

export default function NewQuotationClient({ products }: { products: Product[] }) {
  const router = useRouter()
  const [state, action, pending] = useActionState(createQuotation, undefined)

  useEffect(() => {
    if (state?.quotationId) router.push('/admin/quotations')
  }, [state?.quotationId, router])

  return <BillingForm products={products} mode="quotation" action={action} pending={pending} error={state?.error} />
}
