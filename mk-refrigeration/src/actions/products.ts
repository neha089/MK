'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/session'

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
})

function parseImages(formData: FormData): string[] {
  try {
    const raw = formData.get('images')
    if (!raw) return []
    const parsed = JSON.parse(raw as string)
    if (Array.isArray(parsed)) return parsed.filter((u) => typeof u === 'string')
    return []
  } catch {
    return []
  }
}

export type ProductFormState = { error?: string; fieldErrors?: Record<string, string[]> } | undefined

export async function createProduct(_: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }
  const raw = Object.fromEntries(formData)
  const parsed = ProductSchema.safeParse({
    ...raw,
    featured: raw.featured === 'on',
    inStock: raw.inStock !== 'off',
  })
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors }

  const { name, ...rest } = parsed.data
  const slug = slugify(name)
  const images = parseImages(formData)

  try {
    await prisma.product.create({
      data: {
        name,
        slug,
        ...rest,
        images,
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
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }
  const raw = Object.fromEntries(formData)
  const parsed = ProductSchema.safeParse({
    ...raw,
    featured: raw.featured === 'on',
    inStock: raw.inStock !== 'off',
  })
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors }

  const images = parseImages(formData)

  try {
    await prisma.product.update({
      where: { id },
      data: { ...parsed.data, images, mrp: parsed.data.mrp ?? null },
    })
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Update failed' }
  }

  revalidatePath('/admin/products')
  redirect('/admin/products')
}

export async function deleteProduct(id: string) {
  const session = await getSession()
  if (!session) return

  const [saleCount, purchaseCount] = await Promise.all([
    prisma.saleItem.count({ where: { productId: id } }),
    prisma.purchaseItem.count({ where: { productId: id } }),
  ])

  if (saleCount > 0 || purchaseCount > 0) {
    throw new Error(
      `Cannot delete: this product appears in ${saleCount} sale(s) and ${purchaseCount} purchase(s). ` +
      `Mark it as "Out of Stock" instead.`
    )
  }

  await prisma.product.delete({ where: { id } })
  revalidatePath('/admin/products')
}

export async function toggleStock(id: string, inStock: boolean) {
  const session = await getSession()
  if (!session) return
  await prisma.product.update({ where: { id }, data: { inStock } })
  revalidatePath('/admin/products')
}
