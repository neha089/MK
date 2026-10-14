'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

const ProductSchema = z.object({
  name: z.string().min(2),
  brandId: z.string().min(1),
  categoryId: z.string().min(1),
  model: z.string().optional(),
  capacity: z.string().optional(),
  starRating: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  mrp: z.coerce.number().optional(),
  featured: z.coerce.boolean().optional(),
  inStock: z.coerce.boolean().optional(),
  stockQty: z.coerce.number().int().min(0).optional(),
  barcode: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
})

export type ProductFormState = { error?: string; fieldErrors?: Record<string, string[]> } | undefined

export async function createProduct(_: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const raw = Object.fromEntries(formData)
  const parsed = ProductSchema.safeParse({
    ...raw,
    featured: raw.featured === 'on',
    inStock: raw.inStock !== 'off',
  })
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors }

  const { name, imageUrl, ...rest } = parsed.data
  const slug = slugify(name)

  try {
    await prisma.product.create({
      data: {
        name,
        slug,
        ...rest,
        images: imageUrl ? [imageUrl] : [],
        mrp: rest.mrp ?? null,
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create product'
    if (msg.includes('Unique constraint') && msg.includes('slug')) {
      return { error: 'A product with this name already exists. Use a more specific name.' }
    }
    return { error: msg }
  }

  revalidatePath('/admin/products')
  redirect('/admin/products')
}

export async function updateProduct(id: string, _: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const raw = Object.fromEntries(formData)
  const parsed = ProductSchema.safeParse({
    ...raw,
    featured: raw.featured === 'on',
    inStock: raw.inStock !== 'off',
  })
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors }

  const { imageUrl, ...rest } = parsed.data

  try {
    const existing = await prisma.product.findUnique({ where: { id } })
    const images = imageUrl
      ? [imageUrl, ...(existing?.images ?? []).filter((i) => i !== imageUrl)]
      : existing?.images ?? []

    await prisma.product.update({
      where: { id },
      data: { ...rest, images, mrp: rest.mrp ?? null },
    })
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Update failed' }
  }

  revalidatePath('/admin/products')
  redirect('/admin/products')
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } })
  revalidatePath('/admin/products')
}

export async function toggleStock(id: string, inStock: boolean) {
  await prisma.product.update({ where: { id }, data: { inStock } })
  revalidatePath('/admin/products')
}
