'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/session'
import { logAudit, getClientIp } from '@/lib/audit'

const AdjustSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(['IN', 'OUT', 'ADJUST']),
  qty: z.coerce.number().int().positive('Quantity must be a positive number'),
  note: z.string().optional(),
})

export type AdjustState = { error?: string; fieldErrors?: Record<string, string[]>; success?: boolean } | undefined

export async function adjustStock(_: AdjustState, formData: FormData): Promise<AdjustState> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const parsed = AdjustSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors }

  const { productId, type, qty, note } = parsed.data

  try {
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { stockQty: true } })
    if (!product) return { error: 'Product not found' }

    const newQty =
      type === 'IN' ? product.stockQty + qty :
      type === 'OUT' ? Math.max(0, product.stockQty - qty) :
      qty

    await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { stockQty: newQty, inStock: newQty > 0 },
      }),
      prisma.inventoryLog.create({
        data: { productId, type, qty, note: note || null },
      }),
    ])
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Adjustment failed' }
  }

  const ip = await getClientIp()
  await logAudit({
    action: 'ADJUST_STOCK',
    userId: session.userId,
    userEmail: session.email,
    entity: 'Product',
    entityId: productId,
    meta: `${type} ${qty}${note ? ` — ${note}` : ''}`,
    ip,
  })

  revalidatePath('/admin/inventory')
  return { success: true }
}
