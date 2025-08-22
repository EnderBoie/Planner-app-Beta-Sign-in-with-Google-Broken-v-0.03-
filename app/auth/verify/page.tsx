"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  useEffect(() => {
    const handleEmailVerification = async () => {
      if (!email) {
        setStatus("error")
        setMessage("No email provided for verification.")
        return
      }

      try {
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setStatus("success")
        setMessage("Your email has been verified successfully!")
      } catch (error) {
        console.error("[v0] Verification error:", error)
        setStatus("error")
        setMessage("Failed to verify email. Please try again.")
      }
    }

    handleEmailVerification()
  }, [email])

  const handleContinueToLogin = () => {
    router.push("/auth/sign-in")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          <CardDescription>
            {status === "loading" && "Verifying your email address..."}
            {status === "success" && "Verification Complete"}
            {status === "error" && "Verification Failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            {status === "loading" && <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />}
            {status === "success" && <CheckCircle className="h-12 w-12 text-green-600" />}
            {status === "error" && <AlertCircle className="h-12 w-12 text-red-600" />}

            <p className="text-center text-gray-600">{message}</p>

            {status === "success" && (
              <div className="w-full space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium">Next Step: Please log in to your account</p>
                  <p className="text-sm text-blue-600 mt-1">
                    Use your email ({email}) and password to access your planner.
                  </p>
                </div>

                <Button onClick={handleContinueToLogin} className="w-full">
                  Continue to Login
                </Button>
              </div>
            )}

            {status === "error" && (
              <Button onClick={() => router.push("/auth/sign-up")} variant="outline" className="w-full">
                Back to Sign Up
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
