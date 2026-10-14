import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const CATEGORIES = [
  { name: 'Air Conditioners', slug: 'ac', icon: 'ac_unit', description: 'Split, Window & Portable ACs', order: 1 },
  { name: 'Refrigerators', slug: 'refrigerators', icon: 'kitchen', description: 'Single & Double Door Fridges', order: 2 },
  { name: 'Washing Machines', slug: 'washing-machines', icon: 'local_laundry_service', description: 'Front & Top Load Washers', order: 3 },
  { name: 'Deep Freezers', slug: 'deep-freezers', icon: 'severe_cold', description: 'Commercial & Home Deep Freezers', order: 4 },
  { name: 'Air Coolers', slug: 'coolers', icon: 'air', description: 'Desert & Personal Coolers', order: 5 },
  { name: 'Home Appliances', slug: 'home-appliances', icon: 'home', description: 'Fans, Geysers & More', order: 6 },
]

const BRANDS = [
  { name: 'LG', slug: 'lg', featured: true },
  { name: 'Samsung', slug: 'samsung', featured: true },
  { name: 'Whirlpool', slug: 'whirlpool', featured: true },
  { name: 'Voltas', slug: 'voltas', featured: true },
  { name: 'Daikin', slug: 'daikin', featured: true },
  { name: 'Hitachi', slug: 'hitachi', featured: false },
  { name: 'Haier', slug: 'haier', featured: false },
  { name: 'Panasonic', slug: 'panasonic', featured: false },
  { name: 'Godrej', slug: 'godrej', featured: false },
  { name: 'Blue Star', slug: 'blue-star', featured: false },
  { name: 'Lloyd', slug: 'lloyd', featured: false },
  { name: 'O General', slug: 'o-general', featured: false },
]

async function main() {
  console.log('Seeding database...')

  // Admin user
  const existing = await prisma.user.findUnique({ where: { email: 'admin@mkrefrigeration.com' } })
  if (!existing) {
    const password = await bcrypt.hash('Admin@1234', 12)
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@mkrefrigeration.com',
        password,
        role: 'ADMIN',
      },
    })
    console.log('Created admin user: admin@mkrefrigeration.com / Admin@1234')
  }

  // Categories
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log(`Upserted ${CATEGORIES.length} categories`)

  // Brands
  for (const brand of BRANDS) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    })
  }
  console.log(`Upserted ${BRANDS.length} brands`)

  console.log('Seed complete.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
