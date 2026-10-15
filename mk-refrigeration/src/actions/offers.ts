'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/session'

const OfferSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  discount: z.coerce.number().int().min(0).max(100).optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
})

export type OfferFormState = { error?: string } | undefined

export async function updateOffer(id: string, _: OfferFormState, formData: FormData): Promise<OfferFormState> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const parsed = OfferSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    discount: formData.get('discount') || undefined,
    validFrom: formData.get('validFrom') || undefined,
    validUntil: formData.get('validUntil') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  await prisma.offer.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      discount: parsed.data.discount ?? null,
      validFrom: parsed.data.validFrom ? new Date(parsed.data.validFrom) : null,
      validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null,
    },
  })

  revalidatePath('/admin/offers')
  redirect('/admin/offers')
}

export async function createOffer(_: OfferFormState, formData: FormData): Promise<OfferFormState> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const parsed = OfferSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    discount: formData.get('discount') || undefined,
    validFrom: formData.get('validFrom') || undefined,
    validUntil: formData.get('validUntil') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  await prisma.offer.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      discount: parsed.data.discount ?? null,
      validFrom: parsed.data.validFrom ? new Date(parsed.data.validFrom) : null,
      validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null,
      active: true,
    },
  })

  revalidatePath('/admin/offers')
  redirect('/admin/offers')
}
