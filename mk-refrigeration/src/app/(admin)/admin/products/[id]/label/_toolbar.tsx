'use client'

interface Props {
  productId: string
  productName: string
  copies: number
}

export default function LabelToolbar({ productId, productName, copies }: Props) {
  return (
    <div className="toolbar">
      <a href={`/admin/products/${productId}`} className="btn btn-secondary">
        ← Back
      </a>
      <button onClick={() => window.print()} className="btn btn-primary">
        🖨 Print Labels
      </button>
      <span style={{ fontSize: '13px', color: '#6b7280' }}>
        {copies} labels per sheet · {productName}
      </span>
    </div>
  )
}
