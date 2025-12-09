import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Invalid verification link" }, { status: 400 })
    }

    // Find user with this token
    const results = await query("SELECT id, username, is_verified FROM users WHERE verification_token = ?", [
      token,
    ])

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    const user = results[0] as { id: number; username: string; is_verified: boolean }

    if (user.is_verified) {
      return NextResponse.json({ message: "Email already verified" }, { status: 200 })
    }

    // Mark email as verified
    await query("UPDATE users SET is_verified = true, verification_token = NULL WHERE id = ?", [user.id])

    return NextResponse.json(
      {
        message: "Email verified successfully! You can now log in.",
        username: user.username,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
