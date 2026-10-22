import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { SHOP } from '@/lib/constants'
import { formatPrice } from '@/lib/utils'
import { Libre_Barcode_128_Text } from 'next/font/google'
import LabelToolbar from './_toolbar'

const barcodeFont = Libre_Barcode_128_Text({ weight: '400', subsets: ['latin'], variable: '--font-barcode' })

type Props = { params: Promise<{ id: string }> }

export default async function LabelPage({ params }: Props) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { brand: true, category: true },
  }).catch(() => null)

  if (!product) notFound()

  const price = Number(product.price)
  const mrp = Number(product.mrp ?? 0)
  const copies = 12

  return (
    <div className={barcodeFont.variable}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #f5f5f5; font-family: Arial, sans-serif; }

        .toolbar {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          border: none;
          text-decoration: none;
        }
        .btn-primary { background: #1a56db; color: white; }
        .btn-secondary { background: white; color: #374151; border: 1px solid #d1d5db; }

        .sheet {
          max-width: 794px;
          margin: 24px auto;
          background: white;
          padding: 12mm;
          box-shadow: 0 2px 12px rgba(0,0,0,0.10);
        }

        .labels-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4mm;
        }

        .label {
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 5mm 4mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2mm;
          text-align: center;
          min-height: 40mm;
        }

        .label-shop {
          font-size: 7px;
          font-weight: 700;
          color: #1a56db;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .label-name {
          font-size: 9px;
          font-weight: 700;
          color: #111827;
          line-height: 1.3;
          max-height: 2.6em;
          overflow: hidden;
        }

        .label-model {
          font-size: 7px;
          color: #6b7280;
          font-family: 'Courier New', monospace;
        }

        .label-price {
          font-size: 16px;
          font-weight: 900;
          color: #111827;
          margin: 1mm 0;
        }

        .label-mrp {
          font-size: 7px;
          color: #9ca3af;
          text-decoration: line-through;
        }

        .label-barcode {
          font-family: var(--font-barcode), monospace;
          font-size: 22px;
          color: #111827;
          line-height: 1;
          margin-top: 1mm;
          max-width: 100%;
          overflow: hidden;
        }

        .label-divider {
          width: 100%;
          border: none;
          border-top: 1px dashed #e5e7eb;
          margin: 1mm 0;
        }

        @media print {
          .toolbar { display: none !important; }
          body { background: white; }
          .sheet {
            margin: 0;
            padding: 8mm;
            box-shadow: none;
            max-width: 100%;
          }
        }
      `}</style>

      <LabelToolbar productId={id} productName={product.name} copies={copies} />

      <div className="sheet">
        <div className="labels-grid">
          {Array.from({ length: copies }).map((_, i) => (
            <div key={i} className="label">
              <span className="label-shop">{SHOP.name}</span>
              <hr className="label-divider" />
              <span className="label-name">{product.name}</span>
              {product.model && <span className="label-model">{product.model}</span>}
              <span className="label-price">{formatPrice(price)}</span>
              {mrp > price && <span className="label-mrp">MRP {formatPrice(mrp)}</span>}
              {product.barcode && (
                <>
                  <hr className="label-divider" />
                  <span className="label-barcode">{product.barcode}</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
