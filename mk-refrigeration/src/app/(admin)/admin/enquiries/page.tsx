import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { updateEnquiryStatus } from '@/actions/enquiries'

export const metadata: Metadata = { title: 'Enquiries' }
export const dynamic = 'force-dynamic'

const STATUSES: { value: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'CLOSED'; label: string; color: string }[] = [
  { value: 'NEW', label: 'New', color: 'bg-primary text-on-primary' },
  { value: 'CONTACTED', label: 'Contacted', color: 'bg-blue-100 text-blue-700' },
  { value: 'CONVERTED', label: 'Converted', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-surface-container text-on-surface-variant' },
]

function statusStyle(status: string) {
  return STATUSES.find((s) => s.value === status)?.color ?? 'bg-surface-container text-on-surface-variant'
}

export default async function EnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  }).catch(() => [])

  const unread = enquiries.filter((e) => !e.read).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Enquiries</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          {enquiries.length} total · <span className="text-primary font-bold">{unread} unread</span>
        </p>
      </div>

      <div className="space-y-3">
        {enquiries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-outline-variant/40 p-16 text-center text-on-surface-variant">
            No enquiries yet.
          </div>
        ) : enquiries.map((e) => (
          <div key={e.id} className={`bg-white rounded-2xl border p-5 ${e.status === 'NEW' ? 'border-primary/40 shadow-sm shadow-primary/10' : 'border-outline-variant/40'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-on-surface">{e.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle(e.status)}`}>
                    {e.status}
                  </span>
                  {e.product && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      {e.product}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-on-surface-variant mb-3">
                  {e.phone && (
                    <a href={`tel:${e.phone}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-sm">call</span>
                      {e.phone}
                    </a>
                  )}
                  {e.email && (
                    <a href={`mailto:${e.email}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-sm">mail</span>
                      {e.email}
                    </a>
                  )}
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    {new Date(e.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
                {e.message && <p className="text-sm text-on-surface bg-surface-container rounded-xl px-4 py-3">{e.message}</p>}
              </div>
              <div className="flex flex-col gap-2 shrink-0 items-end">
                {e.phone && (
                  <a
                    href={`https://wa.me/91${e.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">chat</span>
                    WhatsApp
                  </a>
                )}
                <div className="flex gap-1">
                  {STATUSES.map((s) => (
                    s.value === e.status ? null : (
                      <form key={s.value} action={updateEnquiryStatus.bind(null, e.id, s.value)}>
                        <button
                          type="submit"
                          className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-outline-variant/60 text-on-surface-variant hover:bg-surface-container transition-colors"
                        >
                          → {s.label}
                        </button>
                      </form>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
