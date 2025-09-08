import { EmailMessage, EmailThread } from '@/lib/ai/email-intelligence'

export const mockEmails: EmailMessage[] = [
  {
    id: '1',
    from: 'sarah.chen@techcorp.com',
    to: ['you@mail-01.com'],
    subject: 'Q4 Product Roadmap Review - Urgent',
    body: `Hi Team,

I hope this email finds you well. We need to schedule an urgent meeting to review our Q4 product roadmap. There have been some significant changes in market priorities that we need to address.

Key discussion points:
1. AI integration timeline acceleration
2. Customer feedback on current features
3. Resource allocation for new initiatives
4. Competitive analysis updates

Please review the attached roadmap document before our meeting. Could you confirm your availability for this Thursday at 2 PM EST? We'll need about 2 hours for a comprehensive review.

Also, please prepare a brief update on your team's current sprint progress and any blockers you're facing.

Best regards,
Sarah Chen
VP of Product`,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: false,
    isStarred: true,
    labels: ['important', 'work'],
    threadId: 'thread-1',
  },
  {
    id: '2',
    from: 'newsletter@techdigest.com',
    to: ['you@mail-01.com'],
    subject: 'Weekly Tech Digest: AI Breakthroughs & Industry Updates',
    body: `This week in tech: Major AI announcements from leading companies, breakthrough in quantum computing, and new regulations on data privacy. 
    
    Featured articles:
    - "The Next Generation of AI Assistants"
    - "Quantum Computing Reaches New Milestone"
    - "Privacy Laws Reshape Tech Industry"
    
    Click here to read more...`,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    isRead: true,
    isStarred: false,
    labels: ['newsletter'],
    threadId: 'thread-2',
  },
  {
    id: '3',
    from: 'alex.kumar@design.studio',
    to: ['you@mail-01.com'],
    cc: ['team@mail-01.com'],
    subject: 'Re: New UI Mockups for Mail-01 Dashboard',
    body: `Hey!

I've completed the new UI mockups for the Mail-01 dashboard as discussed. The designs incorporate all the feedback from our last review session.

Key improvements:
- Enhanced visual hierarchy for better readability
- New dark mode color palette
- Improved mobile responsiveness
- Accessibility compliance (WCAG 2.1 AA)

You can view the interactive prototypes here: [Link]

I've also attached high-res exports for your review. Let me know if you need any adjustments. I'm particularly excited about the new email composition interface - I think users will love the AI-powered suggestions!

Cheers,
Alex`,
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    isRead: true,
    isStarred: true,
    labels: ['design', 'project'],
    threadId: 'thread-3',
  },
  {
    id: '4',
    from: 'support@cloudservice.io',
    to: ['you@mail-01.com'],
    subject: 'Service Maintenance Notice - December 15th',
    body: `Dear Valued Customer,

We're writing to inform you about scheduled maintenance on our platform.

Maintenance Window:
Date: December 15th, 2024
Time: 2:00 AM - 6:00 AM EST
Expected Downtime: Approximately 2 hours

During this time, you may experience intermittent service disruptions. We recommend scheduling any critical operations outside this window.

Thank you for your understanding.

Support Team`,
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    isRead: false,
    isStarred: false,
    labels: ['support'],
    threadId: 'thread-4',
  },
  {
    id: '5',
    from: 'michael.torres@startup.com',
    to: ['you@mail-01.com'],
    subject: 'Investment Opportunity Discussion',
    body: `Hi there,

I came across Mail-01 and I'm incredibly impressed with what you're building. The AI-powered email client space is ripe for disruption, and your approach is exactly what the market needs.

I'd love to discuss potential investment opportunities. Our fund focuses on early-stage AI and productivity tools, and Mail-01 aligns perfectly with our thesis.

Are you available for a call next week? I can work around your schedule.

Best,
Michael Torres
Partner, Innovation Ventures`,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isRead: false,
    isStarred: true,
    labels: ['opportunity', 'important'],
    threadId: 'thread-5',
  },
  {
    id: '6',
    from: 'emma.wilson@marketing.co',
    to: ['you@mail-01.com'],
    subject: 'Content Calendar for Q1 2025',
    body: `Team,

Please find attached the content calendar for Q1 2025. We need to finalize this by end of week.

Key campaigns:
- Product launch announcement (January)
- Customer success stories series (February)
- Industry thought leadership pieces (March)

Could you review and provide feedback by Thursday? Pay special attention to the social media strategy section.

Thanks,
Emma`,
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
    isRead: true,
    isStarred: false,
    labels: ['marketing', 'planning'],
    threadId: 'thread-6',
  },
  {
    id: '7',
    from: 'notifications@github.com',
    to: ['you@mail-01.com'],
    subject: '[Mail-01/Zero] Pull request #42: Add AI email categorization',
    body: `A new pull request has been opened in Mail-01/Zero.

Title: Add AI email categorization
Author: contributor123
Description: This PR implements automatic email categorization using AI. It analyzes email content and assigns appropriate labels.

Changes:
+500 lines added
-50 lines removed
15 files changed

Review the pull request: [Link]`,
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
    isRead: true,
    isStarred: false,
    labels: ['development', 'github'],
    threadId: 'thread-7',
  },
]

