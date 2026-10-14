'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/session'

const StaffSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'STAFF']).default('STAFF'),
})

export type StaffFormState = { error?: string; success?: boolean } | undefined

export async function createStaff(_: StaffFormState, formData: FormData): Promise<StaffFormState> {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Only admins can add staff' }

  const parsed = StaffSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role') || 'STAFF',
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) return { error: 'Email already exists' }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10)
  await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, password: passwordHash, role: parsed.data.role },
  })

  revalidatePath('/admin/staff')
  return { success: true }
}

export async function deleteStaff(id: string) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return
  await prisma.user.delete({ where: { id } })
  revalidatePath('/admin/staff')
}
