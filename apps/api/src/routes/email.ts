import { Hono } from "hono"
import { z } from "zod"
import { getDb } from "../db"
import { emails } from "../db/schema"
import { eq, desc } from "drizzle-orm"
import { sendEmail } from "../services/gmail"
import { analyzeEmail, generateSmartReply, summarizeEmailThread, extractTasksFromEmails } from "../services/emailAI"

const emailRoutes = new Hono()

// Get all emails with AI analysis
emailRoutes.get("/", async (c) => {
  const db = getDb()
  const folder = c.req.query("folder") || "inbox"
  const analyze = c.req.query("analyze") === "true"
  
  const result = await db
    .select()
    .from(emails)
    .where(eq(emails.folder, folder))
    .orderBy(desc(emails.createdAt))
    .limit(50)
  
  // Add AI analysis if requested
  if (analyze && result.length > 0) {
    const enhancedEmails = await Promise.all(
      result.map(async (email) => {
        try {
          const analysis = await analyzeEmail(email.body || '')
          return {
            ...email,
            ...analysis
          }
        } catch {
          return email
        }
      })
    )
    return c.json(enhancedEmails)
  }
  
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
    
    // Send via Gmail
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

// AI: Analyze email content
emailRoutes.post("/analyze", async (c) => {
  try {
    const { content } = await c.req.json()
    const analysis = await analyzeEmail(content)
    return c.json(analysis)
  } catch (error) {
    console.error("Error analyzing email:", error)
    return c.json({ error: "Failed to analyze email" }, 500)
  }
})

// AI: Generate smart reply
emailRoutes.post("/smart-reply", async (c) => {
  try {
    const { originalEmail, context, tone } = await c.req.json()
    const draft = await generateSmartReply(originalEmail, context, tone)
    return c.json(draft)
  } catch (error) {
    console.error("Error generating smart reply:", error)
    return c.json({ error: "Failed to generate reply" }, 500)
  }
})

// AI: Summarize email thread
emailRoutes.post("/summarize-thread", async (c) => {
  try {
    const { threadId } = await c.req.json()
    const db = getDb()
    
    // Get all emails in thread (mock for now - would need thread tracking)
    const threadEmails = await db
      .select()
      .from(emails)
      .where(eq(emails.subject, threadId)) // Simple thread matching by subject
      .orderBy(emails.createdAt)
    
    if (threadEmails.length === 0) {
      return c.json({ error: "Thread not found" }, 404)
    }
    
    const summary = await summarizeEmailThread(threadEmails)
    return c.json(summary)
  } catch (error) {
    console.error("Error summarizing thread:", error)
    return c.json({ error: "Failed to summarize thread" }, 500)
  }
})

// AI: Extract tasks from emails
emailRoutes.post("/extract-tasks", async (c) => {
  try {
    const { timeRange = "today" } = await c.req.json()
    const db = getDb()
    
    // Get recent emails
    const recentEmails = await db
      .select()
      .from(emails)
      .where(eq(emails.folder, "inbox"))
      .orderBy(desc(emails.createdAt))
      .limit(20)
    
    const tasks = await extractTasksFromEmails(recentEmails)
    return c.json(tasks)
  } catch (error) {
    console.error("Error extracting tasks:", error)
    return c.json({ error: "Failed to extract tasks" }, 500)
  }
})

export default emailRoutes