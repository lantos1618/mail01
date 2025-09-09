import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AutonomousEmailAgent, SwarmIntelligence, emailSwarm } from '@/lib/ai/autonomous-agents'

describe('AutonomousEmailAgent', () => {
  let agent: AutonomousEmailAgent

  beforeEach(() => {
    agent = new AutonomousEmailAgent('test-agent')
    vi.clearAllMocks()
  })

  describe('makeDecision', () => {
    it('should make decisions based on email context', async () => {
      const testEmail = {
        id: '1',
        sender: 'test@example.com',
        subject: 'Meeting Request',
        body: 'Can we schedule a meeting?',
        timestamp: new Date()
      }

      const decision = await agent.makeDecision(testEmail)

      expect(decision).toHaveProperty('action')
      expect(decision).toHaveProperty('reasoning')
      expect(decision).toHaveProperty('confidence')
      expect(decision).toHaveProperty('alternatives')
      expect(decision).toHaveProperty('impact')
      expect(decision.confidence).toBeGreaterThan(0)
      expect(decision.confidence).toBeLessThanOrEqual(1)
      expect(decision.alternatives).toBeInstanceOf(Array)
    })

    it('should provide reasoning for decisions', async () => {
      const testEmail = {
        id: '2',
        sender: 'urgent@example.com',
        subject: 'URGENT: Action Required',
        body: 'Please respond immediately',
        timestamp: new Date()
      }

      const decision = await agent.makeDecision(testEmail)

      expect(decision.reasoning).toBeTruthy()
      expect(decision.reasoning.length).toBeGreaterThan(10)
      expect(decision.impact).toMatch(/low|medium|high/)
    })
  })

  describe('executeAction', () => {
    it('should execute high-confidence actions', async () => {
      const decision = {
        action: 'categorize',
        reasoning: 'Email needs categorization',
        confidence: 0.9,
        alternatives: ['prioritize'],
        impact: 'low' as const
      }

      const testEmail = {
        id: '3',
        sender: 'test@example.com',
        subject: 'Newsletter',
        body: 'Monthly newsletter content'
      }

      const result = await agent.executeAction(decision, testEmail)

      expect(result).toHaveProperty('success')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result).toHaveProperty('category')
      }
    })

    it('should reject low-confidence actions', async () => {
      const decision = {
        action: 'unknown-action',
        reasoning: 'Uncertain action',
        confidence: 0.3,
        alternatives: [],
        impact: 'high' as const
      }

      const testEmail = {
        id: '4',
        sender: 'test@example.com',
        subject: 'Test',
        body: 'Test content'
      }

      const result = await agent.executeAction(decision, testEmail)

      expect(result.success).toBe(false)
      expect(result).toHaveProperty('reason')
    })

    it('should handle multiple action types', async () => {
      const actions = ['categorize', 'prioritize', 'extract', 'filter']
      
      for (const action of actions) {
        const decision = {
          action,
          reasoning: `Execute ${action}`,
          confidence: 0.85,
          alternatives: [],
          impact: 'medium' as const
        }

        const testEmail = {
          id: `email-${action}`,
          sender: 'test@example.com',
          subject: `Test ${action}`,
          body: 'Test content'
        }

        const result = await agent.executeAction(decision, testEmail)
        expect(result).toHaveProperty('success')
      }
    })
  })

  describe('getPerformanceMetrics', () => {
    it('should provide comprehensive metrics', () => {
      const metrics = agent.getPerformanceMetrics()

      expect(metrics).toHaveProperty('id')
      expect(metrics).toHaveProperty('totalDecisions')
      expect(metrics).toHaveProperty('successRate')
      expect(metrics).toHaveProperty('capabilities')
      expect(metrics.id).toBe('test-agent')
      expect(metrics.successRate).toBeGreaterThanOrEqual(0)
      expect(metrics.successRate).toBeLessThanOrEqual(1)
      expect(metrics.capabilities).toBeTruthy()
    })

    it('should track capability confidence', () => {
      const metrics = agent.getPerformanceMetrics()
      
      expect(metrics.capabilities).toHaveProperty('categorize')
      expect(metrics.capabilities).toHaveProperty('prioritize')
      
      const capability = metrics.capabilities.categorize
      expect(capability).toHaveProperty('confidence')
      expect(capability).toHaveProperty('learningRate')
      expect(capability.confidence).toBeGreaterThan(0)
      expect(capability.confidence).toBeLessThanOrEqual(1)
    })
  })
})

