import sgMail from "@sendgrid/mail"
import * as fs from "fs/promises"
import * as path from "path"

// Initialize SendGrid with API key from environment
const apiKey = process.env.SENDGRID_API_KEY
if (apiKey) {
  sgMail.setApiKey(apiKey)
}

interface EmailOptions {
  to: string
  subject: string
  text: string
  html?: string
  from?: string
  cc?: string
  bcc?: string
}

export async function sendEmail(options: EmailOptions) {
  const { to, subject, text, html, from = "agent@lambda.run", cc, bcc } = options
  
  const msg = {
    to,
    from,
    subject,
    text,
    html: html || text,
    ...(cc && { cc }),
    ...(bcc && { bcc }),
  }
  
  try {
    if (apiKey) {
      // Send via SendGrid
      const [response] = await sgMail.send(msg)
      console.log(`Email sent successfully: ${response.statusCode}`)
      
      // Save to sent folder
      await saveEmailToFile({
        ...msg,
        folder: "sent",
        timestamp: new Date().toISOString(),
      })
      
      return { success: true, messageId: response.headers["x-message-id"] }
    } else {
      // Fallback: save to file system if no API key
      console.log("SendGrid API key not configured, saving email to file system")
      await saveEmailToFile({
        ...msg,
        folder: "sent",
        timestamp: new Date().toISOString(),
      })
      
      return { success: true, messageId: `local_${Date.now()}` }
    }
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}

async function saveEmailToFile(email: any) {
  const sentPath = path.join(process.cwd(), ".agent", "inbox", "sent")
  await fs.mkdir(sentPath, { recursive: true })
  
  const filename = `${Date.now()}_${email.to.replace(/[^a-zA-Z0-9]/g, "_")}.json`
  await fs.writeFile(
    path.join(sentPath, filename),
    JSON.stringify(email, null, 2)
  )
}