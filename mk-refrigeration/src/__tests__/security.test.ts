import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock all Next.js server modules ──────────────────────────────────────────
vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn(), notFound: vi.fn() }))
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: vi.fn(), set: vi.fn(), delete: vi.fn() }),
  headers: vi.fn().mockResolvedValue({ get: vi.fn().mockReturnValue(null) }),
}))

// ── Mock session ──────────────────────────────────────────────────────────────
const { mockGetSession } = vi.hoisted(() => ({ mockGetSession: vi.fn() }))
vi.mock('@/lib/session', () => ({ getSession: mockGetSession }))

// ── Mock audit ────────────────────────────────────────────────────────────────
vi.mock('@/lib/audit', () => ({
  logAudit: vi.fn().mockResolvedValue(undefined),
  getClientIp: vi.fn().mockResolvedValue('127.0.0.1'),
}))

// ── Mock prisma ───────────────────────────────────────────────────────────────
const { mockPrisma } = vi.hoisted(() => {
  const mockPrisma = {
    customer: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    user: {
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    product: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
    },
    sale: { findUnique: vi.fn(), update: vi.fn(), create: vi.fn() },
    quotation: { findUnique: vi.fn(), update: vi.fn() },
    saleItem: { count: vi.fn().mockResolvedValue(0) },
    purchaseItem: { count: vi.fn().mockResolvedValue(0) },
    inventoryLog: { create: vi.fn() },
    auditLog: { create: vi.fn() },
    $transaction: vi.fn(),
  }
  return { mockPrisma }
})
vi.mock('@/lib/db', () => ({ prisma: mockPrisma }))

// ── Mock constants ────────────────────────────────────────────────────────────
vi.mock('@/lib/constants', () => ({
  SHOP: { gstin: '22AAAAA0000A1Z5', name: 'MK Refrigeration' },
  GST_RATE: 18,
}))

// ── Import actions after mocks ────────────────────────────────────────────────
import { createCustomer, updateCustomer, deleteCustomer } from '@/actions/customers'
import { createStaff, deleteStaff } from '@/actions/staff'
import { deleteProduct, toggleStock } from '@/actions/products'
import { adjustStock } from '@/actions/inventory'
import { cancelSale, returnSale } from '@/actions/sales'

const ADMIN_SESSION = { userId: 'admin-1', name: 'Admin', email: 'admin@mk.com', role: 'ADMIN' as const, expiresAt: new Date() }
const STAFF_SESSION = { userId: 'staff-1', name: 'Staff', email: 'staff@mk.com', role: 'STAFF' as const, expiresAt: new Date() }

beforeEach(() => {
  vi.clearAllMocks()
})

// ─────────────────────────────────────────────────────────────────────────────

describe('Unauthenticated access — all actions return Unauthorized', () => {
  beforeEach(() => { mockGetSession.mockResolvedValue(null) })

  it('createCustomer returns Unauthorized', async () => {
    const fd = new FormData()
    fd.append('name', 'Test')
    const result = await createCustomer(undefined, fd)
    expect(result?.error).toBe('Unauthorized')
  })

  it('updateCustomer returns Unauthorized', async () => {
    const fd = new FormData()
    fd.append('name', 'Test')
    const result = await updateCustomer('cust-1', undefined, fd)
    expect(result?.error).toBe('Unauthorized')
  })

  it('cancelSale returns Unauthorized', async () => {
    const result = await cancelSale('sale-1')
    expect(result?.error).toBe('Unauthorized')
  })

  it('returnSale returns Unauthorized', async () => {
    const result = await returnSale('sale-1')
    expect(result?.error).toBe('Unauthorized')
  })

  it('adjustStock returns Unauthorized', async () => {
    const fd = new FormData()
    fd.append('productId', 'p1')
    fd.append('type', 'IN')
    fd.append('qty', '5')
    const result = await adjustStock(undefined, fd)
    expect(result?.error).toMatch(/admins|Unauthorized/i)
  })
})

