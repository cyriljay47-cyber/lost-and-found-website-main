"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Signup failed")
        setLoading(false)
        return
      }

      setSuccess(data.message)
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      })

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err) {
      setError("An error occurred during signup")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full animate-fadeInUp">
        <Card className="p-8 shadow-2xl border-0 bg-white/95 backdrop-blur">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full text-white font-bold text-2xl mb-4 animate-bounce">
              ✨
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Create Account</h2>
          </div>
          <p className="text-center text-gray-600 text-sm mb-6">
            Join Lost & Found and help reunite people with their belongings
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded text-red-700 text-sm font-semibold">
              ❌ {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border-2 border-green-300 rounded text-green-700 text-sm font-semibold">
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-gray-700 font-semibold">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
                className="border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-700 font-semibold">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                className="border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 font-semibold">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
                className="border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700 font-semibold">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                className="border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
              />
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-2 shadow-lg hover:shadow-xl transition-all" disabled={loading}>
              {loading ? "✨ Creating Account..." : "✨ Sign Up"}
            </Button>
          </form>

          <div className="mt-6 border-t pt-4">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-500 font-semibold">
                Login here
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-500">
              Back to Home
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
