'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { SHOP, NAV_LINKS } from '@/lib/constants'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartCount] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      id="main-header"
      className={`fixed top-0 w-full z-50 glass-nav border-b border-outline-variant/40 transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-margin-desktop max-w-container-max mx-auto h-20">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-md group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                ac_unit
              </span>
            </div>
            <div>
              <span className="font-headline text-xl font-extrabold text-primary tracking-tight block leading-none">
                MK Refrigeration
              </span>
              <span className="text-[10px] text-on-surface-variant font-medium tracking-wider uppercase">
                Bharuch, Gujarat
              </span>
            </div>
          </Link>

          {/* Search */}
          <form action="/search" method="GET" className="hidden lg:flex items-center relative w-[380px]">
            <input
              name="q"
              className="w-full pl-5 pr-12 py-3 bg-surface-container border border-outline-variant/60 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-blue-100 transition-all text-sm font-medium placeholder:text-on-surface-variant/60"
              placeholder="Search AC, Fridge, Washing Machine..."
              type="search"
            />
            <button type="submit" className="absolute right-2.5 bg-primary text-on-primary p-2 rounded-xl hover:bg-primary-dark transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </button>
          </form>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-6">
          {/* Phone */}
          <a
            href={`tel:${SHOP.phone}`}
            className="hidden md:flex items-center gap-2 text-primary font-bold bg-primary-fixed px-4 py-2 rounded-xl border border-primary/10 hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-lg">call</span>
            <span className="text-sm font-headline">{SHOP.phone}</span>
          </a>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${SHOP.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 text-[#25D366] font-bold bg-[#f0fdf4] px-3 py-2 rounded-xl border border-[#25D366]/20 hover:bg-[#dcfce7] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25D366]">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="text-sm font-headline">WhatsApp</span>
          </a>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2.5 text-on-surface-variant hover:text-primary hover:bg-primary-fixed/40 rounded-xl transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Sub nav */}
      <nav className="hidden lg:flex items-center justify-center gap-10 h-11 border-t border-outline-variant/40 text-xs uppercase tracking-widest font-bold text-on-surface-variant">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hover:text-primary transition-colors relative py-2 group"
          >
            {link.label}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </Link>
        ))}
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-outline-variant/40 px-4 py-6 space-y-4 shadow-xl">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary py-2 border-b border-outline-variant/30"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-3">
            <a
              href={`tel:${SHOP.phone}`}
              className="flex items-center gap-2 text-primary font-bold bg-primary-fixed px-4 py-3 rounded-xl"
            >
              <span className="material-symbols-outlined text-lg">call</span>
              {SHOP.phone}
            </a>
            <a
              href={`https://wa.me/${SHOP.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#25D366] font-bold bg-[#f0fdf4] px-4 py-3 rounded-xl"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25D366]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
