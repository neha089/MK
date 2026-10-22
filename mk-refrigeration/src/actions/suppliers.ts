'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/session'

const SupplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  gstin: z.string().optional(),
})

export type SupplierFormState = { error?: string; success?: boolean } | undefined

export async function createSupplier(_: SupplierFormState, formData: FormData): Promise<SupplierFormState> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }
  const parsed = SupplierSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone') || undefined,
    email: formData.get('email') || undefined,
    address: formData.get('address') || undefined,
    gstin: formData.get('gstin') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    await prisma.supplier.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone ?? null,
        email: parsed.data.email || null,
        address: parsed.data.address ?? null,
        gstin: parsed.data.gstin ?? null,
      },
    })
    revalidatePath('/admin/suppliers')
    revalidatePath('/admin/purchases/new')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to create supplier' }
  }
}

export async function updateSupplier(id: string, _: SupplierFormState, formData: FormData): Promise<SupplierFormState> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }
  const parsed = SupplierSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone') || undefined,
    email: formData.get('email') || undefined,
    address: formData.get('address') || undefined,
    gstin: formData.get('gstin') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    await prisma.supplier.update({
      where: { id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone ?? null,
        email: parsed.data.email || null,
        address: parsed.data.address ?? null,
        gstin: parsed.data.gstin ?? null,
      },
    })
    revalidatePath('/admin/suppliers')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to update supplier' }
  }
}

export async function deleteSupplier(id: string) {
  const session = await getSession()
  if (!session) return
  await prisma.supplier.delete({ where: { id } })
  revalidatePath('/admin/suppliers')
  revalidatePath('/admin/purchases/new')
}
