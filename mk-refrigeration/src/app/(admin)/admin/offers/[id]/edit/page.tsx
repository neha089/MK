import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { updateOffer } from '@/actions/offers'
import EditOfferForm from './_client'

type Props = { params: Promise<{ id: string }> }

export default async function EditOfferPage({ params }: Props) {
  const { id } = await params
  const offer = await prisma.offer.findUnique({ where: { id } }).catch(() => null)
  if (!offer) notFound()

  const action = updateOffer.bind(null, id)
  return <EditOfferForm initialData={offer} action={action} />
}