describe('SwarmIntelligence', () => {
  let swarm: SwarmIntelligence

  beforeEach(() => {
    swarm = new SwarmIntelligence()
  })

  describe('processEmail', () => {
    it('should reach consensus among agents', async () => {
      const testEmail = {
        id: '10',
        sender: 'important@example.com',
        subject: 'Important Decision Required',
        body: 'Please review and approve the attached proposal',
        hasAttachment: true
      }

      const result = await swarm.processEmail(testEmail)

      expect(result).toHaveProperty('decisions')
      expect(result).toHaveProperty('consensus')
      expect(result).toHaveProperty('confidence')
      expect(result.decisions).toBeInstanceOf(Array)
      expect(result.decisions.length).toBeGreaterThan(0)
      expect(result.consensus).toBeTruthy()
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    it('should aggregate multiple agent decisions', async () => {
      const testEmail = {
        id: '11',
        sender: 'test@example.com',
        subject: 'Test Email',
        body: 'Test content for swarm processing'
      }

      const result = await swarm.processEmail(testEmail)

      expect(result.decisions.length).toBeGreaterThan(1)
      result.decisions.forEach(decision => {
        expect(decision).toHaveProperty('action')
        expect(decision).toHaveProperty('reasoning')
        expect(decision).toHaveProperty('confidence')
      })
    })
  })

  describe('executeConsensus', () => {
    it('should execute consensus action', async () => {
      const testEmail = {
        id: '12',
        sender: 'test@example.com',
        subject: 'Action Required',
        body: 'Please take action on this email'
      }

      const result = await swarm.executeConsensus('categorize', testEmail)

      expect(result).toHaveProperty('success')
      if (result.success) {
        expect(result).toHaveProperty('category')
      }
    })

    it('should handle invalid actions gracefully', async () => {
      const testEmail = {
        id: '13',
        sender: 'test@example.com',
        subject: 'Test',
        body: 'Test content'
      }

      const result = await swarm.executeConsensus('invalid-action', testEmail)

      expect(result.success).toBe(false)
      expect(result).toHaveProperty('reason')
    })
  })

  describe('getSwarmMetrics', () => {
    it('should provide swarm-wide metrics', () => {
      const metrics = swarm.getSwarmMetrics()

      expect(metrics).toHaveProperty('totalAgents')
      expect(metrics).toHaveProperty('agents')
      expect(metrics.totalAgents).toBeGreaterThan(0)
      expect(metrics.agents).toBeInstanceOf(Array)
      expect(metrics.agents.length).toBe(metrics.totalAgents)
    })

    it('should include individual agent metrics', () => {
      const metrics = swarm.getSwarmMetrics()

      metrics.agents.forEach(agentMetrics => {
        expect(agentMetrics).toHaveProperty('id')
        expect(agentMetrics).toHaveProperty('totalDecisions')
        expect(agentMetrics).toHaveProperty('successRate')
        expect(agentMetrics).toHaveProperty('capabilities')
      })
    })
  })
})

describe('Email Swarm Integration', () => {
  it('should process emails through the global swarm', async () => {
    const testEmail = {
      id: '20',
      sender: 'integration@example.com',
      subject: 'Integration Test',
      body: 'Testing the global email swarm',
      priority: 'high'
    }

    const result = await emailSwarm.processEmail(testEmail)

    expect(result).toBeTruthy()
    expect(result.consensus).toBeTruthy()
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('should provide global swarm metrics', () => {
    const metrics = emailSwarm.getSwarmMetrics()

    expect(metrics).toBeTruthy()
    expect(metrics.totalAgents).toBeGreaterThan(0)
    expect(metrics.agents).toBeInstanceOf(Array)
  })

  it('should handle concurrent email processing', async () => {
    const emails = [
      { id: '30', sender: 'test1@example.com', subject: 'Test 1', body: 'Content 1' },
      { id: '31', sender: 'test2@example.com', subject: 'Test 2', body: 'Content 2' },
      { id: '32', sender: 'test3@example.com', subject: 'Test 3', body: 'Content 3' }
    ]

    const results = await Promise.all(
      emails.map(email => emailSwarm.processEmail(email))
    )

    expect(results).toHaveLength(3)
    results.forEach(result => {
      expect(result).toHaveProperty('consensus')
      expect(result).toHaveProperty('confidence')
      expect(result.decisions.length).toBeGreaterThan(0)
    })
  })
})