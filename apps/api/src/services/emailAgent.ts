import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { sendEmail } from "./sendgrid"
import { analyzeEmail, extractTasksFromEmails } from "./emailAI"
import * as fs from "fs/promises"
import * as path from "path"

interface AgentConfig {
  autoReply: boolean
  smartCategorization: boolean
  taskExtraction: boolean
  priorityFiltering: boolean
  learningMode: boolean
}

interface EmailRule {
  condition: 'sender' | 'subject' | 'content' | 'sentiment'
  value: string
  action: 'categorize' | 'prioritize' | 'forward' | 'archive' | 'reply'
  actionValue?: string
}

class EmailAgent {
  private config: AgentConfig
  private rules: EmailRule[]
  private userPreferences: Map<string, any>

  constructor(config: Partial<AgentConfig> = {}) {
    this.config = {
      autoReply: false,
      smartCategorization: true,
      taskExtraction: true,
      priorityFiltering: true,
      learningMode: true,
      ...config
    }
    this.rules = []
    this.userPreferences = new Map()
  }

  async processIncomingEmail(email: any) {
    const analysis = await analyzeEmail(email.body || email.text || '')
    
    // Apply smart categorization
    if (this.config.smartCategorization) {
      email.category = analysis.category
      email.priority = analysis.priority
      email.sentiment = analysis.sentiment
    }

    // Extract tasks if enabled
    if (this.config.taskExtraction && analysis.suggestedActions.length > 0) {
      await this.saveTasksToAgent(analysis.suggestedActions, email.from)
    }

    // Apply rules
    for (const rule of this.rules) {
      if (this.matchesRule(email, rule)) {
        await this.executeRule(email, rule)
      }
    }

    // Learn from user behavior if enabled
    if (this.config.learningMode) {
      await this.learnFromEmail(email, analysis)
    }

    return { email, analysis }
  }

  private matchesRule(email: any, rule: EmailRule): boolean {
    switch (rule.condition) {
      case 'sender':
        return email.from?.includes(rule.value)
      case 'subject':
        return email.subject?.toLowerCase().includes(rule.value.toLowerCase())
      case 'content':
        return email.body?.toLowerCase().includes(rule.value.toLowerCase())
      case 'sentiment':
        return email.sentiment === rule.value
      default:
        return false
    }
  }

  private async executeRule(email: any, rule: EmailRule) {
    switch (rule.action) {
      case 'categorize':
        email.category = rule.actionValue
        break
      case 'prioritize':
        email.priority = rule.actionValue as any
        break
      case 'archive':
        email.folder = 'archive'
        break
      case 'reply':
        if (this.config.autoReply && rule.actionValue) {
          await this.sendAutoReply(email, rule.actionValue)
        }
        break
    }
  }

  private async sendAutoReply(email: any, template: string) {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Create an auto-reply based on this template: "${template}"
      
Original email from ${email.from}:
${email.body}

Generate a polite, professional auto-reply.`,
      system: "You are an email assistant creating automatic replies."
    })

    await sendEmail({
      to: email.from,
      subject: `Re: ${email.subject}`,
      text,
      html: text
    })
  }

  private async saveTasksToAgent(tasks: string[], from: string) {
    const tasksPath = path.join(process.cwd(), '.agent', 'tasks.json')
    let existingTasks = []
    
    try {
      const content = await fs.readFile(tasksPath, 'utf-8')
      existingTasks = JSON.parse(content)
    } catch {
      // File doesn't exist yet
    }

    const newTasks = tasks.map(task => ({
      task,
      from,
      createdAt: new Date().toISOString(),
      status: 'pending'
    }))

    await fs.writeFile(
      tasksPath,
      JSON.stringify([...existingTasks, ...newTasks], null, 2)
    )
  }

  private async learnFromEmail(email: any, analysis: any) {
    // Store patterns for future use
    const patternsPath = path.join(process.cwd(), '.agent', 'patterns.json')
    let patterns = {}
    
    try {
      const content = await fs.readFile(patternsPath, 'utf-8')
      patterns = JSON.parse(content)
    } catch {
      // File doesn't exist yet
    }

    // Learn sender patterns
    if (!patterns[email.from]) {
      patterns[email.from] = {
        typicalSentiment: [],
        typicalPriority: [],
        typicalCategories: []
      }
    }

    patterns[email.from].typicalSentiment.push(analysis.sentiment)
    patterns[email.from].typicalPriority.push(analysis.priority)
    patterns[email.from].typicalCategories.push(analysis.category)

    await fs.writeFile(patternsPath, JSON.stringify(patterns, null, 2))
  }

  addRule(rule: EmailRule) {
    this.rules.push(rule)
  }

  async generateDailyDigest(emails: any[]) {
    const { tasks } = await extractTasksFromEmails(emails)
    
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Create a daily email digest from these ${emails.length} emails.
      
Include:
1. Summary of important emails
2. Tasks and action items extracted
3. Upcoming meetings or deadlines
4. Priority items needing attention

Emails: ${JSON.stringify(emails.slice(0, 10))}
Tasks: ${JSON.stringify(tasks)}`,
      system: "You are creating a concise, actionable daily email digest."
    })

    return text
  }

  async suggestOptimizations(emailPatterns: any) {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Based on these email patterns, suggest inbox optimizations:
      
${JSON.stringify(emailPatterns)}

Suggest:
1. Filters to create
2. Categories to use
3. Auto-reply templates
4. Time-saving automation rules`,
      system: "You are an email productivity expert."
    })

    return text
  }
}

export default EmailAgent
export { EmailAgent, type AgentConfig, type EmailRule }