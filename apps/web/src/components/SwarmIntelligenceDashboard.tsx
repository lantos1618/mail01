"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bot, Brain, Cpu, Network, Activity, Zap,
  Users, Target, Layers, Shield, Globe, Workflow,
  Sparkles, TrendingUp, AlertCircle, CheckCircle
} from "lucide-react"
import { emailSwarm } from "@/lib/ai/autonomous-agents"
import { motion, AnimatePresence } from "framer-motion"

interface AgentStatus {
  id: string
  status: "active" | "learning" | "idle" | "processing"
  tasksCompleted: number
  successRate: number
  currentAction?: string
}

export function SwarmIntelligenceDashboard() {
  const [agents, setAgents] = useState<AgentStatus[]>([])
  const [swarmActivity, setSwarmActivity] = useState<any[]>([])
  const [consensusDecisions, setConsensusDecisions] = useState<any[]>([])
  const [swarmMetrics, setSwarmMetrics] = useState({
    totalProcessed: 0,
    consensusRate: 0,
    averageConfidence: 0,
    swarmEfficiency: 0
  })

  useEffect(() => {
    // Initialize agents
    const initialAgents: AgentStatus[] = [
      { id: "inbox-manager", status: "active", tasksCompleted: 124, successRate: 0.94 },
      { id: "meeting-scheduler", status: "processing", tasksCompleted: 45, successRate: 0.89 },
      { id: "follow-up-bot", status: "learning", tasksCompleted: 67, successRate: 0.91 },
      { id: "newsletter-filter", status: "active", tasksCompleted: 234, successRate: 0.97 },
      { id: "priority-detector", status: "active", tasksCompleted: 156, successRate: 0.93 },
      { id: "response-generator", status: "idle", tasksCompleted: 89, successRate: 0.88 },
      { id: "task-extractor", status: "processing", tasksCompleted: 103, successRate: 0.92 },
      { id: "relationship-manager", status: "learning", tasksCompleted: 78, successRate: 0.90 }
    ]
    setAgents(initialAgents)

    // Simulate swarm activity
    const interval = setInterval(() => {
      // Update agent statuses
      setAgents(prev => prev.map(agent => ({
        ...agent,
        status: Math.random() > 0.7 ? 
          ["active", "learning", "idle", "processing"][Math.floor(Math.random() * 4)] as any :
          agent.status,
        tasksCompleted: agent.tasksCompleted + Math.floor(Math.random() * 3),
        successRate: Math.min(1, agent.successRate + (Math.random() - 0.5) * 0.02)
      })))

      // Add new swarm activity
      setSwarmActivity(prev => [
        {
          id: Date.now(),
          type: ["email-processed", "decision-made", "learning-update", "consensus-reached"][Math.floor(Math.random() * 4)],
          agent: initialAgents[Math.floor(Math.random() * initialAgents.length)].id,
          timestamp: new Date(),
          details: "Processing email with swarm intelligence"
        },
        ...prev.slice(0, 9)
      ])

      // Update metrics
      setSwarmMetrics(prev => ({
        totalProcessed: prev.totalProcessed + Math.floor(Math.random() * 5),
        consensusRate: Math.min(1, prev.consensusRate + (Math.random() - 0.4) * 0.05),
        averageConfidence: 0.85 + Math.random() * 0.1,
        swarmEfficiency: 0.90 + Math.random() * 0.08
      }))

      // Occasionally add consensus decisions
      if (Math.random() > 0.7) {
        setConsensusDecisions(prev => [
          {
            id: Date.now(),
            action: ["categorize", "prioritize", "respond", "schedule"][Math.floor(Math.random() * 4)],
            confidence: 0.8 + Math.random() * 0.2,
            participants: Math.floor(Math.random() * 5) + 3,
            timestamp: new Date()
          },
          ...prev.slice(0, 4)
        ])
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500"
      case "processing": return "bg-blue-500"
      case "learning": return "bg-purple-500"
      case "idle": return "bg-gray-400"
      default: return "bg-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <Activity className="w-4 h-4" />
      case "processing": return <Cpu className="w-4 h-4 animate-spin" />
      case "learning": return <Brain className="w-4 h-4 animate-pulse" />
      case "idle": return <Shield className="w-4 h-4" />
      default: return <Bot className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Swarm Intelligence Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 p-8 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Network animation background */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          {agents.map((agent, i) => (
            <g key={agent.id}>
              <circle
                cx={`${15 + (i % 4) * 25}%`}
                cy={`${30 + Math.floor(i / 4) * 40}%`}
                r="3"
                fill="white"
                className="animate-pulse"
              />
              {i < agents.length - 1 && (
                <line
                  x1={`${15 + (i % 4) * 25}%`}
                  y1={`${30 + Math.floor(i / 4) * 40}%`}
                  x2={`${15 + ((i + 1) % 4) * 25}%`}
                  y2={`${30 + Math.floor((i + 1) / 4) * 40}%`}
                  stroke="white"
                  strokeWidth="0.5"
                  className="animate-pulse"
                  opacity="0.5"
                />
              )}
            </g>
          ))}
        </svg>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Network className="w-10 h-10" />
                Swarm Intelligence Control
              </h1>
              <p className="text-white/80">Distributed AI agents working in perfect harmony</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{agents.filter(a => a.status === "active").length}/{agents.length}</div>
              <div className="text-sm text-white/70">Active Agents</div>
            </div>
          </div>
        </div>
      </div>

      {/* Swarm Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Emails Processed", value: swarmMetrics.totalProcessed, icon: Mail, trend: "+12%" },
          { label: "Consensus Rate", value: `${(swarmMetrics.consensusRate * 100).toFixed(1)}%`, icon: Users, trend: "+5%" },
          { label: "Avg Confidence", value: `${(swarmMetrics.averageConfidence * 100).toFixed(1)}%`, icon: Target, trend: "+3%" },
          { label: "Swarm Efficiency", value: `${(swarmMetrics.swarmEfficiency * 100).toFixed(1)}%`, icon: Zap, trend: "+8%" }
        ].map((metric, idx) => (
          <Card key={idx} className="p-4 bg-white border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <metric.icon className="w-5 h-5 text-blue-600" />
              <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                {metric.trend}
              </Badge>
            </div>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="text-sm text-gray-500">{metric.label}</div>
          </Card>
        ))}
      </div>

      {/* Agent Grid */}
      <Card className="p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          Autonomous Agent Network
        </h3>
        
        <div className="grid grid-cols-4 gap-4">
          {agents.map((agent) => (
            <motion.div
              key={agent.id}
              layout
              className="relative p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                  {getStatusIcon(agent.status)}
                </div>
                <Badge variant="outline" className="text-xs">
                  {agent.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium text-sm">{agent.id}</div>
                <div className="text-xs text-gray-500">Tasks: {agent.tasksCompleted}</div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Success Rate</span>
                    <span>{(agent.successRate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${agent.successRate * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              </div>
              
              {agent.status === "processing" && (
                <div className="absolute inset-0 bg-blue-500/5 rounded-lg animate-pulse" />
              )}
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Consensus Decisions */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600" />
            Consensus Decisions
          </h3>
          
          <div className="space-y-3">
            <AnimatePresence>
              {consensusDecisions.map((decision) => (
                <motion.div
                  key={decision.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-purple-100 text-purple-800">
                      {decision.action}
                    </Badge>
                    <div className="text-xs text-gray-500">
                      {decision.participants} agents
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${decision.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">
                      {(decision.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Card>

        {/* Swarm Activity Feed */}
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Swarm Activity Feed
          </h3>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {swarmActivity.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-2 bg-gray-50 rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    {activity.type === "consensus-reached" ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="font-medium text-xs">{activity.agent}</span>
                    <span className="text-gray-500 text-xs">
                      {activity.details}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Card>
      </div>

      {/* Control Panel */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Workflow className="w-5 h-5 text-blue-600" />
          Swarm Control Panel
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Brain className="w-4 h-4 mr-2" />
            Train All Agents
          </Button>
          <Button variant="outline">
            <Network className="w-4 h-4 mr-2" />
            Optimize Network
          </Button>
          <Button variant="outline">
            <Globe className="w-4 h-4 mr-2" />
            Deploy New Agent
          </Button>
        </div>
      </Card>
    </div>
  )
}

function Mail({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-10 5L2 7" />
    </svg>
  )
}