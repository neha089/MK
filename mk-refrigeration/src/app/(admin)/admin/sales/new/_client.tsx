'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSale } from '@/actions/sales'
import BillingForm from '@/components/admin/BillingForm'

type Product = { id: string; name: string; price: number; mrp: number | null; model: string | null; brand: { name: string } | null }

export default function NewSaleClient({ products }: { products: Product[] }) {
  const router = useRouter()
  const [state, action, pending] = useActionState(createSale, undefined)

  useEffect(() => {
    if (state?.saleId) router.push('/admin/sales')
  }, [state?.saleId, router])

  return <BillingForm products={products} mode="sale" action={action} pending={pending} error={state?.error} />
}
