'use server'

import { prisma } from './db'
import { headers } from 'next/headers'

export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAIL'
  | 'LOGOUT'
  | 'ENQUIRY_SUBMIT'
  | 'CREATE_PRODUCT'
  | 'UPDATE_PRODUCT'
  | 'DELETE_PRODUCT'
  | 'CREATE_SALE'
  | 'CANCEL_SALE'
  | 'RETURN_SALE'
  | 'CREATE_PURCHASE'
  | 'UPDATE_PURCHASE'
  | 'CREATE_QUOTATION'
  | 'UPDATE_QUOTATION'
  | 'CONVERT_QUOTATION'
  | 'ADJUST_STOCK'
  | 'CREATE_STAFF'
  | 'DELETE_STAFF'
  | 'CREATE_OFFER'
  | 'DELETE_OFFER'
  | 'DELETE_CUSTOMER'

export async function getClientIp(): Promise<string> {
  try {
    const h = await headers()
    // Vercel sets x-vercel-forwarded-for from the edge; cannot be spoofed by clients
    const vercelIp = h.get('x-vercel-forwarded-for')
    if (vercelIp) return vercelIp.split(',')[0].trim()
    // Fallback: last entry in x-forwarded-for is added by the nearest trusted proxy
    const forwarded = h.get('x-forwarded-for')
    if (forwarded) {
      const parts = forwarded.split(',')
      return parts[parts.length - 1].trim()
    }
    return h.get('x-real-ip') ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

export async function logAudit(params: {
  action: AuditAction
  userId?: string
  userEmail?: string
  entity?: string
  entityId?: string
  meta?: string
  ip?: string
}) {
  try {
    await prisma.auditLog.create({ data: params })
  } catch {
    // Never let audit logging break the main flow
  }
}
