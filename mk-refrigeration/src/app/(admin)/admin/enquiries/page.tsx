import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export const metadata: Metadata = { title: 'Enquiries' }
export const dynamic = 'force-dynamic'

async function markRead(id: string) {
  'use server'
  await prisma.enquiry.update({ where: { id }, data: { read: true } })
  revalidatePath('/admin/enquiries')
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
          <div key={e.id} className={`bg-white rounded-2xl border p-5 ${!e.read ? 'border-primary/40 shadow-sm shadow-primary/10' : 'border-outline-variant/40'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-on-surface">{e.name}</p>
                  {!e.read && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-on-primary">NEW</span>}
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
              <div className="flex gap-2 shrink-0">
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
                {!e.read && (
                  <form action={markRead.bind(null, e.id)}>
                    <button type="submit" className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-outline-variant/60 text-on-surface-variant hover:bg-surface-container transition-colors">
                      <span className="material-symbols-outlined text-sm">done</span>
                      Mark Read
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