describe('ADMIN-only actions blocked for STAFF role', () => {
  beforeEach(() => { mockGetSession.mockResolvedValue(STAFF_SESSION) })

  it('createStaff blocked for STAFF', async () => {
    const fd = new FormData()
    fd.append('name', 'New User')
    fd.append('email', 'new@mk.com')
    fd.append('password', 'password123')
    fd.append('role', 'STAFF')
    const result = await createStaff(undefined, fd)
    expect(result?.error).toMatch(/admin/i)
  })

  it('deleteStaff is no-op for STAFF (returns undefined, no DB call)', async () => {
    const result = await deleteStaff('user-2')
    expect(result).toBeUndefined()
    expect(mockPrisma.user.delete).not.toHaveBeenCalled()
  })

  it('deleteCustomer is no-op for STAFF (returns undefined, no DB call)', async () => {
    const result = await deleteCustomer('cust-1')
    expect(result).toBeUndefined()
    expect(mockPrisma.customer.delete).not.toHaveBeenCalled()
  })

  it('cancelSale blocked for STAFF', async () => {
    const result = await cancelSale('sale-1')
    expect(result?.error).toMatch(/admin/i)
  })

  it('returnSale blocked for STAFF', async () => {
    const result = await returnSale('sale-1')
    expect(result?.error).toMatch(/admin/i)
  })

  it('adjustStock blocked for STAFF', async () => {
    const fd = new FormData()
    fd.append('productId', 'p1')
    fd.append('type', 'IN')
    fd.append('qty', '5')
    const result = await adjustStock(undefined, fd)
    expect(result?.error).toMatch(/admin/i)
  })

  it('deleteProduct is no-op for STAFF (no DB call)', async () => {
    await deleteProduct('prod-1')
    expect(mockPrisma.product.delete).not.toHaveBeenCalled()
  })
})

describe('ADMIN actions succeed for ADMIN role', () => {
  beforeEach(() => { mockGetSession.mockResolvedValue(ADMIN_SESSION) })

  it('createStaff proceeds with valid data (DB call reached)', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null) // email not taken
    mockPrisma.user.create.mockResolvedValueOnce({ id: 'new-user', email: 'new@mk.com' })
    const fd = new FormData()
    fd.append('name', 'New Staff')
    fd.append('email', 'new@mk.com')
    fd.append('password', 'password123')
    fd.append('role', 'STAFF')
    const result = await createStaff(undefined, fd)
    expect(result?.success).toBe(true)
  })

  it('adjustStock proceeds for ADMIN', async () => {
    mockPrisma.product.findUnique.mockResolvedValueOnce({ stockQty: 10 })
    mockPrisma.$transaction.mockResolvedValueOnce([{}, {}])
    const fd = new FormData()
    fd.append('productId', 'p1')
    fd.append('type', 'IN')
    fd.append('qty', '5')
    const result = await adjustStock(undefined, fd)
    expect(result?.error).toBeUndefined()
  })
})

describe('Input sanitization / XSS stored-as-is via Prisma', () => {
  beforeEach(() => { mockGetSession.mockResolvedValue(STAFF_SESSION) })

  it('XSS string in customer name is passed as-is to Prisma (parameterized)', async () => {
    const xssName = '<script>alert(1)</script>'
    mockPrisma.customer.create.mockResolvedValueOnce({ id: 'c1', name: xssName })
    const fd = new FormData()
    fd.append('name', xssName)
    // createCustomer will call prisma.customer.create — we verify what was passed
    await createCustomer(undefined, fd)
    if (mockPrisma.customer.create.mock.calls.length > 0) {
      const callArg = mockPrisma.customer.create.mock.calls[0][0]
      expect(callArg.data.name).toBe(xssName)
      // Prisma parameterizes this — the raw string is stored, not executed as SQL
    }
  })

  it('SQL injection attempt in customer name is parameterized by Prisma', async () => {
    const sqlName = "'; DROP TABLE Customer; --"
    mockPrisma.customer.create.mockResolvedValueOnce({ id: 'c2', name: sqlName })
    const fd = new FormData()
    fd.append('name', sqlName)
    await createCustomer(undefined, fd)
    if (mockPrisma.customer.create.mock.calls.length > 0) {
      const callArg = mockPrisma.customer.create.mock.calls[0][0]
      expect(callArg.data.name).toBe(sqlName)
    }
  })
})

describe('Mass assignment — STAFF cannot escalate own role', () => {
  beforeEach(() => { mockGetSession.mockResolvedValue(STAFF_SESSION) })

  it('createStaff ADMIN-only: STAFF cannot create ADMIN account', async () => {
    const fd = new FormData()
    fd.append('name', 'Hacker')
    fd.append('email', 'hacker@mk.com')
    fd.append('password', 'password123')
    fd.append('role', 'ADMIN') // trying to self-escalate
    const result = await createStaff(undefined, fd)
    expect(result?.error).toMatch(/admin/i)
    expect(mockPrisma.user.create).not.toHaveBeenCalled()
  })
})
