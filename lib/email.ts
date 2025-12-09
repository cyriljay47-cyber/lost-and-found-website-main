import nodemailer from "nodemailer"

// Configure email transporter (using Gmail/SMTP)
// For production, use environment variables for credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "your-app-password",
  },
})

// Fallback to test account if no credentials provided (for development)
async function getTransporter() {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    return transporter
  }

  // Create test account for development
  const testAccount = await nodemailer.createTestAccount()
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  })
}

export async function sendWelcomeEmail(email: string, username: string) {
  try {
    const emailTransporter = await getTransporter()

    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@lostnfound.com",
      to: email,
      subject: "Welcome to Lost & Found! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Lost & Found, ${username}!</h2>
          <p>Your account has been successfully created.</p>
          
          <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>What can you do?</h3>
            <ul>
              <li>Report lost or found items</li>
              <li>Search for items in our database</li>
              <li>Connect with other users to recover belongings</li>
            </ul>
          </div>

          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login" 
               style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Login to Your Account
            </a>
          </p>

          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            If you didn't create this account, please ignore this email.
          </p>
        </div>
      `,
    }

    const info = await emailTransporter.sendMail(mailOptions)
    console.log("Welcome email sent:", info.messageId)
    return true
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return false
  }
}

export async function sendVerificationEmail(
  email: string,
  username: string,
  verificationToken: string,
  appUrl: string = "http://localhost:3000"
) {
  try {
    const emailTransporter = await getTransporter()
    const verificationLink = `${appUrl}/verify-email?token=${verificationToken}`

    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@lostnfound.com",
      to: email,
      subject: "Verify Your Email - Lost & Found",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email Address</h2>
          <p>Dear <strong>${username}</strong>,</p>
          
          <p>Thank you for signing up! To complete your registration, please verify your email by clicking the button below:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link in your browser:<br>
            <code style="background: #f0f0f0; padding: 5px; word-break: break-all;">${verificationLink}</code>
          </p>

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This link expires in 24 hours. If you didn't create this account, you can ignore this email.
          </p>

          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      `,
    }

    const info = await emailTransporter.sendMail(mailOptions)
    console.log("Verification email sent:", info.messageId)
    return true
  } catch (error) {
    console.error("Error sending verification email:", error)
    return false
  }
}
