import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { logAudit, getClientIp } from '@/lib/audit'

export const metadata: Metadata = { title: 'Offers' }
export const dynamic = 'force-dynamic'

async function deleteOffer(id: string) {
  'use server'
  const session = await getSession()
  const offer = await prisma.offer.findUnique({ where: { id }, select: { title: true } })
  await prisma.offer.delete({ where: { id } })
  const ip = await getClientIp()
  await logAudit({
    action: 'DELETE_OFFER',
    userId: session?.userId,
    userEmail: session?.email,
    entity: 'Offer',
    entityId: id,
    meta: offer?.title,
    ip,
  })
  revalidatePath('/admin/offers')
}

async function toggleOffer(id: string, active: boolean) {
  'use server'
  await prisma.offer.update({ where: { id }, data: { active } })
  revalidatePath('/admin/offers')
}

export default async function OffersPage() {
  const offers = await prisma.offer.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-extrabold text-on-surface">Offers & Promotions</h1>
          <p className="text-on-surface-variant text-sm mt-1">{offers.length} offers</p>
        </div>
        <Link href="/admin/offers/new" className="btn-primary">
          <span className="material-symbols-outlined text-xl">add</span>
          Add Offer
        </Link>
      </div>

      <div className="grid gap-4">
        {offers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-outline-variant/40 p-16 text-center text-on-surface-variant">
            No offers yet. <Link href="/admin/offers/new" className="text-primary font-bold">Create one</Link>
          </div>
        ) : offers.map((o) => (
          <div key={o.id} className={`bg-white rounded-2xl border p-5 flex items-center justify-between gap-4 ${o.active ? 'border-outline-variant/40' : 'border-outline-variant/20 opacity-60'}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-on-surface">{o.title}</p>
                {o.active
                  ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">Active</span>
                  : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant/40">Inactive</span>}
              </div>
              {o.description && <p className="text-xs text-on-surface-variant">{o.description}</p>}
              {o.discount != null && <p className="text-xs font-bold text-primary mt-1">{o.discount}% off</p>}
              {(o.validFrom || o.validUntil) && (
                <p className="text-xs text-on-surface-variant mt-1">
                  {o.validFrom && `From ${new Date(o.validFrom).toLocaleDateString('en-IN')}`}
                  {o.validFrom && o.validUntil && ' · '}
                  {o.validUntil && `Until ${new Date(o.validUntil).toLocaleDateString('en-IN')}`}
                </p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Link href={`/admin/offers/${o.id}/edit`} className="p-2 rounded-xl border border-outline-variant/60 text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-base">edit</span>
              </Link>
              <form action={toggleOffer.bind(null, o.id, !o.active)}>
                <button type="submit" className={`p-2 rounded-xl text-sm font-bold transition-colors border ${o.active ? 'border-outline-variant/60 text-on-surface-variant hover:bg-surface-container' : 'border-primary/30 text-primary bg-primary/10 hover:bg-primary/20'}`}>
                  <span className="material-symbols-outlined text-base">{o.active ? 'visibility_off' : 'visibility'}</span>
                </button>
              </form>
              <form action={deleteOffer.bind(null, o.id)}>
                <button
                  type="submit"
                  onClick={(e) => { if (!confirm('Delete offer?')) e.preventDefault() }}
                  className="p-2 rounded-xl border border-outline-variant/60 text-on-surface-variant hover:bg-error/10 hover:text-error hover:border-error/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
