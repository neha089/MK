import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { updateCategory } from '@/actions/categories'
import EditCategoryForm from './_client'

type Props = { params: Promise<{ id: string }> }

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params
  const category = await prisma.category.findUnique({ where: { id } }).catch(() => null)
  if (!category) notFound()

  const action = updateCategory.bind(null, id)
  return <EditCategoryForm initialData={category} action={action} />
}
