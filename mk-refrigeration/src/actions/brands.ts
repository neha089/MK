'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

const Schema = z.object({
  name: z.string().min(1),
  logo: z.string().url().optional().or(z.literal('')),
  featured: z.coerce.boolean().optional(),
})

export type BrandFormState = { error?: string } | undefined

export async function createBrand(_: BrandFormState, formData: FormData): Promise<BrandFormState> {
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

export async function deleteBrand(id: string) {
  await prisma.brand.delete({ where: { id } })
  revalidatePath('/admin/brands')
}
