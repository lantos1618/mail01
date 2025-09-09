"use client"

import { AssistantFrame, FrameMessage, FrameRuntime } from "@assistant-ui/react"
import { useEffect, useRef, useState } from "react"

// Assistant Frame API for cross-iframe email model context sharing
export class EmailFrameAPI {
  private frame: AssistantFrame
  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  
  constructor(targetOrigin: string = "*") {
    this.frame = new AssistantFrame({
      targetOrigin,
      onMessage: this.handleMessage.bind(this)
    })
  }
  
  // Share email context across iframes
  async shareEmailContext(emailData: {
    threadId: string
    emails: any[]
    participants: string[]
    metadata: Record<string, any>
  }) {
    return this.frame.postMessage({
      type: "email.context.share",
      payload: emailData
    })
  }
  
  // Request AI analysis from parent frame
  async requestAnalysis(request: {
    type: "sentiment" | "summary" | "action-items" | "priority"
    content: string
    context?: any
  }) {
    return this.frame.postMessage({
      type: "email.analysis.request",
      payload: request
    })
  }
  
  // Subscribe to cross-frame events
  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
    
    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }
  
  private handleMessage(message: FrameMessage) {
    const listeners = this.listeners.get(message.type)
    if (listeners) {
      listeners.forEach(callback => callback(message.payload))
    }
  }
}

// React hook for Frame API
export function useEmailFrame() {
  const frameRef = useRef<EmailFrameAPI>()
  const [connected, setConnected] = useState(false)
  const [sharedContext, setSharedContext] = useState<any>(null)
  
  useEffect(() => {
    frameRef.current = new EmailFrameAPI()
    
    // Listen for connection
    const unsubConnect = frameRef.current.on("frame.connected", () => {
      setConnected(true)
    })
    
    // Listen for shared context updates
    const unsubContext = frameRef.current.on("email.context.update", (data) => {
      setSharedContext(data)
    })
    
    return () => {
      unsubConnect()
      unsubContext()
    }
  }, [])
  
  return {
    frame: frameRef.current,
    connected,
    sharedContext
  }
}

// Email Widget Frame Component
export function EmailWidgetFrame({ 
  src, 
  emailContext,
  onAction 
}: {
  src: string
  emailContext?: any
  onAction?: (action: any) => void
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [runtime, setRuntime] = useState<FrameRuntime>()
  
  useEffect(() => {
    if (!iframeRef.current) return
    
    const frameRuntime = new FrameRuntime({
      iframe: iframeRef.current,
      onMessage: (msg) => {
        if (msg.type === "email.action" && onAction) {
          onAction(msg.payload)
        }
      }
    })
    
    setRuntime(frameRuntime)
    
    // Share initial context
    if (emailContext) {
      frameRuntime.postMessage({
        type: "email.context.init",
        payload: emailContext
      })
    }
    
    return () => {
      frameRuntime.destroy()
    }
  }, [emailContext, onAction])
  
  return (
    <iframe
      ref={iframeRef}
      src={src}
      className="w-full h-full border-0"
      sandbox="allow-scripts allow-same-origin allow-forms"
      allow="microphone; camera"
    />
  )
}

// Cross-frame email collaboration
export function EmailCollaborationFrame() {
  const { frame, connected, sharedContext } = useEmailFrame()
  const [collaborators, setCollaborators] = useState<string[]>([])
  const [draftContent, setDraftContent] = useState("")
  
  useEffect(() => {
    if (!frame) return
    
    // Listen for collaborator updates
    const unsubCollab = frame.on("collaboration.update", (data) => {
      setCollaborators(data.collaborators)
      if (data.draft) {
        setDraftContent(data.draft)
      }
    })
    
    // Listen for AI suggestions
    const unsubSuggest = frame.on("ai.suggestion", (data) => {
      // Handle AI suggestions for collaborative editing
      console.log("AI Suggestion:", data)
    })
    
    return () => {
      unsubCollab()
      unsubSuggest()
    }
  }, [frame])
  
  const shareUpdate = (content: string) => {
    frame?.shareEmailContext({
      threadId: sharedContext?.threadId || "",
      emails: sharedContext?.emails || [],
      participants: collaborators,
      metadata: {
        draft: content,
        lastEditedBy: "current-user",
        timestamp: new Date().toISOString()
      }
    })
  }
  
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Collaborative Editing</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-gray-400"}`} />
          <span className="text-sm text-muted-foreground">
            {connected ? "Connected" : "Connecting..."}
          </span>
        </div>
      </div>
      
      {collaborators.length > 0 && (
        <div className="flex gap-2 mb-3">
          {collaborators.map((collab) => (
            <div key={collab} className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-xs">{collab}</span>
            </div>
          ))}
        </div>
      )}
      
      <textarea
        value={draftContent}
        onChange={(e) => {
          setDraftContent(e.target.value)
          shareUpdate(e.target.value)
        }}
        className="w-full h-32 p-3 border rounded-md resize-none"
        placeholder="Start composing collaboratively..."
      />
      
      {sharedContext && (
        <div className="mt-3 p-2 bg-muted/50 rounded text-xs">
          Context: {sharedContext.emails?.length || 0} emails in thread
        </div>
      )}
    </div>
  )
}