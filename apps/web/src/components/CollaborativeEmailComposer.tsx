"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, Send, Eye, Edit3, MessageSquare, 
  Clock, AlertCircle, CheckCircle, UserPlus,
  Video, Share2, Lock, Unlock, Sparkles,
  GitBranch, Layers, Globe, Shield
} from "lucide-react"

interface Collaborator {
  id: string
  name: string
  email: string
  avatar?: string
  role: "owner" | "editor" | "viewer" | "commenter"
  status: "online" | "offline" | "typing"
  cursor?: { line: number; column: number }
  color: string
}

interface Comment {
  id: string
  author: Collaborator
  text: string
  timestamp: Date
  resolved: boolean
  position?: { line: number; column: number }
  thread?: Comment[]
}

interface EmailVersion {
  id: string
  author: Collaborator
  timestamp: Date
  changes: string[]
  content: string
}

interface SuggestionRange {
  start: number
  end: number
  suggestion: string
  author: Collaborator
  accepted?: boolean
}

export default function CollaborativeEmailComposer() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: "1",
      name: "You",
      email: "you@example.com",
      role: "owner",
      status: "online",
      color: "#3B82F6"
    }
  ])
  
  const [emailContent, setEmailContent] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
    attachments: [] as File[]
  })
  
  const [comments, setComments] = useState<Comment[]>([])
  const [versions, setVersions] = useState<EmailVersion[]>([])
  const [suggestions, setSuggestions] = useState<SuggestionRange[]>([])
  const [isLive, setIsLive] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = useState(true)
  const [privacyMode, setPrivacyMode] = useState<"public" | "private" | "team">("team")
  
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const collaborationWs = useRef<WebSocket | null>(null)
  
  // Simulate WebSocket connection for real-time collaboration
  useEffect(() => {
    if (isLive) {
      // In production, connect to actual WebSocket server
      console.log("Connecting to collaboration server...")
      
      // Simulate other collaborators joining
      setTimeout(() => {
        setCollaborators(prev => [...prev, {
          id: "2",
          name: "Alice Johnson",
          email: "alice@example.com",
          role: "editor",
          status: "online",
          color: "#10B981"
        }])
      }, 2000)
      
      setTimeout(() => {
        setCollaborators(prev => [...prev, {
          id: "3",
          name: "Bob Smith",
          email: "bob@example.com",
          role: "commenter",
          status: "typing",
          color: "#F59E0B"
        }])
      }, 4000)
    }
    
    return () => {
      if (collaborationWs.current) {
        collaborationWs.current.close()
      }
    }
  }, [isLive])
  
  // AI-powered suggestion generation
  const generateAISuggestions = useCallback(() => {
    if (!aiSuggestionsEnabled || !emailContent.body) return
    
    // Simulate AI analysis
    const suggestions: SuggestionRange[] = []
    
    // Grammar and tone suggestions
    if (emailContent.body.includes("ASAP")) {
      suggestions.push({
        start: emailContent.body.indexOf("ASAP"),
        end: emailContent.body.indexOf("ASAP") + 4,
        suggestion: "at your earliest convenience",
        author: {
          id: "ai",
          name: "AI Assistant",
          email: "ai@mail01.com",
          role: "viewer",
          status: "online",
          color: "#8B5CF6"
        }
      })
    }
    
    setSuggestions(suggestions)
  }, [emailContent.body, aiSuggestionsEnabled])
  
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      generateAISuggestions()
    }, 1000)
    
    return () => clearTimeout(debounceTimer)
  }, [emailContent.body, generateAISuggestions])
  
  // Save version history
  const saveVersion = useCallback(() => {
    const newVersion: EmailVersion = {
      id: Date.now().toString(),
      author: collaborators[0],
      timestamp: new Date(),
      changes: ["Updated email content"],
      content: JSON.stringify(emailContent)
    }
    
    setVersions(prev => [newVersion, ...prev])
  }, [emailContent, collaborators])
  
  // Add comment to selection
  const addComment = useCallback(() => {
    if (!selectedText) return
    
    const newComment: Comment = {
      id: Date.now().toString(),
      author: collaborators[0],
      text: selectedText,
      timestamp: new Date(),
      resolved: false
    }
    
    setComments(prev => [...prev, newComment])
    setSelectedText("")
  }, [selectedText, collaborators])
  
  // Handle text selection
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      setSelectedText(selection.toString())
    }
  }, [])
  
  // Invite collaborator
  const inviteCollaborator = useCallback(() => {
    const email = prompt("Enter collaborator's email:")
    if (email) {
      const newCollaborator: Collaborator = {
        id: Date.now().toString(),
        name: email.split("@")[0],
        email,
        role: "editor",
        status: "offline",
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`
      }
      
      setCollaborators(prev => [...prev, newCollaborator])
      
      // Simulate sending invitation
      console.log(`Invitation sent to ${email}`)
    }
  }, [])
  
  // Start video call
  const startVideoCall = useCallback(() => {
    console.log("Starting video call with collaborators...")
    // In production, integrate with WebRTC or video calling service
  }, [])
  
  return (
    <Card className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            Collaborative Email Composer
          </h2>
          
          <div className="flex items-center gap-4">
            {/* Privacy Mode */}
            <div className="flex items-center gap-2">
              {privacyMode === "private" ? (
                <Lock className="w-4 h-4" />
              ) : privacyMode === "public" ? (
                <Globe className="w-4 h-4" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              <select
                value={privacyMode}
                onChange={(e) => setPrivacyMode(e.target.value as any)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="private">Private</option>
                <option value="team">Team Only</option>
                <option value="public">Public</option>
              </select>
            </div>
            
            {/* Live Collaboration Toggle */}
            <Button
              variant={isLive ? "default" : "outline"}
              size="sm"
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                  Live
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
                  Start Live Session
                </>
              )}
            </Button>
            
            {/* AI Suggestions Toggle */}
            <Button
              variant={aiSuggestionsEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setAiSuggestionsEnabled(!aiSuggestionsEnabled)}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              AI Assist
            </Button>
          </div>
        </div>
        
        {/* Collaborators Bar */}
        {isLive && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Collaborators:</span>
              <div className="flex -space-x-2">
                {collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="relative"
                    title={`${collab.name} (${collab.role})`}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs"
                      style={{ backgroundColor: collab.color }}
                    >
                      {collab.name[0].toUpperCase()}
                    </div>
                    {collab.status === "online" && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                    )}
                    {collab.status === "typing" && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-yellow-500 rounded-full border-2 border-white animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
              
              <Button size="sm" variant="ghost" onClick={inviteCollaborator}>
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={startVideoCall}>
                <Video className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Email Fields */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="To..."
            value={emailContent.to}
            onChange={(e) => setEmailContent(prev => ({ ...prev, to: e.target.value }))}
            className="px-3 py-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="CC..."
            value={emailContent.cc}
            onChange={(e) => setEmailContent(prev => ({ ...prev, cc: e.target.value }))}
            className="px-3 py-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="BCC..."
            value={emailContent.bcc}
            onChange={(e) => setEmailContent(prev => ({ ...prev, bcc: e.target.value }))}
            className="px-3 py-2 border rounded-lg"
          />
        </div>
        
        <input
          type="text"
          placeholder="Subject..."
          value={emailContent.subject}
          onChange={(e) => setEmailContent(prev => ({ ...prev, subject: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
      
      {/* Main Editor Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Email Body Editor */}
        <div className="lg:col-span-3">
          <div className="relative">
            <textarea
              ref={contentRef}
              value={emailContent.body}
              onChange={(e) => setEmailContent(prev => ({ ...prev, body: e.target.value }))}
              onMouseUp={handleTextSelection}
              placeholder="Compose your email..."
              className="w-full h-96 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {/* AI Suggestions Overlay */}
            {suggestions.length > 0 && (
              <div className="absolute top-2 right-2 max-w-xs">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-900">AI Suggestions</span>
                  </div>
                  {suggestions.map((suggestion, idx) => (
                    <div key={idx} className="text-xs text-purple-700 mb-2">
                      <span className="line-through">{emailContent.body.substring(suggestion.start, suggestion.end)}</span>
                      <span className="ml-2 text-green-600">{suggestion.suggestion}</span>
                      <div className="mt-1">
                        <Button size="sm" variant="ghost" className="h-6 text-xs">
                          Accept
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 text-xs">
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Typing Indicators */}
            {isLive && collaborators.filter(c => c.status === "typing" && c.id !== "1").length > 0 && (
              <div className="absolute bottom-2 left-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span>
                    {collaborators.filter(c => c.status === "typing" && c.id !== "1").map(c => c.name).join(", ")} typing...
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Editor Actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              {selectedText && (
                <Button size="sm" variant="outline" onClick={addComment}>
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Comment
                </Button>
              )}
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowVersionHistory(!showVersionHistory)}
              >
                <GitBranch className="w-4 h-4 mr-1" />
                Version History ({versions.length})
              </Button>
              <Button size="sm" variant="outline" onClick={saveVersion}>
                <Clock className="w-4 h-4 mr-1" />
                Save Version
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {emailContent.body.length} characters
              </span>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Comments Section */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comments ({comments.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-500">No comments yet</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-xs">{comment.author.name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs">{comment.text}</p>
                    {!comment.resolved && (
                      <Button size="sm" variant="ghost" className="h-6 text-xs mt-1">
                        Resolve
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Activity Feed */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Activity
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
                <div>
                  <span className="font-medium">Alice</span> joined the session
                  <span className="text-gray-500 block">2 min ago</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Edit3 className="w-3 h-3 text-blue-500 mt-0.5" />
                <div>
                  <span className="font-medium">Bob</span> is editing
                  <span className="text-gray-500 block">Just now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Version History Modal */}
      {showVersionHistory && versions.length > 0 && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-3">Version History</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {versions.map((version) => (
              <div key={version.id} className="flex items-center justify-between p-2 bg-white rounded">
                <div>
                  <span className="text-sm font-medium">{version.author.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(version.timestamp).toLocaleString()}
                  </span>
                </div>
                <Button size="sm" variant="ghost">
                  Restore
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex justify-between mt-6">
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
          <Button variant="outline">
            Save Draft
          </Button>
        </div>
        
        <div className="flex gap-2">
          {isLive && (
            <Badge variant="default" className="px-3 py-1">
              <Users className="w-3 h-3 mr-1" />
              {collaborators.length} Active
            </Badge>
          )}
          <Button>
            <Send className="w-4 h-4 mr-1" />
            Send Email
          </Button>
        </div>
      </div>
    </Card>
  )
}