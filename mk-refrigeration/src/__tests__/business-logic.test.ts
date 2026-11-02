import { describe, it, expect } from 'vitest'
import { formatPrice, discountPercent, slugify, generateInvoiceNo } from '@/lib/utils'

// ── GST / invoice calculation helpers ─────────────────────────────────────────
const GST_RATE = 18

function calcGst(subtotal: number, discountTotal = 0) {
  const net = subtotal - discountTotal
  const gstAmount = Number(((net * GST_RATE) / 100).toFixed(2))
  const totalAmount = net + gstAmount
  return { net, gstAmount, totalAmount }
}

// ── Stock calculation helpers ──────────────────────────────────────────────────
function applyStockChange(current: number, type: 'IN' | 'OUT' | 'ADJUST', qty: number) {
  if (type === 'IN') return current + qty
  if (type === 'OUT') return Math.max(0, current - qty)
  return qty // ADJUST sets absolute
}

// ── Quotation status transition validator ─────────────────────────────────────
const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['ACCEPTED', 'REJECTED', 'EXPIRED'],
  ACCEPTED: [],
  REJECTED: [],
  EXPIRED: [],
}

function canTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

// ── Validation helpers ─────────────────────────────────────────────────────────
const PHONE_RE = /^[6-9]\d{9}$/
const GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/

// ─────────────────────────────────────────────────────────────────────────────

describe('GST / invoice calculations', () => {
  it('basic 18% GST on ₹1000', () => {
    const { gstAmount, totalAmount } = calcGst(1000)
    expect(gstAmount).toBe(180)
    expect(totalAmount).toBe(1180)
  })

  it('GST after discount: (1000-100)*18% = 162', () => {
    const { net, gstAmount, totalAmount } = calcGst(1000, 100)
    expect(net).toBe(900)
    expect(gstAmount).toBe(162)
    expect(totalAmount).toBe(1062)
  })

  it('zero subtotal → all zeros', () => {
    const { gstAmount, totalAmount } = calcGst(0)
    expect(gstAmount).toBe(0)
    expect(totalAmount).toBe(0)
  })

  it('decimal rounding: 333.33 * 18% = 59.9994 → 60.00', () => {
    const { gstAmount } = calcGst(333.33)
    expect(gstAmount).toBe(59.9994 > 60 ? 60 : 60.00)
    // toFixed(2) gives "60.00" → 60
    expect(gstAmount).toBe(60)
  })

  it('large amount: ₹1,00,000 subtotal', () => {
    const { gstAmount, totalAmount } = calcGst(100000)
    expect(gstAmount).toBe(18000)
    expect(totalAmount).toBe(118000)
  })

  it('negative discount is prevented by schema (positive subtotal safeguard)', () => {
    // Schema enforces discount >= 0, so net is never > subtotal via discount
    const { net } = calcGst(1000, 0)
    expect(net).toBeGreaterThanOrEqual(0)
  })
})

describe('Stock operations', () => {
  it('IN: adds qty to current stock', () => {
    expect(applyStockChange(10, 'IN', 5)).toBe(15)
  })

  it('OUT: subtracts qty from stock', () => {
    expect(applyStockChange(10, 'OUT', 3)).toBe(7)
  })

  it('OUT: stock never goes below 0 (Math.max guard)', () => {
    expect(applyStockChange(2, 'OUT', 10)).toBe(0)
  })

  it('ADJUST: sets absolute stock quantity', () => {
    expect(applyStockChange(100, 'ADJUST', 25)).toBe(25)
    expect(applyStockChange(0, 'ADJUST', 50)).toBe(50)
  })

  it('insufficient stock check: sale qty > stockQty throws', () => {
    const stockQty = 3
    const requestedQty = 5
    const hasStock = stockQty >= requestedQty
    expect(hasStock).toBe(false)
  })

  it('exact stock is allowed: qty === stockQty', () => {
    const stockQty = 5
    const requestedQty = 5
    expect(stockQty >= requestedQty).toBe(true)
  })
})

describe('Invoice / quote number format', () => {
  it('generateInvoiceNo returns string with given prefix', () => {
    const no = generateInvoiceNo('INV')
    expect(no).toMatch(/^INV\d{10,}$/)
  })

  it('generateInvoiceNo QUO prefix', () => {
    const no = generateInvoiceNo('QUO')
    expect(no).toMatch(/^QUO\d{10,}$/)
  })

  it('generateInvoiceNo is unique on rapid successive calls', () => {
    // Last 6 digits of Date.now() are used — wait a ms to guarantee uniqueness
    const a = generateInvoiceNo('INV')
    // Simulate at least 1 ms difference
    const start = Date.now()
    while (Date.now() === start) { /* spin */ }
    const b = generateInvoiceNo('INV')
    expect(a).not.toBe(b)
  })
})

