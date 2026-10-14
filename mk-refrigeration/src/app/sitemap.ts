import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

const BASE = 'https://mkrefrigeration.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ select: { slug: true, updatedAt: true }, where: { inStock: true } }).catch(() => []),
    prisma.category.findMany({ select: { slug: true, createdAt: true } }).catch(() => []),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/categories/${c.slug}`,
    lastModified: c.createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
