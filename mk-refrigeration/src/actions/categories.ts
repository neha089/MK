'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

const Schema = z.object({
  name: z.string().min(2),
  icon: z.string().optional(),
  description: z.string().optional(),
  order: z.coerce.number().int().min(0).optional(),
})

export type CatFormState = { error?: string } | undefined

export async function createCategory(_: CatFormState, formData: FormData): Promise<CatFormState> {
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

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } })
  revalidatePath('/admin/categories')
}
