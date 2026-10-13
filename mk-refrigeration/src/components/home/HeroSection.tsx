'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { SHOP } from '@/lib/constants'

const SLIDES = [
  {
    tag: 'Summer Sale — Up to 40% Off',
    headline: 'Stay Cool This\nSummer Season',
    sub: 'Latest split ACs, inverter technology, 5-star rated — available at best prices in Bharuch.',
    cta: { label: 'Shop Air Conditioners', href: '/categories/ac' },
    ctaSecondary: { label: 'Get Quote', href: `/https://wa.me/${SHOP.whatsapp}` },
    badge: 'AC',
    icon: 'ac_unit',
    accent: '#1a56db',
    bg: 'from-blue-50 to-indigo-100',
  },
  {
    tag: 'Premium Selection',
    headline: 'Fresh Keeps Food\nFresh Longer',
    sub: 'Double-door, frost-free, bottom-mount — all top brands. Expert installation included.',
    cta: { label: 'Shop Refrigerators', href: '/categories/refrigerators' },
    ctaSecondary: { label: 'Call Us', href: `tel:${SHOP.phone}` },
    badge: 'FRIDGE',
    icon: 'kitchen',
    accent: '#0ea5e9',
    bg: 'from-sky-50 to-cyan-100',
  },
  {
    tag: 'Best Deals in Bharuch',
    headline: 'Smart Wash,\nSmarter Savings',
    sub: 'Front-load and top-load washing machines from LG, Samsung, Whirlpool at dealer prices.',
    cta: { label: 'Shop Washing Machines', href: '/categories/washing-machines' },
    ctaSecondary: { label: 'View Offers', href: '/#offers' },
    badge: 'WASHER',
    icon: 'local_laundry_service',
    accent: '#7c3aed',
    bg: 'from-violet-50 to-purple-100',
  },
]

export default function HeroSection() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const t = setInterval(() => goTo((current + 1) % SLIDES.length), 5500)
    return () => clearInterval(t)
  }, [current])

  function goTo(idx: number) {
    if (animating || idx === current) return
    setAnimating(true)
    setTimeout(() => {
      setCurrent(idx)
      setAnimating(false)
    }, 300)
  }

  const slide = SLIDES[current]

  return (
    <section className={`relative min-h-[88vh] flex items-center bg-gradient-to-br ${slide.bg} transition-all duration-700 overflow-hidden`}>
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 w-full px-margin-desktop max-w-container-max mx-auto py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className={`space-y-7 transition-all duration-300 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {slide.tag}
            </span>

            <h1 className="font-headline text-4xl md:text-5xl xl:text-6xl font-extrabold text-on-surface leading-tight tracking-tight whitespace-pre-line">
              {slide.headline}
            </h1>

            <p className="text-on-surface-variant text-base md:text-lg leading-relaxed max-w-md">
              {slide.sub}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href={slide.cta.href}
                className="inline-flex items-center gap-2.5 bg-primary text-on-primary px-7 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all hover:scale-105 active:scale-100"
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{slide.icon}</span>
                {slide.cta.label}
              </Link>
              <a
                href={slide.ctaSecondary.href}
                className="inline-flex items-center gap-2 border-2 border-primary/30 text-primary px-7 py-3.5 rounded-xl font-bold text-sm hover:bg-primary/10 transition-all"
              >
                {slide.ctaSecondary.label}
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </a>
            </div>

            <div className="flex items-center gap-6 pt-2 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                Authorized Dealer
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                Genuine Warranty
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>home_repair_service</span>
                Expert Install
              </span>
            </div>
          </div>

          {/* Illustration */}
          <div className={`hidden lg:flex items-center justify-center transition-all duration-300 ${animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 rounded-[40px] bg-primary/10 rotate-6" />
              <div className="absolute inset-0 rounded-[40px] bg-white/80 shadow-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[160px] text-primary/80" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {slide.icon}
                </span>
              </div>
              <div className="absolute -top-4 -right-4 bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-extrabold shadow-lg tracking-wider">
                {slide.badge}
              </div>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="flex items-center gap-3 mt-12">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`transition-all rounded-full ${i === current ? 'w-8 h-2.5 bg-primary' : 'w-2.5 h-2.5 bg-primary/30 hover:bg-primary/60'}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
