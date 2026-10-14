'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { generateInvoiceNo } from '@/lib/utils'
import { getSession } from '@/lib/session'

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

  try {
    const purchase = await prisma.purchase.create({
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
      await prisma.product.update({
        where: { id: item.productId },
        data: { stockQty: { increment: item.qty }, inStock: true },
      })
      await prisma.inventoryLog.create({
        data: {
          productId: item.productId,
          type: 'IN',
          qty: item.qty,
          refId: purchase.id,
          note: `Purchase: ${purchase.invoiceNo}`,
        },
      })
    }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to create purchase' }
  }

  revalidatePath('/admin/purchases')
  revalidatePath('/admin/inventory')
  redirect('/admin/purchases')
}
