"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import CollaborativeEmailComposer from "@/components/CollaborativeEmailComposer"
import SmartEmailSearch from "@/components/SmartEmailSearch"
import EmailScheduler from "@/components/EmailScheduler"
import VoiceEmailComposer from "@/components/VoiceEmailComposer"
import EmailAssistantEnhanced from "@/components/EmailAssistantEnhanced"
import { 
  Users, Search, Clock, Mic, MessageSquare,
  Sparkles, Brain, Zap, Layout, ChevronRight
} from "lucide-react"

type ViewMode = "collaboration" | "search" | "scheduler" | "voice" | "assistant"

export default function AdvancedMailPage() {
  const [activeView, setActiveView] = useState<ViewMode>("assistant")
  
  const features = [
    {
      id: "assistant" as ViewMode,
      label: "AI Assistant",
      icon: <MessageSquare className="w-5 h-5" />,
      description: "Conversational email interface with AI",
      badge: "Enhanced",
      color: "bg-gradient-to-r from-purple-500 to-indigo-500"
    },
    {
      id: "collaboration" as ViewMode,
      label: "Real-time Collaboration",
      icon: <Users className="w-5 h-5" />,
      description: "Work together on emails in real-time",
      badge: "New",
      color: "bg-gradient-to-r from-blue-500 to-cyan-500"
    },
    {
      id: "search" as ViewMode,
      label: "Smart Search",
      icon: <Search className="w-5 h-5" />,
      description: "AI-powered natural language search",
      badge: "AI",
      color: "bg-gradient-to-r from-purple-500 to-pink-500"
    },
    {
      id: "scheduler" as ViewMode,
      label: "Email Scheduler",
      icon: <Clock className="w-5 h-5" />,
      description: "Schedule and automate email sending",
      badge: "Smart",
      color: "bg-gradient-to-r from-indigo-500 to-purple-500"
    },
    {
      id: "voice" as ViewMode,
      label: "Voice Composer",
      icon: <Mic className="w-5 h-5" />,
      description: "Compose emails with voice commands",
      badge: "Beta",
      color: "bg-gradient-to-r from-green-500 to-teal-500"
    }
  ]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mail-01
              </h1>
              <Badge variant="outline" className="hidden md:inline-flex">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Email Client
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-indigo-500">
                <Brain className="w-3 h-3 mr-1" />
                assistant-ui integrated
              </Badge>
              <Badge variant="outline">
                <Zap className="w-3 h-3 mr-1" />
                v2.0
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-2 overflow-x-auto">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveView(feature.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeView === feature.id
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "hover:bg-gray-100"
                }`}
              >
                {feature.icon}
                <span className="font-medium">{feature.label}</span>
                {feature.badge && activeView !== feature.id && (
                  <Badge variant="outline" className="ml-1 text-xs">
                    {feature.badge}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Feature Description */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {features.find(f => f.id === activeView)?.icon}
                {features.find(f => f.id === activeView)?.label}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {features.find(f => f.id === activeView)?.description}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Feature Highlights (shown when assistant is active) */}
        {activeView === "assistant" && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Layout className="w-5 h-5" />
              Mail-01 Advanced Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.slice(1).map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setActiveView(feature.id)}
                  className="p-4 bg-white rounded-lg border hover:shadow-lg transition-all text-left group"
                >
                  <div className={`inline-flex p-2 rounded-lg text-white mb-3 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h4 className="font-semibold mb-1 group-hover:text-blue-600">
                    {feature.label}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                  <div className="mt-3 flex items-center text-sm text-blue-600">
                    Try it now
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Active Component */}
        <div className="animate-in fade-in duration-300">
          {activeView === "assistant" && <EmailAssistantEnhanced />}
          {activeView === "collaboration" && <CollaborativeEmailComposer />}
          {activeView === "search" && <SmartEmailSearch />}
          {activeView === "scheduler" && <EmailScheduler />}
          {activeView === "voice" && <VoiceEmailComposer />}
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-16 border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600">
                Mail-01 - Next-generation email client powered by assistant-ui
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Enhanced from Mail-0/Zero with advanced AI capabilities
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                <Brain className="w-3 h-3 mr-1" />
                AI-First Design
              </Badge>
              <Badge variant="outline">
                <Users className="w-3 h-3 mr-1" />
                Real-time Collaboration
              </Badge>
              <Badge variant="outline">
                <Zap className="w-3 h-3 mr-1" />
                Lightning Fast
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}