import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function createToken(userId: number, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: number; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string }
    return decoded
  } catch {
    return null
  }
}

export function getTokenFromCookie(cookieString?: string): string | null {
  if (!cookieString) return null
  const cookies = cookieString.split("; ")
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=")
    if (key === "auth_token") {
      return decodeURIComponent(value)
    }
  }
  return null
}
