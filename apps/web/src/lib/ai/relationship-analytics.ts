import { z } from 'zod'

// Email Relationship Analytics Engine
export class EmailRelationshipAnalytics {
  private relationships: Map<string, RelationshipProfile> = new Map()
  private communicationPatterns: Map<string, CommunicationPattern> = new Map()
  private networkGraph: NetworkGraph = { nodes: [], edges: [] }
  
  async analyzeRelationship(email: string): Promise<RelationshipProfile> {
    let profile = this.relationships.get(email)
    
    if (!profile) {
      profile = await this.createRelationshipProfile(email)
      this.relationships.set(email, profile)
    }
    
    return profile
  }
  
  private async createRelationshipProfile(email: string): Promise<RelationshipProfile> {
    // Simulate fetching email history
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const profile: RelationshipProfile = {
      email,
      name: this.extractName(email),
      organization: this.extractOrganization(email),
      role: this.inferRole(email),
      firstContact: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
      lastContact: new Date(),
      totalEmails: Math.floor(Math.random() * 200) + 50,
      sentEmails: Math.floor(Math.random() * 100) + 25,
      receivedEmails: Math.floor(Math.random() * 100) + 25,
      averageResponseTime: Math.floor(Math.random() * 48) + 1, // hours
      communicationFrequency: this.calculateFrequency(),
      importance: this.calculateImportance(email),
      sentiment: {
        overall: 'positive',
        history: [
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), score: 0.7 },
          { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), score: 0.8 },
          { date: new Date(), score: 0.85 },
        ],
      },
      topics: this.extractTopics(),
      collaborationScore: Math.random() * 100,
      responseRate: 0.85 + Math.random() * 0.15,
      meetingHistory: this.generateMeetingHistory(),
      sharedProjects: ['Q4 Planning', 'Product Launch', 'Budget Review'],
      communicationStyle: {
        formality: Math.random() > 0.5 ? 'formal' : 'casual',
        brevity: Math.random() > 0.5 ? 'concise' : 'detailed',
        tone: ['professional', 'friendly', 'direct'][Math.floor(Math.random() * 3)],
        preferredChannel: 'email',
        preferredTime: 'morning',
      },
      insights: this.generateInsights(email),
      recommendations: this.generateRecommendations(email),
    }
    
    return profile
  }
  
  private extractName(email: string): string {
    const nameMatch = email.match(/^([^@]+)/)
    if (nameMatch) {
      return nameMatch[1]
        .split(/[._-]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    }
    return 'Unknown'
  }
  
  private extractOrganization(email: string): string {
    const domainMatch = email.match(/@(.+)/)
    if (domainMatch) {
      const domain = domainMatch[1].split('.')[0]
      return domain.charAt(0).toUpperCase() + domain.slice(1)
    }
    return 'Unknown'
  }
  
  private inferRole(email: string): string {
    const roleKeywords = {
      'ceo': 'Chief Executive Officer',
      'cto': 'Chief Technology Officer',
      'cfo': 'Chief Financial Officer',
      'pm': 'Project Manager',
      'dev': 'Developer',
      'sales': 'Sales Representative',
      'support': 'Support Specialist',
      'hr': 'Human Resources',
      'marketing': 'Marketing Manager',
    }
    
    const emailLower = email.toLowerCase()
    for (const [keyword, role] of Object.entries(roleKeywords)) {
      if (emailLower.includes(keyword)) {
        return role
      }
    }
    
    return 'Team Member'
  }
  
  private calculateFrequency(): 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'sporadic' {
    const freq = Math.random()
    if (freq > 0.8) return 'daily'
    if (freq > 0.6) return 'weekly'
    if (freq > 0.4) return 'biweekly'
    if (freq > 0.2) return 'monthly'
    return 'sporadic'
  }
  
  private calculateImportance(email: string): 'critical' | 'high' | 'medium' | 'low' {
    if (email.includes('ceo') || email.includes('cto')) return 'critical'
    if (email.includes('manager') || email.includes('director')) return 'high'
    if (email.includes('team') || email.includes('project')) return 'medium'
    return 'low'
  }
  
  private extractTopics(): string[] {
    const topicPool = [
      'Project Management',
      'Budget Planning',
      'Product Development',
      'Sales Strategy',
      'Team Updates',
      'Client Relations',
      'Technical Discussion',
      'Performance Review',
      'Marketing Campaign',
      'Quarterly Reports',
    ]
    
    const numTopics = Math.floor(Math.random() * 4) + 2
    return topicPool.sort(() => Math.random() - 0.5).slice(0, numTopics)
  }
  
  private generateMeetingHistory(): Meeting[] {
    const meetings: Meeting[] = []
    const numMeetings = Math.floor(Math.random() * 10) + 5
    
    for (let i = 0; i < numMeetings; i++) {
      meetings.push({
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        subject: ['Weekly Sync', 'Project Review', '1:1 Meeting', 'Team Standup'][Math.floor(Math.random() * 4)],
        duration: Math.floor(Math.random() * 60) + 15,
        attendees: Math.floor(Math.random() * 8) + 2,
      })
    }
    
    return meetings.sort((a, b) => b.date.getTime() - a.date.getTime())
  }
  
  private generateInsights(email: string): string[] {
    const insights = []
    
    insights.push(`Most active communication on ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][Math.floor(Math.random() * 5)]}s`)
    insights.push(`Response time improved by ${Math.floor(Math.random() * 30) + 10}% over last month`)
    insights.push(`Key collaborator on ${Math.floor(Math.random() * 5) + 2} active projects`)
    insights.push(`Prefers ${Math.random() > 0.5 ? 'morning' : 'afternoon'} meetings`)
    
    if (email.includes('manager')) {
      insights.push('Decision maker - prioritize responses')
    }
    
    return insights
  }
  
  private generateRecommendations(email: string): string[] {
    const recommendations = []
    
    recommendations.push('Schedule quarterly check-in meeting')
    recommendations.push('Share project updates more frequently')
    
    if (Math.random() > 0.5) {
      recommendations.push('Consider moving to weekly sync meetings')
    }
    
    if (Math.random() > 0.7) {
      recommendations.push('Introduce to potential collaboration partner')
    }
    
    return recommendations
  }
  
  // Communication Pattern Analysis
  
  async analyzeCommunicationPatterns(timeRange?: { start: Date; end: Date }): Promise<CommunicationInsights> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const insights: CommunicationInsights = {
      totalContacts: this.relationships.size,
      activeContacts: Math.floor(this.relationships.size * 0.7),
      newContacts: Math.floor(Math.random() * 20) + 5,
      topCommunicators: this.getTopCommunicators(),
      communicationTrends: this.generateCommunicationTrends(),
      networkHealth: {
        score: 85 + Math.random() * 15,
        strengths: [
          'Regular communication with key stakeholders',
          'Quick response times to urgent emails',
          'Good balance between sending and receiving',
        ],
        improvements: [
          'Increase touchpoints with dormant contacts',
          'Schedule more regular check-ins with team',
        ],
      },
      timeAnalysis: {
        busiestDay: 'Tuesday',
        busiestHour: '10 AM',
        averageEmailsPerDay: 45,
        peakCommunicationTimes: ['9-11 AM', '2-4 PM'],
      },
      teamDynamics: {
        internalCommunication: 60,
        externalCommunication: 40,
        crossDepartmental: 25,
        clientFacing: 15,
      },
    }
    
    return insights
  }
  
  private getTopCommunicators(): ContactSummary[] {
    const contacts: ContactSummary[] = []
    const sampleEmails = [
      'john.smith@company.com',
      'sarah.johnson@client.com',
      'mike.wilson@partner.com',
      'emma.davis@team.com',
      'alex.brown@vendor.com',
    ]
    
    sampleEmails.forEach(email => {
      contacts.push({
        email,
        name: this.extractName(email),
        emailCount: Math.floor(Math.random() * 100) + 20,
        lastContact: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        trend: Math.random() > 0.5 ? 'increasing' : 'stable',
      })
    })
    
    return contacts.sort((a, b) => b.emailCount - a.emailCount)
  }
  
  private generateCommunicationTrends(): TrendData[] {
    const trends: TrendData[] = []
    const days = 30
    
    for (let i = days; i >= 0; i--) {
      trends.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        sent: Math.floor(Math.random() * 30) + 10,
        received: Math.floor(Math.random() * 40) + 15,
        total: 0,
      })
    }
    
    trends.forEach(t => {
      t.total = t.sent + t.received
    })
    
    return trends
  }
  
  // Network Graph Generation
  
  async generateNetworkGraph(): Promise<NetworkGraph> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const nodes: NetworkNode[] = []
    const edges: NetworkEdge[] = []
    
    // Create central node (user)
    nodes.push({
      id: 'user',
      label: 'You',
      type: 'user',
      size: 30,
      color: '#3B82F6',
    })
    
    // Add contact nodes
    const contacts = Array.from(this.relationships.values()).slice(0, 20)
    contacts.forEach((contact, index) => {
      const nodeId = `contact_${index}`
      nodes.push({
        id: nodeId,
        label: contact.name,
        type: this.getNodeType(contact),
        size: this.calculateNodeSize(contact),
        color: this.getNodeColor(contact),
      })
      
      // Add edge to user
      edges.push({
        id: `edge_${index}`,
        source: 'user',
        target: nodeId,
        weight: contact.totalEmails,
        type: this.getEdgeType(contact),
      })
    })
    
    // Add some inter-contact connections
    for (let i = 0; i < 10; i++) {
      const source = Math.floor(Math.random() * contacts.length)
      const target = Math.floor(Math.random() * contacts.length)
      
      if (source !== target) {
        edges.push({
          id: `cross_edge_${i}`,
          source: `contact_${source}`,
          target: `contact_${target}`,
          weight: Math.floor(Math.random() * 20) + 1,
          type: 'collaboration',
        })
      }
    }
    
    this.networkGraph = { nodes, edges }
    return this.networkGraph
  }
  
  private getNodeType(contact: RelationshipProfile): string {
    if (contact.importance === 'critical') return 'vip'
    if (contact.organization === 'Client') return 'client'
    if (contact.sharedProjects.length > 2) return 'collaborator'
    return 'contact'
  }
  
  private calculateNodeSize(contact: RelationshipProfile): number {
    const baseSize = 10
    const emailFactor = Math.min(contact.totalEmails / 10, 10)
    const importanceFactor = contact.importance === 'critical' ? 5 : contact.importance === 'high' ? 3 : 1
    
    return baseSize + emailFactor + importanceFactor
  }
  
  private getNodeColor(contact: RelationshipProfile): string {
    const colors = {
      vip: '#EF4444',
      client: '#10B981',
      collaborator: '#8B5CF6',
      contact: '#6B7280',
    }
    
    const type = this.getNodeType(contact)
    return colors[type as keyof typeof colors] || colors.contact
  }
  
  private getEdgeType(contact: RelationshipProfile): string {
    if (contact.communicationFrequency === 'daily') return 'strong'
    if (contact.communicationFrequency === 'weekly') return 'regular'
    return 'weak'
  }
  
  // Relationship Recommendations
  
  getRelationshipRecommendations(): RelationshipRecommendation[] {
    const recommendations: RelationshipRecommendation[] = []
    
    // Dormant contacts
    const dormantContacts = Array.from(this.relationships.values())
      .filter(r => {
        const daysSinceContact = (Date.now() - r.lastContact.getTime()) / (1000 * 60 * 60 * 24)
        return daysSinceContact > 30
      })
    
    dormantContacts.slice(0, 3).forEach(contact => {
      recommendations.push({
        type: 'reconnect',
        contact: contact.email,
        reason: `Haven't communicated with ${contact.name} in over 30 days`,
        action: 'Send a check-in email',
        priority: contact.importance === 'critical' ? 'high' : 'medium',
      })
    })
    
    // Important contacts with low frequency
    const importantLowFreq = Array.from(this.relationships.values())
      .filter(r => r.importance === 'critical' && r.communicationFrequency === 'sporadic')
    
    importantLowFreq.forEach(contact => {
      recommendations.push({
        type: 'strengthen',
        contact: contact.email,
        reason: `${contact.name} is a key contact but communication is sporadic`,
        action: 'Schedule regular sync meetings',
        priority: 'high',
      })
    })
    
    // Collaboration opportunities
    const highCollaborators = Array.from(this.relationships.values())
      .filter(r => r.collaborationScore > 80)
      .slice(0, 2)
    
    if (highCollaborators.length >= 2) {
      recommendations.push({
        type: 'introduce',
        contact: highCollaborators[0].email,
        secondaryContact: highCollaborators[1].email,
        reason: 'Both contacts work on similar projects',
        action: 'Introduce them for potential collaboration',
        priority: 'low',
      })
    }
    
    return recommendations
  }
  
  // Export functionality
  
  exportAnalytics(): string {
    return JSON.stringify({
      relationships: Array.from(this.relationships.entries()),
      patterns: Array.from(this.communicationPatterns.entries()),
      networkGraph: this.networkGraph,
      exportDate: new Date(),
    }, null, 2)
  }
}

