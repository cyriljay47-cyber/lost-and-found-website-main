"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader } from "lucide-react"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [username, setUsername] = useState("")

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get("token")

      if (!token) {
        setStatus("error")
        setMessage("Invalid verification link")
        return
      }

      try {
        const response = await fetch(`/api/auth/verify?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          setStatus("success")
          setMessage(data.message)
          setUsername(data.username)
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login")
          }, 3000)
        } else {
          setStatus("error")
          setMessage(data.error || "Verification failed")
        }
      } catch (error) {
        setStatus("error")
        setMessage("An error occurred during verification")
      }
    }

    verify()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="p-8">
          {status === "loading" && (
            <>
              <div className="flex justify-center mb-4">
                <Loader className="w-12 h-12 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-4">Verifying Email</h2>
              <p className="text-center text-gray-600">Please wait while we verify your email...</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-4 text-green-600">Email Verified!</h2>
              <p className="text-center text-gray-600 mb-4">{message}</p>
              <p className="text-center text-sm text-gray-500 mb-6">
                You can now log in with your account. Redirecting to login in a moment...
              </p>
              <Link href="/login" className="w-full">
                <Button className="w-full">Go to Login</Button>
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="w-16 h-16 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-4 text-red-600">Verification Failed</h2>
              <p className="text-center text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <Link href="/signup" className="w-full block">
                  <Button className="w-full">Sign Up Again</Button>
                </Link>
                <Link href="/" className="w-full block">
                  <Button variant="outline" className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
