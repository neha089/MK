'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

const EnquirySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(7, 'Valid phone number required'),
  email: z.string().email().optional().or(z.literal('')),
  message: z.string().optional(),
  product: z.string().optional(),
})

export type EnquiryFormState = { error?: string; success?: boolean } | undefined

export async function submitEnquiry(_: EnquiryFormState, formData: FormData): Promise<EnquiryFormState> {
  const parsed = EnquirySchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    email: formData.get('email') || undefined,
    message: formData.get('message') || undefined,
    product: formData.get('product') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    await prisma.enquiry.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        message: parsed.data.message ?? null,
        product: parsed.data.product ?? null,
      },
    })
    revalidatePath('/admin/enquiries')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to send enquiry' }
  }
}

export async function markEnquiryRead(id: string) {
  await prisma.enquiry.update({ where: { id }, data: { read: true, status: 'READ' } })
  revalidatePath('/admin/enquiries')
}
