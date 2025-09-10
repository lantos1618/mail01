import { z } from "zod"
import { tool } from "ai"
import { 
  analyzeEmail, 
  generateSmartReply, 
  summarizeEmailThread,
  extractTasksFromEmails,
  generateEmailFromBulletPoints,
  detectEmailIntent,
  suggestEmailTemplates,
  improveEmailDraft
} from "../services/emailAI"
import { 
  sendEmail, 
  receiveEmail, 
  getInboxEmails, 
  archiveEmail 
} from "../services/gmail"
import { EmailAgent } from "../services/emailAgent"

// Initialize email agent
const emailAgent = new EmailAgent({
  autoReply: false,
  smartCategorization: true,
  taskExtraction: true,
  priorityFiltering: true,
  learningMode: true
})

export const analyzeEmailTool = tool({
  description: "Analyze an email for sentiment, priority, and key information",
  parameters: z.object({
    content: z.string().describe("The email content to analyze"),
  }),
  execute: async ({ content }) => {
    const analysis = await analyzeEmail(content)
    return {
      analysis,
      summary: `Email is ${analysis.sentiment} with ${analysis.priority} priority. Category: ${analysis.category}`
    }
  }
})

export const composeEmailTool = tool({
  description: "Compose a new email with AI assistance",
  parameters: z.object({
    recipient: z.string().describe("Email recipient"),
    bulletPoints: z.array(z.string()).describe("Key points to include"),
    tone: z.enum(['formal', 'casual', 'friendly', 'professional']).optional(),
    context: z.string().optional().describe("Additional context"),
  }),
  execute: async ({ recipient, bulletPoints, tone = 'professional', context }) => {
    const draft = await generateEmailFromBulletPoints(bulletPoints, recipient, context, tone)
    return draft
  }
})

export const replyToEmailTool = tool({
  description: "Generate a smart reply to an email",
  parameters: z.object({
    originalEmail: z.string().describe("The original email to reply to"),
    context: z.string().optional().describe("Additional context for the reply"),
    tone: z.enum(['formal', 'casual', 'friendly', 'professional']).optional(),
  }),
  execute: async ({ originalEmail, context, tone = 'professional' }) => {
    const reply = await generateSmartReply(originalEmail, context, tone)
    return reply
  }
})

export const summarizeThreadTool = tool({
  description: "Summarize an email thread or conversation",
  parameters: z.object({
    emails: z.array(z.object({
      from: z.string(),
      date: z.string(),
      content: z.string()
    })).describe("Array of emails in the thread"),
  }),
  execute: async ({ emails }) => {
    const summary = await summarizeEmailThread(emails)
    return summary
  }
})

export const extractTasksTool = tool({
  description: "Extract tasks and meetings from emails",
  parameters: z.object({
    emails: z.array(z.object({
      from: z.string(),
      date: z.string(),
      content: z.string()
    })).describe("Emails to extract tasks from"),
  }),
  execute: async ({ emails }) => {
    const { tasks, meetings } = await extractTasksFromEmails(emails)
    return {
      tasks,
      meetings,
      summary: `Found ${tasks.length} tasks and ${meetings.length} meetings`
    }
  }
})

export const sendEmailTool = tool({
  description: "Send an email via SendGrid",
  parameters: z.object({
    to: z.string().describe("Recipient email address"),
    subject: z.string().describe("Email subject"),
    body: z.string().describe("Email body (text or HTML)"),
    from: z.string().optional().default("agent@lambda.run"),
    priority: z.enum(['high', 'normal', 'low']).optional(),
    labels: z.array(z.string()).optional(),
  }),
  execute: async ({ to, subject, body, from, priority, labels }) => {
    const result = await sendEmail({
      to,
      subject,
      text: body,
      html: body,
      from,
      priority,
      labels,
      saveToInbox: true
    })
    return {
      success: result.success,
      messageId: result.messageId,
      message: `Email sent successfully to ${to}`
    }
  }
})

export const getEmailsTool = tool({
  description: "Get emails from the inbox",
  parameters: z.object({
    folder: z.enum(['sent', 'received', 'drafts', 'archived']).optional().default('received'),
    limit: z.number().optional().default(10),
  }),
  execute: async ({ folder, limit }) => {
    const emails = await getInboxEmails(folder)
    const limitedEmails = emails.slice(0, limit)
    return {
      emails: limitedEmails,
      total: emails.length,
      folder,
      summary: `Found ${emails.length} emails in ${folder} folder`
    }
  }
})

