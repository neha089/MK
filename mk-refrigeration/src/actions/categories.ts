'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/session'

const Schema = z.object({
  name: z.string().min(2),
  icon: z.string().optional(),
  description: z.string().optional(),
  order: z.coerce.number().int().min(0).optional(),
})

export type CatFormState = { error?: string } | undefined

export async function createCategory(_: CatFormState, formData: FormData): Promise<CatFormState> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }
  const parsed = Schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { name, ...rest } = parsed.data
  try {
    await prisma.category.create({ data: { name, slug: slugify(name), ...rest } })
  } catch {
    return { error: 'Category already exists.' }
  }

  revalidatePath('/admin/categories')
  redirect('/admin/categories')
}

export async function updateCategory(id: string, _: CatFormState, formData: FormData): Promise<CatFormState> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }
  const parsed = Schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { name, ...rest } = parsed.data
  try {
    await prisma.category.update({ where: { id }, data: { name, slug: slugify(name), ...rest } })
  } catch {
    return { error: 'Failed to update. Name may already be taken.' }
  }

  revalidatePath('/admin/categories')
  redirect('/admin/categories')
}

export async function deleteCategory(id: string) {
  const session = await getSession()
  if (!session) return
  await prisma.category.delete({ where: { id } })
  revalidatePath('/admin/categories')
}
