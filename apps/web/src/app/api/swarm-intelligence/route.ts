import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateText, streamText } from 'ai'

interface SwarmAgent {
  id: string
  role: 'writer' | 'analyzer' | 'scheduler' | 'researcher' | 'strategist' | 'editor' | 'negotiator'
  specialization: string[]
  confidence: number
  response?: string
  vote?: number
}

interface SwarmTask {
  id: string
  description: string
  context: any
  requiredAgents: number
  consensusThreshold: number
}

interface SwarmResult {
  taskId: string
  consensus: string
  confidence: number
  agentResponses: SwarmAgent[]
  alternatives: string[]
  reasoning: string
  votingResults: {
    option: string
    votes: number
    weight: number
  }[]
}

class SwarmOrchestrator {
  private agents: SwarmAgent[] = []

  constructor() {
    this.initializeSwarm()
  }

  private initializeSwarm() {
    const agentConfigs = [
      { role: 'writer', specializations: ['formal', 'casual', 'technical', 'creative', 'persuasive'] },
      { role: 'analyzer', specializations: ['sentiment', 'intent', 'priority', 'risk', 'opportunity'] },
      { role: 'scheduler', specializations: ['meetings', 'deadlines', 'reminders', 'time-zones', 'availability'] },
      { role: 'researcher', specializations: ['context', 'history', 'references', 'facts', 'precedents'] },
      { role: 'strategist', specializations: ['approach', 'timing', 'stakeholders', 'outcomes', 'alternatives'] },
      { role: 'editor', specializations: ['grammar', 'clarity', 'tone', 'structure', 'impact'] },
      { role: 'negotiator', specializations: ['compromise', 'win-win', 'escalation', 'de-escalation', 'alignment'] }
    ]

    this.agents = agentConfigs.flatMap(config =>
      config.specializations.map(spec => ({
        id: `${config.role}-${spec}-${Math.random().toString(36).substr(2, 9)}`,
        role: config.role as any,
        specialization: [spec],
        confidence: 0.7 + Math.random() * 0.3
      }))
    )
  }

  async processTask(task: SwarmTask): Promise<SwarmResult> {
    // Select optimal agents for the task
    const selectedAgents = this.selectAgents(task)
    
    // Phase 1: Independent processing
    const agentResponses = await this.parallelProcess(selectedAgents, task)
    
    // Phase 2: Cross-validation
    const validatedResponses = await this.crossValidate(agentResponses, task)
    
    // Phase 3: Consensus building
    const consensus = await this.buildConsensus(validatedResponses, task)
    
    // Phase 4: Generate alternatives
    const alternatives = await this.generateAlternatives(validatedResponses, consensus)
    
    // Phase 5: Final synthesis
    const result = await this.synthesize(consensus, alternatives, validatedResponses)
    
    return {
      taskId: task.id,
      consensus: result.consensus,
      confidence: result.confidence,
      agentResponses: validatedResponses,
      alternatives: alternatives.slice(0, 3),
      reasoning: result.reasoning,
      votingResults: result.voting
    }
  }

  private selectAgents(task: SwarmTask): SwarmAgent[] {
    // Intelligent agent selection based on task requirements
    const taskKeywords = task.description.toLowerCase().split(' ')
    
    const rankedAgents = this.agents
      .map(agent => ({
        ...agent,
        relevance: this.calculateRelevance(agent, taskKeywords, task.context)
      }))
      .sort((a, b) => b.relevance - a.relevance)
    
    // Select top agents up to required number
    return rankedAgents.slice(0, Math.min(task.requiredAgents || 7, rankedAgents.length))
  }

  private calculateRelevance(agent: SwarmAgent, keywords: string[], context: any): number {
    let score = 0
    
    // Keyword matching
    keywords.forEach(keyword => {
      if (agent.role.includes(keyword)) score += 2
      if (agent.specialization.some(s => s.includes(keyword))) score += 1
    })
    
    // Context-based scoring
    if (context.emailType === 'formal' && agent.specialization.includes('formal')) score += 3
    if (context.urgent && agent.role === 'scheduler') score += 2
    if (context.needsResearch && agent.role === 'researcher') score += 3
    
    // Normalize by confidence
    return score * agent.confidence
  }

  private async parallelProcess(agents: SwarmAgent[], task: SwarmTask): Promise<SwarmAgent[]> {
    const processPromises = agents.map(async (agent) => {
      const response = await this.runAgent(agent, task)
      return {
        ...agent,
        response,
        vote: 0
      }
    })
    
    return Promise.all(processPromises)
  }

  private async runAgent(agent: SwarmAgent, task: SwarmTask): Promise<string> {
    const prompt = `
      You are a specialized AI agent with the role of ${agent.role} and expertise in ${agent.specialization.join(', ')}.
      
      Task: ${task.description}
      
      Context: ${JSON.stringify(task.context, null, 2)}
      
      Provide your expert analysis and recommendation. Be specific and actionable.
    `

    const result = await generateText({
      model: openai('gpt-4-turbo'),
      prompt,
      temperature: 0.7,
      maxTokens: 500
    })

    return result.text
  }

  private async crossValidate(responses: SwarmAgent[], task: SwarmTask): Promise<SwarmAgent[]> {
    // Each agent validates others' responses
    for (let i = 0; i < responses.length; i++) {
      const validationScores: number[] = []
      
      for (let j = 0; j < responses.length; j++) {
        if (i !== j) {
          const score = await this.validateResponse(responses[i], responses[j], task)
          validationScores.push(score)
        }
      }
      
      // Update confidence based on peer validation
      const avgValidation = validationScores.reduce((a, b) => a + b, 0) / validationScores.length
      responses[i].confidence = (responses[i].confidence + avgValidation) / 2
      responses[i].vote = avgValidation
    }
    
    return responses
  }