export const detectIntentTool = tool({
  description: "Detect the intent and urgency of an email",
  parameters: z.object({
    content: z.string().describe("Email content to analyze"),
  }),
  execute: async ({ content }) => {
    const intent = await detectEmailIntent(content)
    return {
      ...intent,
      summary: `Primary intent: ${intent.primaryIntent} with ${intent.urgency} urgency`
    }
  }
})

export const improveEmailTool = tool({
  description: "Improve an email draft for clarity and effectiveness",
  parameters: z.object({
    draft: z.string().describe("Email draft to improve"),
    improvements: z.array(
      z.enum(['clarity', 'tone', 'grammar', 'conciseness', 'persuasiveness'])
    ).describe("Areas to improve"),
  }),
  execute: async ({ draft, improvements }) => {
    const result = await improveEmailDraft(draft, improvements)
    return result
  }
})

export const suggestTemplatesTool = tool({
  description: "Get email template suggestions for common scenarios",
  parameters: z.object({
    scenario: z.string().describe("Scenario for templates (e.g., 'follow-up', 'introduction', 'apology')"),
  }),
  execute: async ({ scenario }) => {
    const { templates } = await suggestEmailTemplates(scenario)
    return {
      templates,
      summary: `Generated ${templates.length} templates for ${scenario}`
    }
  }
})

export const processIncomingEmailTool = tool({
  description: "Process an incoming email with AI agent",
  parameters: z.object({
    email: z.object({
      from: z.string(),
      to: z.string(),
      subject: z.string(),
      body: z.string(),
      messageId: z.string().optional(),
    }),
  }),
  execute: async ({ email }) => {
    // Save to inbox
    const savedEmail = await receiveEmail(email)
    
    // Process with AI agent
    const { analysis } = await emailAgent.processIncomingEmail(email)
    
    return {
      savedEmail,
      analysis,
      summary: `Email from ${email.from} processed: ${analysis.category} (${analysis.priority} priority)`
    }
  }
})

export const archiveEmailTool = tool({
  description: "Archive an email",
  parameters: z.object({
    emailId: z.string().describe("ID of the email to archive"),
    fromFolder: z.string().optional().default('received'),
  }),
  execute: async ({ emailId, fromFolder }) => {
    const archived = await archiveEmail(emailId, fromFolder)
    return {
      archived,
      message: `Email ${emailId} archived successfully`
    }
  }
})

export const generateDailyDigestTool = tool({
  description: "Generate a daily digest of emails",
  parameters: z.object({
    date: z.string().optional().describe("Date for digest (defaults to today)"),
  }),
  execute: async ({ date }) => {
    const emails = await getInboxEmails('received')
    const today = date || new Date().toISOString().split('T')[0]
    
    // Filter emails from the specified date
    const todaysEmails = emails.filter(e => 
      e.timestamp.startsWith(today)
    )
    
    if (todaysEmails.length === 0) {
      return {
        digest: "No emails to summarize for " + today,
        emailCount: 0
      }
    }
    
    const digest = await emailAgent.generateDailyDigest(todaysEmails)
    return {
      digest,
      emailCount: todaysEmails.length,
      date: today
    }
  }
})

// Export all tools as a collection
export const emailTools = {
  analyzeEmail: analyzeEmailTool,
  composeEmail: composeEmailTool,
  replyToEmail: replyToEmailTool,
  summarizeThread: summarizeThreadTool,
  extractTasks: extractTasksTool,
  sendEmail: sendEmailTool,
  getEmails: getEmailsTool,
  detectIntent: detectIntentTool,
  improveEmail: improveEmailTool,
  suggestTemplates: suggestTemplatesTool,
  processIncomingEmail: processIncomingEmailTool,
  archiveEmail: archiveEmailTool,
  generateDailyDigest: generateDailyDigestTool,
}

// Export tool descriptions for UI
export const toolDescriptions = Object.entries(emailTools).map(([key, tool]) => ({
  name: key,
  description: tool.description,
  parameters: tool.parameters
}))