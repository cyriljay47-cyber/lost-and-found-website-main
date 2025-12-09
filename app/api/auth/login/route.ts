import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { comparePassword, createToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 })
    }

    const results = await query(
      "SELECT id, username, password, role FROM users WHERE username = ?",
      [username]
    )

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = results[0] as { id: number; username: string; password: string; role: string }

    const isPasswordValid = await comparePassword(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = createToken(user.id, user.role)

    const response = NextResponse.json({
      message: "Login successful",
      user: { id: user.id, username: user.username, role: user.role },
    })

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
