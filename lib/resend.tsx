interface ResendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: ResendEmailOptions) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY

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

export function generateVerificationEmailHTML(verificationUrl: string, userEmail: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - Planner App</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Planner App!</h1>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
        
        <p>Hi there!</p>
        
        <p>Thanks for signing up for Planner App. To get started, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Verify Email Address</a>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #667eea; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Important: Next Steps</h3>
          <p style="margin-bottom: 0;"><strong>After clicking the verification link above, please return to the Planner App and log in manually with your email and password.</strong></p>
        </div>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #666; font-size: 14px;">
          If you didn't create an account with Planner App, you can safely ignore this email.
        </p>
        
        <p style="color: #666; font-size: 14px;">
          Best regards,<br>
          The Planner App Team
        </p>
      </div>
    </body>
    </html>
  `
}
