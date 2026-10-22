import { prisma } from './db'

const LOGIN_WINDOW_MS = 15 * 60 * 1000  // 15 minutes
const LOGIN_MAX = 5                       // 5 failed attempts
const ENQUIRY_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const ENQUIRY_MAX = 10                    // 10 enquiries per IP per hour

export async function checkLoginRateLimit(email: string): Promise<{ blocked: boolean; attemptsLeft: number }> {
  try {
    const since = new Date(Date.now() - LOGIN_WINDOW_MS)
    const count = await prisma.auditLog.count({
      where: {
        action: 'LOGIN_FAIL',
        userEmail: email.toLowerCase(),
        createdAt: { gte: since },
      },
    })
    return { blocked: count >= LOGIN_MAX, attemptsLeft: Math.max(0, LOGIN_MAX - count) }
  } catch {
    return { blocked: false, attemptsLeft: LOGIN_MAX }
  }
}

export async function checkEnquiryRateLimit(ip: string): Promise<{ blocked: boolean }> {
  try {
    const since = new Date(Date.now() - ENQUIRY_WINDOW_MS)
    const count = await prisma.auditLog.count({
      where: {
        action: 'ENQUIRY_SUBMIT',
        ip,
        createdAt: { gte: since },
      },
    })
    return { blocked: count >= ENQUIRY_MAX }
  } catch {
    return { blocked: false }
  }
}
