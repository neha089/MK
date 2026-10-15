'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { generateInvoiceNo } from '@/lib/utils'
import { getSession } from '@/lib/session'

const ItemSchema = z.object({
  productId: z.string(),
  qty: z.coerce.number().int().positive(),
  price: z.coerce.number().positive(),
  discount: z.coerce.number().min(0).optional().default(0),
})

const QuotationSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  validDays: z.coerce.number().int().min(1).default(7),
  notes: z.string().optional(),
  items: z.array(ItemSchema).min(1),
})

export type QuotationFormState = { error?: string; quotationId?: string } | undefined

export async function createQuotation(_: QuotationFormState, formData: FormData): Promise<QuotationFormState> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  let items: z.infer<typeof ItemSchema>[] = []
  try {
    items = JSON.parse(formData.get('items') as string)
  } catch {
    return { error: 'Invalid items data' }
  }

  const parsed = QuotationSchema.safeParse({
    customerName: formData.get('customerName'),
    customerPhone: formData.get('customerPhone') || undefined,
    validDays: formData.get('validDays') || 7,
    notes: formData.get('notes') || undefined,
    items,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const subtotal = parsed.data.items.reduce((s, i) => s + i.qty * i.price, 0)
  const discountTotal = parsed.data.items.reduce((s, i) => s + (i.discount ?? 0), 0)
  const totalAmount = subtotal - discountTotal

  try {
    const quotation = await prisma.quotation.create({
      data: {
        quoteNo: generateInvoiceNo('QUO'),
        userId: session.userId,
        customerName: parsed.data.customerName,
        customerPhone: parsed.data.customerPhone ?? null,
        validDays: parsed.data.validDays,
        subtotal,
        discount: discountTotal,
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

    revalidatePath('/admin/quotations')
    return { quotationId: quotation.id }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to create quotation' }
  }
}

export async function updateQuotationStatus(id: string, status: 'ACCEPTED' | 'REJECTED' | 'EXPIRED') {
  await prisma.quotation.update({ where: { id }, data: { status } })
  revalidatePath('/admin/quotations')
}

export async function convertQuotationToSale(quotationId: string): Promise<void> {
  const session = await getSession()
  if (!session) return

  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { items: true },
  })
  if (!quotation || quotation.status !== 'PENDING') return

  let saleId: string
  try {
    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          invoiceNo: generateInvoiceNo('INV'),
          userId: session.userId,
          customerName: quotation.customerName ?? 'Customer',
          customerPhone: quotation.customerPhone,
          subtotal: Number(quotation.subtotal),
          discount: Number(quotation.discount),
          gstAmount: 0,
          totalAmount: Number(quotation.totalAmount),
          notes: quotation.notes,
          items: {
            create: quotation.items.map((item) => ({
              productId: item.productId,
              qty: item.qty,
              price: Number(item.price),
              discount: Number(item.discount),
            })),
          },
        },
      })

      for (const item of quotation.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: item.qty } },
        })
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            type: 'OUT',
            qty: item.qty,
            refId: newSale.id,
            note: `Sale: ${newSale.invoiceNo} (from ${quotation.quoteNo})`,
          },
        })
      }

      await tx.quotation.update({
        where: { id: quotationId },
        data: { status: 'ACCEPTED' },
      })

      return newSale
    })
    saleId = sale.id
  } catch {
    return
  }

  revalidatePath('/admin/quotations')
  revalidatePath('/admin/sales')
  revalidatePath('/admin/inventory')
  redirect(`/admin/sales/${saleId}/invoice`)
}
