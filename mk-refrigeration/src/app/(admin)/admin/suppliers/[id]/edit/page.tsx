import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { updateSupplier } from '@/actions/suppliers'
import EditSupplierForm from './_client'

type Props = { params: Promise<{ id: string }> }

export default async function EditSupplierPage({ params }: Props) {
  const { id } = await params
  const supplier = await prisma.supplier.findUnique({ where: { id } }).catch(() => null)
  if (!supplier) notFound()

  const action = updateSupplier.bind(null, id)
  return <EditSupplierForm initialData={supplier} action={action} />
}
