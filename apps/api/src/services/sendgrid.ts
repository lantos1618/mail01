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

export async function receiveEmail(email: {
  from: string
  to: string
  subject: string
  body: string
  html?: string
  attachments?: any[]
  messageId?: string
  threadId?: string
}) {
  const receivedPath = path.join(process.cwd(), "agent", "inbox", "received")
  await fs.mkdir(receivedPath, { recursive: true })
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `${timestamp}_${email.from.replace(/[^a-zA-Z0-9]/g, "_")}.json`
  
  const emailRecord = {
    ...email,
    id: `received_${Date.now()}`,
    timestamp: new Date().toISOString(),
    folder: 'received',
    status: 'unread',
    metadata: {
      sender: email.from,
      recipient: email.to,
      subject: email.subject,
      hasAttachments: (email.attachments?.length || 0) > 0,
      threadId: email.threadId || null,
      labels: [],
      priority: 'normal'
    }
  }
  
  await fs.writeFile(
    path.join(receivedPath, filename),
    JSON.stringify(emailRecord, null, 2)
  )
  
  return emailRecord
}

export async function getInboxEmails(folder: 'sent' | 'received' | 'drafts' | 'archived' = 'received') {
  const inboxPath = path.join(process.cwd(), "agent", "inbox", folder)
  
  try {
    await fs.mkdir(inboxPath, { recursive: true })
    const files = await fs.readdir(inboxPath)
    const emails = []
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(inboxPath, file), 'utf-8')
        emails.push(JSON.parse(content))
      }
    }
    
    // Sort by timestamp, newest first
    emails.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    return emails
  } catch (error) {
    console.error(`Error reading ${folder} emails:`, error)
    return []
  }
}

export async function archiveEmail(emailId: string, fromFolder: string = 'received') {
  const sourcePath = path.join(process.cwd(), "agent", "inbox", fromFolder)
  const archivePath = path.join(process.cwd(), "agent", "inbox", "archived")
  
  await fs.mkdir(archivePath, { recursive: true })
  
  const files = await fs.readdir(sourcePath)
  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(sourcePath, file)
      const content = await fs.readFile(filePath, 'utf-8')
      const email = JSON.parse(content)
      
      if (email.id === emailId) {
        email.folder = 'archived'
        email.archivedFrom = fromFolder
        email.archivedAt = new Date().toISOString()
        
        // Write to archive
        await fs.writeFile(
          path.join(archivePath, file),
          JSON.stringify(email, null, 2)
        )
        
        // Remove from source
        await fs.unlink(filePath)
        
        return email
      }
    }
  }
  
  throw new Error(`Email ${emailId} not found in ${fromFolder}`)
}

export async function sendEmail(options: EmailOptions & { 
  priority?: 'high' | 'normal' | 'low'
  labels?: string[]
  threadId?: string
  saveToInbox?: boolean
}) {
  const { 
    to, 
    subject, 
    text, 
    html, 
    from = "agent@lambda.run", 
    cc, 
    bcc,
    priority = 'normal',
    labels = [],
    threadId,
    saveToInbox = true
  } = options
  
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
    let response: any
    let messageId: string
    
    if (apiKey) {
      // Send via SendGrid
      const [sgResponse] = await sgMail.send(msg)
      console.log(`Email sent successfully: ${sgResponse.statusCode}`)
      response = sgResponse
      messageId = sgResponse.headers["x-message-id"] || `sg_${Date.now()}`
    } else {
      // Fallback: save to file system if no API key
      console.log("SendGrid API key not configured, saving email to file system")
      messageId = `local_${Date.now()}`
    }
    
    // Save to inbox if requested
    let savedEmail = null
    if (saveToInbox) {
      savedEmail = await saveEmailToFile({
        ...msg,
        folder: "sent",
        timestamp: new Date().toISOString(),
        messageId,
        priority,
        labels,
        threadId
      })
    }
    
    return { 
      success: true, 
      messageId,
      savedEmail
    }
  } catch (error) {
    console.error("Error sending email:", error)
    
    // Save failed email to drafts
    await saveEmailToFile({
      ...msg,
      folder: "drafts",
      timestamp: new Date().toISOString(),
      error: error.message,
      priority,
      labels,
      threadId
    })
    
    throw error
  }
}

async function saveEmailToFile(email: any) {
  const folder = email.folder || "sent"
  const inboxPath = path.join(process.cwd(), "agent", "inbox", folder)
  await fs.mkdir(inboxPath, { recursive: true })
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `${timestamp}_${email.to.replace(/[^a-zA-Z0-9]/g, "_")}.json`
  
  const emailRecord = {
    ...email,
    id: `${folder}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    folder,
    status: 'sent',
    metadata: {
      sender: email.from,
      recipient: email.to,
      subject: email.subject,
      hasAttachments: false,
      threadId: email.threadId || null,
      labels: email.labels || [],
      priority: email.priority || 'normal'
    }
  }
  
  await fs.writeFile(
    path.join(inboxPath, filename),
    JSON.stringify(emailRecord, null, 2)
  )
  
  return emailRecord
}