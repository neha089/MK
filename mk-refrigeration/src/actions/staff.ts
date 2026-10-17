'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/session'
import { logAudit, getClientIp } from '@/lib/audit'

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
  const user = await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, password: passwordHash, role: parsed.data.role },
  })

  const ip = await getClientIp()
  await logAudit({
    action: 'CREATE_STAFF',
    userId: session.userId,
    userEmail: session.email,
    entity: 'User',
    entityId: user.id,
    meta: parsed.data.email,
    ip,
  })

  revalidatePath('/admin/staff')
  return { success: true }
}

const UpdateStaffSchema = z.object({
  name: z.string().min(2),
  role: z.enum(['ADMIN', 'STAFF']),
  password: z.string().optional(),
})

export type UpdateStaffFormState = { error?: string; success?: boolean } | undefined

export async function updateStaff(id: string, _: UpdateStaffFormState, formData: FormData): Promise<UpdateStaffFormState> {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Only admins can edit staff' }

  const parsed = UpdateStaffSchema.safeParse({
    name: formData.get('name'),
    role: formData.get('role') || 'STAFF',
    password: formData.get('password') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const data: { name: string; role: 'ADMIN' | 'STAFF'; password?: string } = {
    name: parsed.data.name,
    role: parsed.data.role,
  }
  if (parsed.data.password && parsed.data.password.length >= 6) {
    data.password = await bcrypt.hash(parsed.data.password, 10)
  } else if (parsed.data.password && parsed.data.password.length > 0) {
    return { error: 'Password must be at least 6 characters' }
  }

  await prisma.user.update({ where: { id }, data })
  revalidatePath('/admin/staff')
  return { success: true }
}

export async function deleteStaff(id: string) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return

  const user = await prisma.user.findUnique({ where: { id }, select: { email: true } })
  await prisma.user.delete({ where: { id } })

  const ip = await getClientIp()
  await logAudit({
    action: 'DELETE_STAFF',
    userId: session.userId,
    userEmail: session.email,
    entity: 'User',
    entityId: id,
    meta: user?.email,
    ip,
  })

  revalidatePath('/admin/staff')
}
