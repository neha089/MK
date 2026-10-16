'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/session'

const Schema = z.object({
  name: z.string().min(1),
  logo: z.string().url().optional().or(z.literal('')),
  featured: z.coerce.boolean().optional(),
})

export type BrandFormState = { error?: string } | undefined

export async function createBrand(_: BrandFormState, formData: FormData): Promise<BrandFormState> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }
  const raw = Object.fromEntries(formData)
  const parsed = Schema.safeParse({ ...raw, featured: raw.featured === 'on' })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { name, logo, ...rest } = parsed.data
  try {
    await prisma.brand.create({ data: { name, slug: slugify(name), logo: logo || null, ...rest } })
  } catch {
    return { error: 'Brand already exists.' }
  }

  revalidatePath('/admin/brands')
  redirect('/admin/brands')
}

export async function updateBrand(id: string, _: BrandFormState, formData: FormData): Promise<BrandFormState> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }
  const raw = Object.fromEntries(formData)
  const parsed = Schema.safeParse({ ...raw, featured: raw.featured === 'on' })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { name, logo, ...rest } = parsed.data
  try {
    await prisma.brand.update({ where: { id }, data: { name, slug: slugify(name), logo: logo || null, ...rest } })
  } catch {
    return { error: 'Failed to update. Name may already be taken.' }
  }

  revalidatePath('/admin/brands')
  redirect('/admin/brands')
}

export async function deleteBrand(id: string) {
  const session = await getSession()
  if (!session) return
  await prisma.brand.delete({ where: { id } })
  revalidatePath('/admin/brands')
}
