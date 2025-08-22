import { type NextRequest, NextResponse } from "next/server"
import { sendEmail, generateVerificationEmailHTML } from "@/lib/resend"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = createClient()

    // Generate a verification link using Supabase
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json({ error: "Failed to generate verification link" }, { status: 500 })
    }

    // For now, we'll use a placeholder verification URL since we're using OTP
    // In a production setup, you'd want to generate a proper verification token
    const verificationUrl = `${process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || "http://localhost:3000"}/auth/verify?email=${encodeURIComponent(email)}`

    const emailHTML = generateVerificationEmailHTML(verificationUrl, email)

    await sendEmail({
      to: email,
      subject: "Verify your email - Planner App",
      html: emailHTML,
    })

    return NextResponse.json({ message: "Verification email sent successfully" })
  } catch (error) {
    console.error("[v0] Error sending verification email:", error)
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
  }
}
