import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { sendVerificationEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, confirmPassword } = await request.json()

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    // Check if username exists
    const usernameExists = await query("SELECT id FROM users WHERE username = ?", [username])
    if (Array.isArray(usernameExists) && usernameExists.length > 0) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 })
    }

    // Check if email exists
    const emailExists = await query("SELECT id FROM users WHERE email = ?", [email])
    if (Array.isArray(emailExists) && emailExists.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")

    // Create user with verification token (not verified yet)
    try {
      await query(
        "INSERT INTO users (username, email, password, role, verification_token, is_verified) VALUES (?, ?, ?, ?, ?, ?)",
        [username, email, hashedPassword, "user", verificationToken, false]
      )
    } catch (dbError: any) {
      console.error("Database error creating user:", dbError)
      const message = (dbError && dbError.sqlMessage) || dbError.message || "Database error"
      return NextResponse.json({ error: `Signup failed: ${message}` }, { status: 500 })
    }

    // Send verification email (don't block signup if email fails)
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      await sendVerificationEmail(email, username, verificationToken, appUrl)
    } catch (emailError) {
      console.error("Email sending failed for signup:", emailError)
    }

    return NextResponse.json(
      {
        message: "Signup successful! Check your email to verify your account.",
        redirect: "/login",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    const isProd = process.env.NODE_ENV === "production"
    const devMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: isProd ? "Signup failed. Please try again." : `Signup failed: ${devMessage}` },
      { status: 500 }
    )
  }
}
