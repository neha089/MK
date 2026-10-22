'use client'

interface Item {
  id: string
  qty: number
  price: number
  discount: number
  product: { name: string; model: string | null }
}

interface Quotation {
  id: string
  quoteNo: string
  customerName: string | null
  customerPhone: string | null
  validDays: number
  subtotal: number
  discount: number
  totalAmount: number
  notes: string | null
  status: string
  createdAt: Date
  items: Item[]
  createdBy: { name: string }
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n)
}

export default function PrintQuotation({ quotation }: { quotation: Quotation }) {
  const date = new Date(quotation.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
  const validUntil = new Date(quotation.createdAt)
  validUntil.setDate(validUntil.getDate() + quotation.validDays)
  const validUntilStr = validUntil.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })

  const statusColor: Record<string, string> = {
    PENDING: '#F57C00',
    ACCEPTED: '#2E7D32',
    REJECTED: '#C62828',
    EXPIRED: '#757575',
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          @page { margin: 15mm; size: A4; }
        }
        body { background: #f5f5f5; font-family: 'Segoe UI', Arial, sans-serif; }
        .invoice-wrap { max-width: 800px; margin: 0 auto; background: #fff; }
        @media screen { .invoice-wrap { margin: 24px auto; box-shadow: 0 4px 24px rgba(0,0,0,.12); border-radius: 12px; overflow: hidden; } }
      `}</style>

      <div className="no-print" style={{ position: 'sticky', top: 0, zIndex: 10, background: '#1B5E20', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => window.history.back()}
          style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
        >
          ← Back
        </button>
        <span style={{ color: '#fff', fontWeight: 700, flex: 1, fontSize: 15 }}>Quotation {quotation.quoteNo}</span>
        <button
          onClick={() => window.print()}
          style={{ background: '#fff', border: 'none', color: '#1B5E20', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
        >
          🖨 Print / Save PDF
        </button>
      </div>

      <div className="invoice-wrap" style={{ padding: '40px 48px' }}>

        {/* Header */}
        <table style={{ width: '100%', marginBottom: 32 }}>
          <tbody>
            <tr>
              <td style={{ verticalAlign: 'top' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 44, height: 44, background: '#1565C0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontSize: 22 }}>❄</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', letterSpacing: -.5 }}>MK Refrigeration</div>
                    <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>Wholesale &amp; Retail</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#555', lineHeight: 1.7 }}>
                  Bharuch, Gujarat — 392001<br />
                  📞 9898088292<br />
                  AC • Fridge • Washing Machine • Air Cooler
                </div>
              </td>
              <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                <div style={{ display: 'inline-block', background: '#F1F8E9', borderRadius: 10, padding: '16px 24px' }}>
                  <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Quotation</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#2E7D32', fontFamily: 'monospace' }}>{quotation.quoteNo}</div>
                  <div style={{ fontSize: 12, color: '#555', marginTop: 8 }}>Date: {date}</div>
                  <div style={{ fontSize: 12, color: '#555', marginTop: 3 }}>Valid until: {validUntilStr}</div>
                  <div style={{ marginTop: 8, display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: (statusColor[quotation.status] || '#888') + '22', color: statusColor[quotation.status] || '#888' }}>
                    {quotation.status}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ height: 2, background: 'linear-gradient(90deg,#2E7D32,#81C784)', borderRadius: 2, marginBottom: 28 }} />

        {/* Quote To */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Quote To</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>{quotation.customerName || 'Valued Customer'}</div>
          {quotation.customerPhone && (
            <div style={{ fontSize: 13, color: '#555', marginTop: 3 }}>📞 {quotation.customerPhone}</div>
          )}
          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
            Prepared by: <span style={{ fontWeight: 600, color: '#333' }}>{quotation.createdBy.name}</span>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 28 }}>
          <thead>
            <tr style={{ background: '#2E7D32', color: '#fff' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, borderRadius: '6px 0 0 6px' }}>#</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 }}>Product</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 }}>Qty</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 }}>Rate</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 }}>Disc.</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, borderRadius: '0 6px 6px 0' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items.map((item, idx) => {
              const amount = item.qty * item.price - item.discount
              return (
                <tr key={item.id} style={{ background: idx % 2 === 0 ? '#fff' : '#F9FBE7', borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: '#888' }}>{idx + 1}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{item.product.name}</div>
                    {item.product.model && <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>Model: {item.product.model}</div>}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>{item.qty}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13 }}>{fmt(item.price)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, color: '#d32f2f' }}>
                    {item.discount > 0 ? `-${fmt(item.discount)}` : '—'}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{fmt(amount)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
          <div style={{ minWidth: 260 }}>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '5px 0', fontSize: 13, color: '#555' }}>Subtotal</td>
                  <td style={{ padding: '5px 0', textAlign: 'right', fontSize: 13, color: '#333' }}>{fmt(quotation.subtotal)}</td>
                </tr>
                {quotation.discount > 0 && (
                  <tr>
                    <td style={{ padding: '5px 0', fontSize: 13, color: '#d32f2f' }}>Discount</td>
                    <td style={{ padding: '5px 0', textAlign: 'right', fontSize: 13, color: '#d32f2f' }}>−{fmt(quotation.discount)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={2} style={{ paddingTop: 8 }}>
                    <div style={{ height: 1, background: '#ddd' }} />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 16px', fontSize: 16, fontWeight: 800, color: '#fff', background: '#2E7D32', borderRadius: '6px 0 0 6px' }}>Total</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', fontSize: 16, fontWeight: 800, color: '#fff', background: '#2E7D32', borderRadius: '0 6px 6px 0' }}>{fmt(quotation.totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        {quotation.notes && (
          <div style={{ background: '#FFFDE7', border: '1px solid #FDD835', borderRadius: 8, padding: '12px 16px', marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Notes</div>
            <div style={{ fontSize: 13, color: '#333' }}>{quotation.notes}</div>
          </div>
        )}

        {/* T&C */}
        <div style={{ background: '#F5F5F5', borderRadius: 8, padding: '12px 16px', marginBottom: 24, fontSize: 11, color: '#666', lineHeight: 1.8 }}>
          <strong>Terms &amp; Conditions:</strong><br />
          1. This quotation is valid for {quotation.validDays} days from the date of issue.<br />
          2. Prices are subject to change without prior notice after the validity period.<br />
          3. Delivery charges may apply depending on location.
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontSize: 11, color: '#aaa' }}>
            This is a computer-generated quotation.<br />
            For queries: 9898088292
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ height: 60, borderBottom: '1px solid #333', width: 150, marginBottom: 6 }} />
            <div style={{ fontSize: 11, color: '#555' }}>Authorised Signatory</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#333' }}>MK Refrigeration</div>
          </div>
        </div>

      </div>
    </>
  )
}