  private async validateResponse(validator: SwarmAgent, target: SwarmAgent, task: SwarmTask): Promise<number> {
    // Simplified validation - in production, this would use AI
    const similarity = this.calculateSimilarity(validator.response || '', target.response || '')
    const roleAlignment = validator.role === target.role ? 0.8 : 0.6
    return (similarity + roleAlignment) / 2
  }

  private calculateSimilarity(text1: string, text2: string): number {
    // Simple similarity calculation
    const words1 = new Set(text1.toLowerCase().split(' '))
    const words2 = new Set(text2.toLowerCase().split(' '))
    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])
    return intersection.size / union.size
  }

  private async buildConsensus(responses: SwarmAgent[], task: SwarmTask): Promise<string> {
    // Aggregate responses weighted by confidence
    const weightedResponses = responses
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, Math.ceil(responses.length * 0.6)) // Top 60% by confidence

    const consensusPrompt = `
      Synthesize these expert opinions into a single, coherent recommendation:
      
      ${weightedResponses.map(r => `
        ${r.role} (${r.specialization.join(', ')}) - Confidence: ${(r.confidence * 100).toFixed(0)}%:
        ${r.response}
      `).join('\n\n')}
      
      Create a unified recommendation that incorporates the best insights from all experts.
    `

    const result = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: consensusPrompt,
      temperature: 0.5,
      maxTokens: 600
    })

    return result.text
  }

  private async generateAlternatives(responses: SwarmAgent[], consensus: string): Promise<string[]> {
    // Generate alternative approaches based on minority opinions
    const minorityOpinions = responses
      .filter(r => r.confidence < 0.7)
      .map(r => r.response)

    if (minorityOpinions.length === 0) {
      return []
    }

    const alternativesPrompt = `
      Based on these minority viewpoints, generate 3 alternative approaches:
      
      ${minorityOpinions.join('\n\n')}
      
      Main consensus: ${consensus}
      
      Provide 3 brief alternative strategies that differ from the consensus.
    `

    const result = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: alternativesPrompt,
      temperature: 0.8,
      maxTokens: 400
    })

    return result.text.split('\n').filter(line => line.trim().length > 0).slice(0, 3)
  }

  private async synthesize(
    consensus: string, 
    alternatives: string[], 
    responses: SwarmAgent[]
  ): Promise<any> {
    const totalConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length
    
    const voting = this.calculateVoting(responses)
    
    const reasoning = `
      Swarm consensus reached with ${responses.length} specialized agents.
      Average confidence: ${(totalConfidence * 100).toFixed(0)}%.
      ${alternatives.length} alternative approaches identified.
    `

    return {
      consensus,
      confidence: totalConfidence,
      reasoning,
      voting
    }
  }

  private calculateVoting(responses: SwarmAgent[]): any[] {
    // Group similar responses and count votes
    const groups = new Map<string, number>()
    
    responses.forEach(r => {
      const key = r.role + '-' + r.specialization[0]
      groups.set(key, (groups.get(key) || 0) + r.confidence)
    })
    
    return Array.from(groups.entries())
      .map(([option, weight]) => ({
        option,
        votes: responses.filter(r => r.role + '-' + r.specialization[0] === option).length,
        weight
      }))
      .sort((a, b) => b.weight - a.weight)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { task, context, options = {} } = await request.json()

    if (!task) {
      return NextResponse.json({ error: 'Task description required' }, { status: 400 })
    }

    const orchestrator = new SwarmOrchestrator()
    
    const swarmTask: SwarmTask = {
      id: Math.random().toString(36).substr(2, 9),
      description: task,
      context: context || {},
      requiredAgents: options.agentCount || 7,
      consensusThreshold: options.consensusThreshold || 0.7
    }

    const result = await orchestrator.processTask(swarmTask)

    return NextResponse.json({
      success: true,
      result,
      metadata: {
        processedAt: new Date().toISOString(),
        agentCount: result.agentResponses.length,
        consensusStrength: result.confidence,
        alternativeCount: result.alternatives.length
      }
    })
  } catch (error) {
    console.error('Swarm intelligence error:', error)
    return NextResponse.json(
      { error: 'Swarm processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Return swarm status and available agents
  const orchestrator = new SwarmOrchestrator()
  
  return NextResponse.json({
    status: 'active',
    agents: {
      total: 35,
      roles: ['writer', 'analyzer', 'scheduler', 'researcher', 'strategist', 'editor', 'negotiator'],
      specializations: [
        'formal', 'casual', 'technical', 'creative', 'persuasive',
        'sentiment', 'intent', 'priority', 'risk', 'opportunity',
        'meetings', 'deadlines', 'reminders', 'time-zones', 'availability',
        'context', 'history', 'references', 'facts', 'precedents',
        'approach', 'timing', 'stakeholders', 'outcomes', 'alternatives',
        'grammar', 'clarity', 'tone', 'structure', 'impact',
        'compromise', 'win-win', 'escalation', 'de-escalation', 'alignment'
      ]
    },
    capabilities: [
      'Multi-agent collaboration',
      'Consensus building',
      'Alternative generation',
      'Cross-validation',
      'Weighted voting',
      'Parallel processing'
    ]
  })
}