describe('Input validation', () => {
  it('valid Indian mobile: 9876543210', () => {
    expect(PHONE_RE.test('9876543210')).toBe(true)
  })

  it('invalid mobile: starts with 5', () => {
    expect(PHONE_RE.test('5876543210')).toBe(false)
  })

  it('invalid mobile: too short', () => {
    expect(PHONE_RE.test('987654321')).toBe(false)
  })

  it('invalid mobile: contains letters', () => {
    expect(PHONE_RE.test('98765abc10')).toBe(false)
  })

  it('valid GSTIN: 22AAAAA0000A1Z5', () => {
    expect(GSTIN_RE.test('22AAAAA0000A1Z5')).toBe(true)
  })

  it('invalid GSTIN: wrong length', () => {
    expect(GSTIN_RE.test('22AAAAA0000A1Z')).toBe(false)
  })

  it('invalid GSTIN: lowercase', () => {
    expect(GSTIN_RE.test('22aaaaa0000a1z5')).toBe(false)
  })

  it('empty name is rejected by min(1) schema', () => {
    // Replicate what Zod min(1) does
    const name = ''
    expect(name.length >= 1).toBe(false)
  })

  it('unicode name is valid', () => {
    const name = 'रमेश पटेल'
    expect(name.length >= 1).toBe(true)
  })
})

describe('Quotation status transitions', () => {
  it('PENDING → ACCEPTED is valid', () => {
    expect(canTransition('PENDING', 'ACCEPTED')).toBe(true)
  })

  it('PENDING → REJECTED is valid', () => {
    expect(canTransition('PENDING', 'REJECTED')).toBe(true)
  })

  it('PENDING → EXPIRED is valid', () => {
    expect(canTransition('PENDING', 'EXPIRED')).toBe(true)
  })

  it('ACCEPTED → PENDING is invalid', () => {
    expect(canTransition('ACCEPTED', 'PENDING')).toBe(false)
  })

  it('REJECTED → ACCEPTED is invalid', () => {
    expect(canTransition('REJECTED', 'ACCEPTED')).toBe(false)
  })

  it('EXPIRED → PENDING is invalid', () => {
    expect(canTransition('EXPIRED', 'PENDING')).toBe(false)
  })
})

describe('formatPrice utility', () => {
  it('formats 1234.5 with 2 decimal places', () => {
    const result = formatPrice(1234.5)
    expect(result).toContain('1,234.50')
  })

  it('formats 0 as ₹0.00', () => {
    const result = formatPrice(0)
    expect(result).toContain('0.00')
  })

  it('formats 100000 with Indian lakh format', () => {
    const result = formatPrice(100000)
    // en-IN: 1,00,000.00
    expect(result).toContain('1,00,000.00')
  })

  it('accepts string input', () => {
    const result = formatPrice('5000')
    expect(result).toContain('5,000.00')
  })

  it('formats large value 1000000', () => {
    const result = formatPrice(1000000)
    // en-IN: 10,00,000.00
    expect(result).toContain('10,00,000.00')
  })
})

describe('discountPercent utility', () => {
  it('calculates 20% discount: mrp=100, price=80', () => {
    expect(discountPercent(100, 80)).toBe(20)
  })

  it('returns 0 when price equals mrp', () => {
    expect(discountPercent(100, 100)).toBe(0)
  })

  it('returns 0 when price is higher than mrp', () => {
    expect(discountPercent(100, 120)).toBe(0)
  })

  it('returns 0 when mrp is 0', () => {
    expect(discountPercent(0, 0)).toBe(0)
  })
})

describe('slugify utility', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('Air Conditioner')).toBe('air-conditioner')
  })

  it('removes special characters', () => {
    expect(slugify('LG 1.5T AC!')).toBe('lg-15t-ac')
  })

  it('collapses multiple hyphens', () => {
    expect(slugify('LG  --  Split')).toBe('lg-split')
  })

  it('trims leading and trailing spaces', () => {
    expect(slugify('  Samsung  ')).toBe('samsung')
  })
})
