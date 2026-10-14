import type { Metadata } from 'next'
import { Manrope, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { SHOP } from '@/lib/constants'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: `${SHOP.name} | AC, Refrigerator, Washing Machine Dealer Bharuch`,
    template: `%s | ${SHOP.name}`,
  },
  description:
    'MK Refrigeration — Authorized dealer of AC, Refrigerator, Washing Machine, Deep Freezer, Cooler & Home Appliances in Bharuch, Gujarat. Best prices, genuine products, expert service.',
  keywords: [
    'AC dealer Bharuch',
    'refrigerator shop Bharuch',
    'washing machine Bharuch',
    'electronics wholesale Bharuch',
    'MK Refrigeration',
    'deep freezer Bharuch',
    'home appliances Bharuch',
    'LG dealer Bharuch',
    'Samsung dealer Bharuch',
    'Whirlpool dealer Bharuch',
    'AC shop Gujarat',
  ],
  authors: [{ name: SHOP.name }],
  creator: SHOP.name,
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: SHOP.name,
    title: `${SHOP.name} | Electronics Dealer Bharuch Gujarat`,
    description:
      'Best deals on AC, Fridge, Washing Machine & Home Appliances in Bharuch. Authorized dealer with genuine warranty.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: 'https://mkrefrigeration.vercel.app',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${plusJakarta.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#1a56db" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-body antialiased bg-surface text-on-surface">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: 'MK Refrigeration',
              description: 'Authorized dealer of AC, Refrigerator, Washing Machine, Deep Freezer, Cooler & Home Appliances in Bharuch, Gujarat.',
              url: 'https://mkrefrigeration.com',
              telephone: '+919898088292',
              email: 'mkrefrigeration@gmail.com',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Bharuch',
                addressRegion: 'Gujarat',
                postalCode: '392001',
                addressCountry: 'IN',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 21.7051,
                longitude: 72.9959,
              },
              openingHoursSpecification: [
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
                  opens: '10:00',
                  closes: '20:00',
                },
              ],
              sameAs: [],
              priceRange: '₹₹',
              currenciesAccepted: 'INR',
              paymentAccepted: 'Cash, UPI, Card',
            }),
          }}
        />
        {children}
      </body>
    </html>
  )
}