export const mockSentEmails: EmailMessage[] = [
  {
    id: 's1',
    from: 'you@mail-01.com',
    to: ['sarah.chen@techcorp.com'],
    subject: 'Re: Q4 Product Roadmap Review - Urgent',
    body: `Hi Sarah,

Thursday at 2 PM EST works perfectly for me. I'll review the roadmap document beforehand and prepare our team's sprint update.

Current sprint highlights:
- AI integration: 75% complete
- New UI components: Testing phase
- Performance improvements: Deployed to staging

We have one blocker regarding the third-party API integration that we should discuss.

See you Thursday!

Best,`,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    isRead: true,
    isStarred: false,
    labels: ['sent', 'work'],
    threadId: 'thread-1',
  },
  {
    id: 's2',
    from: 'you@mail-01.com',
    to: ['team@mail-01.com'],
    subject: 'Team Update: Mail-01 Progress',
    body: `Team,

Great progress this week! Here's a quick update:

Completed:
✅ Assistant-UI integration
✅ Email categorization feature
✅ Performance optimizations

In Progress:
🔄 SendGrid integration
🔄 Advanced AI features
🔄 Testing suite expansion

Keep up the excellent work!`,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    isRead: true,
    isStarred: true,
    labels: ['sent', 'team'],
    threadId: 'thread-8',
  },
]

export const mockDraftEmails: EmailMessage[] = [
  {
    id: 'd1',
    from: 'you@mail-01.com',
    to: ['investor@venturecap.com'],
    subject: 'Mail-01 Series A Pitch Deck',
    body: `Dear [Investor Name],

Following our conversation last week, I'm pleased to share Mail-01's Series A pitch deck.

[Draft - needs completion]

Key highlights:
- 50K active users
- 200% QoQ growth
- Enterprise contracts in pipeline`,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    isRead: true,
    isStarred: true,
    labels: ['draft', 'important'],
    threadId: 'thread-9',
  },
]

export function getMockEmails(folder: 'received' | 'sent' | 'drafts' | 'archived'): EmailMessage[] {
  switch (folder) {
    case 'received':
      return mockEmails
    case 'sent':
      return mockSentEmails
    case 'drafts':
      return mockDraftEmails
    case 'archived':
      return mockEmails.filter(e => e.isRead).slice(2, 5)
    default:
      return []
  }
}

export function getMockEmailById(id: string): EmailMessage | undefined {
  return [...mockEmails, ...mockSentEmails, ...mockDraftEmails].find(e => e.id === id)
}