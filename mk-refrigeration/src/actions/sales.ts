'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { generateInvoiceNo } from '@/lib/utils'
import { getSession } from '@/lib/session'
import { SHOP, GST_RATE } from '@/lib/constants'
import { logAudit, getClientIp } from '@/lib/audit'

const SaleItemSchema = z.object({
  productId: z.string(),
  qty: z.coerce.number().int().positive(),
  price: z.coerce.number().positive(),
  discount: z.coerce.number().min(0).optional().default(0),
})

const SaleSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  paymentMode: z.enum(['CASH', 'CARD', 'UPI', 'CREDIT']).default('CASH'),
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
    paymentMode: formData.get('paymentMode') || 'CASH',
    notes: formData.get('notes') || undefined,
    items,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const subtotal = parsed.data.items.reduce((s, i) => s + i.qty * i.price, 0)
  const discountTotal = parsed.data.items.reduce((s, i) => s + (i.discount ?? 0), 0)
  const netAmount = subtotal - discountTotal
  const gstAmount = SHOP.gstin
    ? Number(((netAmount * GST_RATE) / 100).toFixed(2))
    : 0
  const totalAmount = netAmount + gstAmount

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

      // Find or create customer when phone is provided
      let customerId: string | null = null
      if (parsed.data.customerPhone) {
        let customer = await tx.customer.findFirst({
          where: { phone: parsed.data.customerPhone },
          select: { id: true },
        })
        if (!customer) {
          customer = await tx.customer.create({
            data: { name: parsed.data.customerName, phone: parsed.data.customerPhone },
          })
        }
        customerId = customer.id
      }

      const saleRecord = await tx.sale.create({
        data: {
          invoiceNo: generateInvoiceNo('INV'),
          userId: session.userId,
          customerId,
          customerName: parsed.data.customerName,
          customerPhone: parsed.data.customerPhone ?? null,
          paymentMode: parsed.data.paymentMode,
          subtotal,
          discount: discountTotal,
          gstAmount,
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

    const ip = await getClientIp()
    await logAudit({
      action: 'CREATE_SALE',
      userId: session.userId,
      userEmail: session.email,
      entity: 'Sale',
      entityId: sale.id,
      meta: sale.invoiceNo,
      ip,
    })

    revalidatePath('/admin/sales')
    revalidatePath('/admin/inventory')
    return { saleId: sale.id }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to create sale' }
  }
}

export type CancelSaleState = { error?: string; success?: boolean } | undefined

export async function cancelSale(id: string): Promise<CancelSaleState> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }
  if (session.role !== 'ADMIN') return { error: 'Only admins can cancel sales' }

  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { items: { select: { productId: true, qty: true } } },
    })
    if (!sale) return { error: 'Sale not found' }
    if (sale.status === 'CANCELLED') return { error: 'Sale is already cancelled' }

    await prisma.$transaction(async (tx) => {
      await tx.sale.update({ where: { id }, data: { status: 'CANCELLED' } })
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { increment: item.qty } },
        })
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            type: 'IN',
            qty: item.qty,
            refId: id,
            note: `Cancelled: ${sale.invoiceNo}`,
          },
        })
      }
    })

    const ip = await getClientIp()
    await logAudit({
      action: 'CANCEL_SALE',
      userId: session.userId,
      userEmail: session.email,
      entity: 'Sale',
      entityId: id,
      meta: sale.invoiceNo,
      ip,
    })

    revalidatePath('/admin/sales')
    revalidatePath(`/admin/sales/${id}`)
    revalidatePath('/admin/inventory')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to cancel sale' }
  }
}

export type ReturnSaleState = { error?: string; success?: boolean } | undefined

export async function returnSale(id: string): Promise<ReturnSaleState> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }
  if (session.role !== 'ADMIN') return { error: 'Only admins can return sales' }

  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { items: { select: { productId: true, qty: true } } },
    })
    if (!sale) return { error: 'Sale not found' }
    if (sale.status !== 'COMPLETED') return { error: 'Only completed sales can be returned' }

    await prisma.$transaction(async (tx) => {
      await tx.sale.update({ where: { id }, data: { status: 'RETURNED' } })
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { increment: item.qty }, inStock: true },
        })
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            type: 'IN',
            qty: item.qty,
            refId: id,
            note: `Returned: ${sale.invoiceNo}`,
          },
        })
      }
    })

    const ip = await getClientIp()
    await logAudit({
      action: 'RETURN_SALE',
      userId: session.userId,
      userEmail: session.email,
      entity: 'Sale',
      entityId: id,
      meta: sale.invoiceNo,
      ip,
    })

    revalidatePath('/admin/sales')
    revalidatePath(`/admin/sales/${id}`)
    revalidatePath('/admin/inventory')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to return sale' }
  }
}
