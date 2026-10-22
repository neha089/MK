import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { updateBrand } from '@/actions/brands'
import EditBrandForm from './_client'

type Props = { params: Promise<{ id: string }> }

export default async function EditBrandPage({ params }: Props) {
  const { id } = await params
  const brand = await prisma.brand.findUnique({ where: { id } }).catch(() => null)
  if (!brand) notFound()

  const action = updateBrand.bind(null, id)
  return <EditBrandForm initialData={brand} action={action} />
}
