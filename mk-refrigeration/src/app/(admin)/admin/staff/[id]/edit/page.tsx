import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { updateStaff } from '@/actions/staff'
import EditStaffForm from './_client'

type Props = { params: Promise<{ id: string }> }

export default async function EditStaffPage({ params }: Props) {
  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  }).catch(() => null)
  if (!user) notFound()

  const action = updateStaff.bind(null, id)
  return <EditStaffForm initialData={user} action={action} />
}
