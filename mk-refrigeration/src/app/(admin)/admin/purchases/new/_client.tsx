'use client'

import { useActionState } from 'react'
import { createPurchase } from '@/actions/purchases'
import PurchaseForm from '@/components/admin/PurchaseForm'

type Product = { id: string; name: string; model: string | null; brand: { name: string } | null }
type Supplier = { id: string; name: string }

export default function NewPurchaseClient({ products, suppliers }: { products: Product[]; suppliers: Supplier[] }) {
  const [state, action, pending] = useActionState(createPurchase, undefined)

  return <PurchaseForm products={products} suppliers={suppliers} action={action} pending={pending} error={state?.error} />
}
