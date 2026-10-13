import type { Metadata } from 'next'
import HeroSection from '@/components/home/HeroSection'
import CategoriesSection from '@/components/home/CategoriesSection'
import ProductsSection from '@/components/home/ProductsSection'
import OffersSection from '@/components/home/OffersSection'
import BrandsSection from '@/components/home/BrandsSection'
import TrustBadges from '@/components/home/TrustBadges'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import { prisma } from '@/lib/db'

export const metadata: Metadata = {
  title: 'MK Refrigeration | AC, Fridge, Washing Machine Dealer Bharuch Gujarat',
  description:
    'Buy AC, Refrigerator, Washing Machine, Deep Freezer & Home Appliances at best prices in Bharuch. Authorized dealer — genuine products, expert installation, warranty support.',
}

async function getFeaturedProducts() {
  try {
    return await prisma.product.findMany({
      where: { inStock: true },
      include: { brand: true, category: true },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: 8,
    })
  } catch {
    return []
  }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { order: 'asc' },
    })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ])

  return (
    <>
      <HeroSection />
      <TrustBadges />
      <CategoriesSection categories={categories} />
      <ProductsSection products={products.map((p) => ({ ...p, imageUrl: p.images?.[0] ?? null }))} />
      <OffersSection />
      <WhyChooseUs />
      <BrandsSection />
    </>
  )
}
