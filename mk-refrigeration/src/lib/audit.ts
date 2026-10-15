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
  | 'CREATE_PURCHASE'
  | 'CREATE_QUOTATION'
  | 'CONVERT_QUOTATION'
  | 'ADJUST_STOCK'
  | 'CREATE_STAFF'
  | 'DELETE_STAFF'
  | 'CREATE_OFFER'
  | 'DELETE_OFFER'

export async function getClientIp(): Promise<string> {
  try {
    const h = await headers()
    return (
      h.get('x-forwarded-for')?.split(',')[0].trim() ??
      h.get('x-real-ip') ??
      'unknown'
    )
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
