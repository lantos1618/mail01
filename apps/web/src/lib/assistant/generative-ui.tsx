"use client"

// GenerativeUI components have been removed or deprecated in v0.11.0
// import { GenerativeUI, useGenerativeUI, makeGenerativeComponent } from "@assistant-ui/react"
import { z } from "zod"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { 
  Sparkles, TrendingUp, Users, Mail, Calendar,
  BarChart3, PieChart, Activity, Zap
} from "lucide-react"

// Dynamic Email Dashboard Component
const EmailDashboardSchema = z.object({
  metrics: z.object({
    totalEmails: z.number(),
    unread: z.number(),
    sent: z.number(),
    responseRate: z.number(),
    avgResponseTime: z.string()
  }),
  trends: z.array(z.object({
    date: z.string(),
    received: z.number(),
    sent: z.number()
  })),
  topContacts: z.array(z.object({
    name: z.string(),
    email: z.string(),
    count: z.number(),
    sentiment: z.enum(["positive", "neutral", "negative"])
  }))
})

// Converted to regular React component - makeGenerativeComponent deprecated
export const EmailDashboard = ({ data }: { data: z.infer<typeof EmailDashboardSchema> }) => {
    const [selectedMetric, setSelectedMetric] = useState<string>("overview")
    
    return (
      <div className="w-full space-y-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Email Analytics Dashboard
          </h2>
          <Badge variant="secondary" className="animate-pulse">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Generated
          </Badge>
        </div>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedMetric("total")}>
            <div className="text-2xl font-bold">{data.metrics.totalEmails}</div>
            <div className="text-xs text-muted-foreground">Total Emails</div>
          </Card>
          
          <Card className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedMetric("unread")}>
            <div className="text-2xl font-bold text-orange-600">{data.metrics.unread}</div>
            <div className="text-xs text-muted-foreground">Unread</div>
          </Card>
          
          <Card className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedMetric("sent")}>
            <div className="text-2xl font-bold text-blue-600">{data.metrics.sent}</div>
            <div className="text-xs text-muted-foreground">Sent</div>
          </Card>
          
          <Card className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedMetric("response")}>
            <div className="text-2xl font-bold text-green-600">{data.metrics.responseRate}%</div>
            <div className="text-xs text-muted-foreground">Response Rate</div>
          </Card>
          
          <Card className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedMetric("time")}>
            <div className="text-2xl font-bold">{data.metrics.avgResponseTime}</div>
            <div className="text-xs text-muted-foreground">Avg Response</div>
          </Card>
        </div>
        
        {/* Trend Chart (Simplified) */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Email Trends (Last 7 Days)
          </h3>
          <div className="flex items-end justify-between h-24 gap-1">
            {data.trends.slice(-7).map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-t"
                     style={{ height: `${(day.received / 50) * 100}%` }} />
                <div className="w-full bg-green-200 dark:bg-green-800 rounded-b"
                     style={{ height: `${(day.sent / 50) * 100}%` }} />
                <span className="text-xs text-muted-foreground">
                  {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Top Contacts */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Top Contacts
          </h3>
          <div className="space-y-2">
            {data.topContacts.slice(0, 5).map((contact) => (
              <div key={contact.email} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {contact.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{contact.name}</div>
                    <div className="text-xs text-muted-foreground">{contact.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    contact.sentiment === "positive" ? "default" :
                    contact.sentiment === "negative" ? "destructive" : "secondary"
                  } className="text-xs">
                    {contact.sentiment}
                  </Badge>
                  <span className="text-sm font-medium">{contact.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
}

// Dynamic Email Workflow Builder
const WorkflowSchema = z.object({
  name: z.string(),
  triggers: z.array(z.object({
    type: z.enum(["email_received", "time_based", "keyword", "sender"]),
    condition: z.string()
  })),
  actions: z.array(z.object({
    type: z.enum(["reply", "forward", "categorize", "flag", "archive"]),
    parameters: z.record(z.any())
  })),
  enabled: z.boolean()
})

export const EmailWorkflow = ({ data, onUpdate }: { data: z.infer<typeof WorkflowSchema>; onUpdate?: (data: z.infer<typeof WorkflowSchema>) => void }) => {
    const [isEditing, setIsEditing] = useState(false)
    
    return (
      <Card className="p-4 border-l-4 border-l-purple-500">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold">{data.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={data.enabled ? "default" : "outline"}
              size="sm"
              onClick={() => onUpdate?.({ ...data, enabled: !data.enabled })}
            >
              {data.enabled ? "Active" : "Inactive"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Done" : "Edit"}
            </Button>
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Triggers */}
          <div>
            <div className="text-sm font-medium mb-1">When:</div>
            <div className="space-y-1">
              {data.triggers.map((trigger, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded">
                  <Badge variant="outline" className="text-xs">
                    {trigger.type.replace('_', ' ')}
                  </Badge>
                  <span className="text-muted-foreground">{trigger.condition}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div>
            <div className="text-sm font-medium mb-1">Then:</div>
            <div className="space-y-1">
              {data.actions.map((action, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded">
                  <Badge className="text-xs">
                    {action.type}
                  </Badge>
                  <span className="text-muted-foreground">
                    {Object.entries(action.parameters).map(([k, v]) => `${k}: ${v}`).join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {isEditing && (
          <div className="mt-3 p-3 border rounded-lg bg-muted/30">
            <div className="text-sm text-muted-foreground">
              Workflow editing interface would appear here
            </div>
          </div>
        )}
      </Card>
    )
}

// Dynamic Priority Inbox
const PriorityInboxSchema = z.object({
  categories: z.array(z.object({
    name: z.string(),
    color: z.string(),
    count: z.number(),
    emails: z.array(z.object({
      id: z.string(),
      subject: z.string(),
      from: z.string(),
      preview: z.string(),
      priority: z.number(),
      aiReason: z.string()
    }))
  }))
})

export const PriorityInbox = ({ data }: { data: z.infer<typeof PriorityInboxSchema> }) => {
    const [selectedCategory, setSelectedCategory] = useState(0)
    
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold">AI Priority Inbox</h2>
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="w-3 h-3 mr-1" />
            Auto-organized
          </Badge>
        </div>
        
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {data.categories.map((cat, idx) => (
            <Button
              key={idx}
              variant={selectedCategory === idx ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(idx)}
              className="whitespace-nowrap"
            >
              <div className="w-2 h-2 rounded-full mr-2" 
                   style={{ backgroundColor: cat.color }} />
              {cat.name}
              <Badge variant="secondary" className="ml-2">
                {cat.count}
              </Badge>
            </Button>
          ))}
        </div>
        
        {/* Email List */}
        <div className="space-y-2">
          {data.categories[selectedCategory]?.emails.map((email) => (
            <Card key={email.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{email.from}</span>
                    <Badge variant="outline" className="text-xs">
                      Priority: {email.priority}/10
                    </Badge>
                  </div>
                  <div className="font-semibold mb-1">{email.subject}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {email.preview}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Sparkles className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs text-muted-foreground italic">
                      {email.aiReason}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
}

// Compose all generative UI components
export const emailGenerativeComponents = [
  EmailDashboard,
  EmailWorkflow,
  PriorityInbox
]

// Hook for using generative UI in email context - simplified due to deprecation
export function useEmailGenerativeUI() {
  // useGenerativeUI has been deprecated in v0.11.0
  // return useGenerativeUI({
  //   components: emailGenerativeComponents,
  //   onGenerate: async (component, props) => {
  //     // Add any custom generation logic here
  //     console.log(`Generating ${component} with props:`, props)
  //   }
  // })
  return {
    components: emailGenerativeComponents,
    onGenerate: async (component: string, props: any) => {
      console.log(`Generating ${component} with props:`, props)
    }
  }
}