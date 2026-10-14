'use client'

import Link from 'next/link'
import { SHOP } from '@/lib/constants'
import { useActionState, useEffect, useRef } from 'react'
import { submitEnquiry } from '@/actions/enquiries'
import type { EnquiryFormState } from '@/actions/enquiries'

const INFO = [
  { icon: 'call', label: 'Phone', value: `+91 ${SHOP.phone}`, href: `tel:${SHOP.phone}` },
  { icon: 'mail', label: 'Email', value: SHOP.email, href: `mailto:${SHOP.email}` },
  { icon: 'location_on', label: 'Address', value: 'Bharuch, Gujarat, India — 392001', href: SHOP.mapUrl },
  { icon: 'schedule', label: 'Hours', value: 'Mon–Sat: 10:00 AM – 8:00 PM', href: null },
]

export default function ContactPage() {
  const [state, action, pending] = useActionState<EnquiryFormState, FormData>(submitEnquiry, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) formRef.current?.reset()
  }, [state])

  return (
    <div className="py-16 px-margin-desktop max-w-container-max mx-auto">
      <nav className="text-xs text-on-surface-variant mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-on-surface font-semibold">Contact</span>
      </nav>

      <div className="text-center mb-12">
        <span className="text-primary text-xs font-bold uppercase tracking-widest">Get in Touch</span>
        <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface mt-2">Contact Us</h1>
        <p className="text-on-surface-variant text-sm mt-2 max-w-md mx-auto">
          We are available Mon–Sat, 10am to 8pm. Reach us by phone, WhatsApp, or fill the form below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Info */}
        <div className="space-y-6">
          {INFO.map((item) => (
            <div key={item.label} className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {item.icon}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="font-bold text-on-surface hover:text-primary transition-colors" target={item.icon === 'location_on' ? '_blank' : undefined} rel="noopener noreferrer">
                    {item.value}
                  </a>
                ) : (
                  <p className="font-bold text-on-surface">{item.value}</p>
                )}
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <a
              href={`tel:${SHOP.phone}`}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-on-primary font-bold py-3 rounded-xl text-sm hover:bg-primary-dark transition-colors"
            >
              <span className="material-symbols-outlined text-lg">call</span>
              Call Now
            </a>
            <a
              href={`https://wa.me/${SHOP.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#1db954] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          </div>

          <a
            href={SHOP.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary font-bold text-sm hover:underline"
          >
            <span className="material-symbols-outlined text-lg">map</span>
            Open in Google Maps
          </a>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl border border-outline-variant/40 p-8">
          <h2 className="font-headline font-extrabold text-on-surface mb-6">Send us a Message</h2>

          {state?.success ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-5xl text-success" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <p className="font-bold text-on-surface mt-3">Message received!</p>
              <p className="text-on-surface-variant text-sm mt-1">We will get back to you shortly on your phone number.</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 text-primary text-sm font-bold hover:underline"
              >
                Send another
              </button>
            </div>
          ) : (
            <form ref={formRef} action={action} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Your Name <span className="text-error">*</span>
                </label>
                <input
                  name="name"
                  required
                  placeholder="Rahul Patel"
                  className="w-full px-4 py-3 bg-surface-container border border-outline-variant/60 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-blue-100 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Phone Number <span className="text-error">*</span>
                </label>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="9898XXXXXX"
                  className="w-full px-4 py-3 bg-surface-container border border-outline-variant/60 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-blue-100 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="optional"
                  className="w-full px-4 py-3 bg-surface-container border border-outline-variant/60 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-blue-100 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Message / Product Enquiry <span className="text-error">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="I am interested in a 1.5 ton LG AC..."
                  className="w-full px-4 py-3 bg-surface-container border border-outline-variant/60 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-blue-100 transition-all text-sm resize-none"
                />
              </div>

              {state?.error && (
                <p className="text-sm text-error bg-error/10 px-3 py-2 rounded-xl">{state.error}</p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-bold py-3.5 rounded-xl hover:opacity-90 disabled:opacity-60 transition-all"
              >
                <span className="material-symbols-outlined text-xl">send</span>
                {pending ? 'Sending…' : 'Send Message'}
              </button>

              <p className="text-xs text-on-surface-variant text-center">
                Or reach us directly on{' '}
                <a
                  href={`https://wa.me/${SHOP.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#25D366] font-bold hover:underline"
                >
                  WhatsApp
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
