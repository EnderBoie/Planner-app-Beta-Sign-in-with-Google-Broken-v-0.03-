interface ResendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: ResendEmailOptions) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_HpiBQ28P_ENp7ghdjvwipUPZeQNCp6r1z"

  if (!RESEND_API_KEY) {
    console.error("[v0] RESEND_API_KEY not found in environment variables")
    throw new Error("Resend API key not configured")
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Planner App <noreply@yourdomain.com>", // Replace with your verified domain
        to: [to],
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] Resend API error:", error)
      throw new Error(`Failed to send email: ${response.status}`)
    }

    const result = await response.json()
    console.log("[v0] Email sent successfully:", result.id)
    return result
  } catch (error) {
    console.error("[v0] Error sending email:", error)
    throw error
  }
}
