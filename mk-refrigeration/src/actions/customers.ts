'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'

const CustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  gstin: z.string().optional(),
})

export type CustomerFormState = { error?: string; fieldErrors?: Record<string, string[]>; success?: boolean } | undefined

export async function createCustomer(_: CustomerFormState, formData: FormData): Promise<CustomerFormState> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }
  const parsed = CustomerSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors }

  try {
    const customer = await prisma.customer.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        email: parsed.data.email || null,
        address: parsed.data.address || null,
        gstin: parsed.data.gstin || null,
      },
    })
    revalidatePath('/admin/customers')
    redirect(`/admin/customers/${customer.id}`)
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to create customer' }
  }
}

export async function updateCustomer(id: string, _: CustomerFormState, formData: FormData): Promise<CustomerFormState> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }
  const parsed = CustomerSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors }

  try {
    await prisma.customer.update({
      where: { id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        email: parsed.data.email || null,
        address: parsed.data.address || null,
        gstin: parsed.data.gstin || null,
      },
    })
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Update failed' }
  }

  revalidatePath(`/admin/customers/${id}`)
  revalidatePath('/admin/customers')
  return { success: true }
}