// Type definitions
interface RelationshipProfile {
  email: string
  name: string
  organization: string
  role: string
  firstContact: Date
  lastContact: Date
  totalEmails: number
  sentEmails: number
  receivedEmails: number
  averageResponseTime: number // in hours
  communicationFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'sporadic'
  importance: 'critical' | 'high' | 'medium' | 'low'
  sentiment: {
    overall: 'positive' | 'neutral' | 'negative'
    history: Array<{ date: Date; score: number }>
  }
  topics: string[]
  collaborationScore: number
  responseRate: number
  meetingHistory: Meeting[]
  sharedProjects: string[]
  communicationStyle: {
    formality: 'formal' | 'casual'
    brevity: 'concise' | 'detailed'
    tone: string
    preferredChannel: string
    preferredTime: string
  }
  insights: string[]
  recommendations: string[]
}

interface CommunicationPattern {
  pattern: string
  frequency: number
  examples: string[]
}

interface Meeting {
  date: Date
  subject: string
  duration: number // minutes
  attendees: number
}

interface CommunicationInsights {
  totalContacts: number
  activeContacts: number
  newContacts: number
  topCommunicators: ContactSummary[]
  communicationTrends: TrendData[]
  networkHealth: {
    score: number
    strengths: string[]
    improvements: string[]
  }
  timeAnalysis: {
    busiestDay: string
    busiestHour: string
    averageEmailsPerDay: number
    peakCommunicationTimes: string[]
  }
  teamDynamics: {
    internalCommunication: number
    externalCommunication: number
    crossDepartmental: number
    clientFacing: number
  }
}

interface ContactSummary {
  email: string
  name: string
  emailCount: number
  lastContact: Date
  trend: 'increasing' | 'decreasing' | 'stable'
}

interface TrendData {
  date: Date
  sent: number
  received: number
  total: number
}

interface NetworkGraph {
  nodes: NetworkNode[]
  edges: NetworkEdge[]
}

interface NetworkNode {
  id: string
  label: string
  type: string
  size: number
  color: string
}

interface NetworkEdge {
  id: string
  source: string
  target: string
  weight: number
  type: string
}

interface RelationshipRecommendation {
  type: 'reconnect' | 'strengthen' | 'introduce'
  contact: string
  secondaryContact?: string
  reason: string
  action: string
  priority: 'high' | 'medium' | 'low'
}

// Singleton instance
let analytics: EmailRelationshipAnalytics | null = null

export function getRelationshipAnalytics() {
  if (!analytics) {
    analytics = new EmailRelationshipAnalytics()
  }
  return analytics
}

// React hook
export function useRelationshipAnalytics() {
  return getRelationshipAnalytics()
}