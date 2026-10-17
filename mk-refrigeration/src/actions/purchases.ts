'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { generateInvoiceNo } from '@/lib/utils'
import { getSession } from '@/lib/session'
import { logAudit, getClientIp } from '@/lib/audit'

const PurchaseItemSchema = z.object({
  productId: z.string(),
  qty: z.coerce.number().int().positive(),
  costPrice: z.coerce.number().positive(),
})

const PurchaseSchema = z.object({
  supplierId: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(PurchaseItemSchema).min(1),
})

export type PurchaseFormState = { error?: string } | undefined

export async function createPurchase(_: PurchaseFormState, formData: FormData): Promise<PurchaseFormState> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const itemsRaw = formData.get('items')
  let items: z.infer<typeof PurchaseItemSchema>[] = []
  try {
    items = JSON.parse(itemsRaw as string)
  } catch {
    return { error: 'Invalid items data' }
  }

  const parsed = PurchaseSchema.safeParse({
    supplierId: formData.get('supplierId') || undefined,
    notes: formData.get('notes') || undefined,
    items,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const totalAmount = parsed.data.items.reduce((s, i) => s + i.qty * i.costPrice, 0)

  let purchaseId: string
  try {
    const purchase = await prisma.$transaction(async (tx) => {
      const p = await tx.purchase.create({
        data: {
          invoiceNo: generateInvoiceNo('PUR'),
          userId: session.userId,
          supplierId: parsed.data.supplierId ?? null,
          totalAmount,
          notes: parsed.data.notes ?? null,
          items: {
            create: parsed.data.items.map((item) => ({
              productId: item.productId,
              qty: item.qty,
              costPrice: item.costPrice,
            })),
          },
        },
      })

      for (const item of parsed.data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { increment: item.qty }, inStock: true },
        })
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            type: 'IN',
            qty: item.qty,
            refId: p.id,
            note: `Purchase: ${p.invoiceNo}`,
          },
        })
      }

      return p
    })
    purchaseId = purchase.id

    const ip = await getClientIp()
    await logAudit({
      action: 'CREATE_PURCHASE',
      userId: session.userId,
      userEmail: session.email,
      entity: 'Purchase',
      entityId: purchaseId,
      meta: purchase.invoiceNo ?? undefined,
      ip,
    })
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to create purchase' }
  }

  revalidatePath('/admin/purchases')
  revalidatePath('/admin/inventory')
  redirect('/admin/purchases')
}

const UpdatePurchaseSchema = z.object({
  supplierId: z.string().optional(),
  notes: z.string().optional(),
  purchaseDate: z.string().optional(),
})

export type UpdatePurchaseState = { error?: string; success?: boolean } | undefined

export async function updatePurchase(id: string, _: UpdatePurchaseState, formData: FormData): Promise<UpdatePurchaseState> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const parsed = UpdatePurchaseSchema.safeParse({
    supplierId: formData.get('supplierId') || undefined,
    notes: formData.get('notes') || undefined,
    purchaseDate: formData.get('purchaseDate') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    await prisma.purchase.update({
      where: { id },
      data: {
        supplierId: parsed.data.supplierId ?? null,
        notes: parsed.data.notes ?? null,
        purchaseDate: parsed.data.purchaseDate ? new Date(parsed.data.purchaseDate) : undefined,
      },
    })

    const ip = await getClientIp()
    await logAudit({
      action: 'UPDATE_PURCHASE',
      userId: session.userId,
      userEmail: session.email,
      entity: 'Purchase',
      entityId: id,
      ip,
    })
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to update purchase' }
  }

  revalidatePath(`/admin/purchases/${id}`)
  revalidatePath('/admin/purchases')
  return { success: true }
}
