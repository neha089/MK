'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { generateInvoiceNo } from '@/lib/utils'
import { getSession } from '@/lib/session'

const SaleItemSchema = z.object({
  productId: z.string(),
  qty: z.coerce.number().int().positive(),
  price: z.coerce.number().positive(),
  discount: z.coerce.number().min(0).optional().default(0),
})

const SaleSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(SaleItemSchema).min(1),
})

export type SaleFormState = { error?: string; saleId?: string } | undefined

export async function createSale(_: SaleFormState, formData: FormData): Promise<SaleFormState> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  let items: z.infer<typeof SaleItemSchema>[] = []
  try {
    items = JSON.parse(formData.get('items') as string)
  } catch {
    return { error: 'Invalid items data' }
  }

  const parsed = SaleSchema.safeParse({
    customerName: formData.get('customerName'),
    customerPhone: formData.get('customerPhone') || undefined,
    notes: formData.get('notes') || undefined,
    items,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const subtotal = parsed.data.items.reduce((s, i) => s + i.qty * i.price, 0)
  const discountTotal = parsed.data.items.reduce((s, i) => s + (i.discount ?? 0), 0)
  const totalAmount = subtotal - discountTotal

  try {
    const sale = await prisma.$transaction(async (tx) => {
      for (const item of parsed.data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stockQty: true, name: true },
        })
        if (!product) throw new Error(`Product not found`)
        if (product.stockQty < item.qty) {
          throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stockQty}`)
        }
      }

      const saleRecord = await tx.sale.create({
        data: {
          invoiceNo: generateInvoiceNo('INV'),
          userId: session.userId,
          customerName: parsed.data.customerName,
          customerPhone: parsed.data.customerPhone ?? null,
          subtotal,
          discount: discountTotal,
          gstAmount: 0,
          totalAmount,
          notes: parsed.data.notes ?? null,
          items: {
            create: parsed.data.items.map((item) => ({
              productId: item.productId,
              qty: item.qty,
              price: item.price,
              discount: item.discount ?? 0,
            })),
          },
        },
      })

      for (const item of parsed.data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: item.qty } },
        })
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            type: 'OUT',
            qty: item.qty,
            refId: saleRecord.id,
            note: `Sale: ${saleRecord.invoiceNo}`,
          },
        })
      }

      return saleRecord
    })

    revalidatePath('/admin/sales')
    revalidatePath('/admin/inventory')
    return { saleId: sale.id }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to create sale' }
  }
}
