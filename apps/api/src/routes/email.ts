import { Hono } from "hono"
import { z } from "zod"
import { getDb } from "../db"
import { emails } from "../db/schema"
import { eq, desc } from "drizzle-orm"
import { sendEmail } from "../services/sendgrid"

const emailRoutes = new Hono()

// Get all emails
emailRoutes.get("/", async (c) => {
  const db = getDb()
  const folder = c.req.query("folder") || "inbox"
  
  const result = await db
    .select()
    .from(emails)
    .where(eq(emails.folder, folder))
    .orderBy(desc(emails.createdAt))
    .limit(50)
  
  return c.json(result)
})

// Get single email
emailRoutes.get("/:id", async (c) => {
  const db = getDb()
  const id = c.req.param("id")
  
  const result = await db
    .select()
    .from(emails)
    .where(eq(emails.id, id))
    .limit(1)
  
  if (result.length === 0) {
    return c.json({ error: "Email not found" }, 404)
  }
  
  // Mark as read
  await db
    .update(emails)
    .set({ unread: false })
    .where(eq(emails.id, id))
  
  return c.json(result[0])
})

// Send email
const sendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  body: z.string(),
  cc: z.string().optional(),
  bcc: z.string().optional(),
})

emailRoutes.post("/send", async (c) => {
  const db = getDb()
  
  try {
    const body = await c.req.json()
    const data = sendEmailSchema.parse(body)
    
    // Send via SendGrid
    const result = await sendEmail({
      to: data.to,
      subject: data.subject,
      text: data.body,
      html: data.body,
    })
    
    // Save to sent folder
    const emailId = `email_${Date.now()}`
    await db.insert(emails).values({
      id: emailId,
      fromAddress: "agent@lambda.run",
      toAddress: data.to,
      cc: data.cc,
      bcc: data.bcc,
      subject: data.subject,
      body: data.body,
      folder: "sent",
      unread: false,
    })
    
    return c.json({ success: true, id: emailId })
  } catch (error) {
    console.error("Failed to send email:", error)
    return c.json({ error: "Failed to send email" }, 500)
  }
})

// Star/unstar email
emailRoutes.patch("/:id/star", async (c) => {
  const db = getDb()
  const id = c.req.param("id")
  const { starred } = await c.req.json()
  
  await db
    .update(emails)
    .set({ starred })
    .where(eq(emails.id, id))
  
  return c.json({ success: true })
})

// Move email to folder
emailRoutes.patch("/:id/move", async (c) => {
  const db = getDb()
  const id = c.req.param("id")
  const { folder } = await c.req.json()
  
  await db
    .update(emails)
    .set({ folder })
    .where(eq(emails.id, id))
  
  return c.json({ success: true })
})

// Delete email
emailRoutes.delete("/:id", async (c) => {
  const db = getDb()
  const id = c.req.param("id")
  
  await db
    .update(emails)
    .set({ folder: "trash" })
    .where(eq(emails.id, id))
  
  return c.json({ success: true })
})

export default emailRoutes