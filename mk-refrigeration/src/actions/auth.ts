'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/session'
import { logAudit, getClientIp } from '@/lib/audit'
import { checkLoginRateLimit } from '@/lib/ratelimit'

const LoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
})

export type LoginState =
  | { errors?: { email?: string[]; password?: string[] }; message?: string }
  | undefined

export async function login(state: LoginState, formData: FormData): Promise<LoginState> {
  const validated = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { email, password } = validated.data
  const ip = await getClientIp()

  const { blocked, attemptsLeft } = await checkLoginRateLimit(email)
  if (blocked) {
    return { message: `Too many failed attempts. Try again in 15 minutes.` }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    void logAudit({ action: 'LOGIN_FAIL', userEmail: email, ip, meta: 'user_not_found' })
    return { message: `Invalid email or password.${attemptsLeft <= 2 ? ` ${attemptsLeft} attempts left.` : ''}` }
  }

  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) {
    void logAudit({ action: 'LOGIN_FAIL', userEmail: email, userId: user.id, ip, meta: 'wrong_password' })
    return { message: `Invalid email or password.${attemptsLeft <= 2 ? ` ${attemptsLeft} attempts left.` : ''}` }
  }

  void logAudit({ action: 'LOGIN_SUCCESS', userEmail: email, userId: user.id, ip })

  await createSession({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })

  redirect('/admin/dashboard')
}

export async function logout() {
  await deleteSession()
  redirect('/admin/login')
}
