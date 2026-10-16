'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { SHOP } from '@/lib/constants'
import { logAudit, getClientIp } from '@/lib/audit'
import { checkEnquiryRateLimit } from '@/lib/ratelimit'

async function notifyOwner(name: string, phone: string, product: string | undefined, message: string | undefined) {
  const topic = process.env.NTFY_TOPIC
  if (!topic) return
  const body = [
    `From: ${name} (${phone})`,
    product ? `Product: ${product}` : null,
    message ? `Message: ${message}` : null,
  ].filter(Boolean).join('\n')
  await fetch(`https://ntfy.sh/${topic}`, {
    method: 'POST',
    body,
    headers: {
      Title: `New Enquiry — ${SHOP.name}`,
      Priority: 'high',
      Tags: 'bell,envelope',
    },
  }).catch(() => {})
}

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

  const ip = await getClientIp()
  const { blocked } = await checkEnquiryRateLimit(ip)
  if (blocked) return { error: 'Too many enquiries from your location. Please try again later.' }

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
    void notifyOwner(parsed.data.name, parsed.data.phone, parsed.data.product, parsed.data.message)
    void logAudit({ action: 'ENQUIRY_SUBMIT', ip, meta: parsed.data.name })
    revalidatePath('/admin/enquiries')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to send enquiry' }
  }
}

export async function markEnquiryRead(id: string) {
  await prisma.enquiry.update({ where: { id }, data: { read: true, status: 'CONTACTED' } })
  revalidatePath('/admin/enquiries')
}

export async function updateEnquiryStatus(id: string, status: string) {
  await prisma.enquiry.update({
    where: { id },
    data: { status, read: status !== 'NEW' },
  })
  revalidatePath('/admin/enquiries')
}
