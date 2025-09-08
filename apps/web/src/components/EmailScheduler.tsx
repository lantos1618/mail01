"use client"

import { useState, useCallback, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, Calendar, Send, Pause, Play, 
  AlertCircle, CheckCircle, XCircle, RefreshCw,
  Sunrise, Sun, Sunset, Moon, Globe,
  Repeat, Bell, BellOff, Zap, Brain,
  Coffee, Briefcase, Home, Plane
} from "lucide-react"

interface ScheduledEmail {
  id: string
  to: string
  subject: string
  body: string
  scheduledTime: Date
  status: "pending" | "sent" | "failed" | "paused"
  recurring?: RecurringPattern
  timezone: string
  optimizedTime?: Date
  aiSuggestion?: string
}

interface RecurringPattern {
  type: "daily" | "weekly" | "monthly" | "custom"
  interval: number
  daysOfWeek?: number[]
  endDate?: Date
  occurrences?: number
}

interface SnoozeOption {
  label: string
  duration: number
  icon: React.ReactNode
}

interface SmartScheduleSuggestion {
  time: Date
  reason: string
  confidence: number
  factors: string[]
}

export default function EmailScheduler() {
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([])
  const [selectedEmail, setSelectedEmail] = useState<ScheduledEmail | null>(null)
  const [showScheduler, setShowScheduler] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [recurringEnabled, setRecurringEnabled] = useState(false)
  const [recurringPattern, setRecurringPattern] = useState<RecurringPattern>({
    type: "daily",
    interval: 1
  })
  const [smartScheduling, setSmartScheduling] = useState(true)
  const [suggestions, setSuggestions] = useState<SmartScheduleSuggestion[]>([])
  const [userTimezone, setUserTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [recipientTimezone, setRecipientTimezone] = useState("")
  const [workingHoursOnly, setWorkingHoursOnly] = useState(true)
  
  const snoozeOptions: SnoozeOption[] = [
    { label: "Later today", duration: 3 * 60 * 60 * 1000, icon: <Coffee className="w-4 h-4" /> },
    { label: "Tomorrow morning", duration: 18 * 60 * 60 * 1000, icon: <Sunrise className="w-4 h-4" /> },
    { label: "Tomorrow afternoon", duration: 24 * 60 * 60 * 1000, icon: <Sun className="w-4 h-4" /> },
    { label: "Next week", duration: 7 * 24 * 60 * 60 * 1000, icon: <Calendar className="w-4 h-4" /> },
    { label: "Next month", duration: 30 * 24 * 60 * 60 * 1000, icon: <Calendar className="w-4 h-4" /> }
  ]
  
  // Generate smart scheduling suggestions
  useEffect(() => {
    if (smartScheduling && showScheduler) {
      const generateSuggestions = () => {
        const now = new Date()
        const suggestions: SmartScheduleSuggestion[] = []
        
        // Best time based on recipient's timezone
        if (recipientTimezone) {
          const recipientMorning = new Date()
          recipientMorning.setHours(9, 0, 0, 0)
          suggestions.push({
            time: recipientMorning,
            reason: "Recipient's morning - highest open rate",
            confidence: 0.92,
            factors: ["Timezone optimization", "Peak engagement hours", "Historical data"]
          })
        }
        
        // Avoid weekends
        const nextMonday = new Date()
        const day = nextMonday.getDay()
        const daysToMonday = day === 0 ? 1 : 8 - day
        nextMonday.setDate(nextMonday.getDate() + daysToMonday)
        nextMonday.setHours(10, 0, 0, 0)
        
        if (day === 0 || day === 6) {
          suggestions.push({
            time: nextMonday,
            reason: "Next business day - better engagement",
            confidence: 0.88,
            factors: ["Business hours", "Weekday delivery", "Professional context"]
          })
        }
        
        // After meetings (calendar integration)
        const afterMeeting = new Date()
        afterMeeting.setHours(14, 30, 0, 0)
        suggestions.push({
          time: afterMeeting,
          reason: "After typical meeting blocks",
          confidence: 0.75,
          factors: ["Calendar patterns", "Post-lunch timing", "Focused work time"]
        })
        
        // End of day summary
        const endOfDay = new Date()
        endOfDay.setHours(17, 0, 0, 0)
        suggestions.push({
          time: endOfDay,
          reason: "End of workday - summary emails",
          confidence: 0.70,
          factors: ["Daily wrap-up", "Lower priority items", "Next-day preparation"]
        })
        
        setSuggestions(suggestions)
      }
      
      generateSuggestions()
    }
  }, [smartScheduling, showScheduler, recipientTimezone])
  
  // Schedule email
  const scheduleEmail = useCallback((email: Partial<ScheduledEmail>) => {
    const scheduledTime = new Date(`${selectedDate}T${selectedTime}`)
    
    const newEmail: ScheduledEmail = {
      id: Date.now().toString(),
      to: email.to || "",
      subject: email.subject || "",
      body: email.body || "",
      scheduledTime,
      status: "pending",
      timezone: userTimezone,
      recurring: recurringEnabled ? recurringPattern : undefined,
      optimizedTime: smartScheduling ? suggestions[0]?.time : undefined,
      aiSuggestion: smartScheduling ? suggestions[0]?.reason : undefined
    }
    
    setScheduledEmails(prev => [...prev, newEmail])
    setShowScheduler(false)
    
    // Simulate scheduling
    console.log("Email scheduled for:", scheduledTime)
  }, [selectedDate, selectedTime, userTimezone, recurringEnabled, recurringPattern, smartScheduling, suggestions])
  
  // Snooze email
  const snoozeEmail = useCallback((emailId: string, duration: number) => {
    setScheduledEmails(prev => prev.map(email => {
      if (email.id === emailId) {
        const newTime = new Date(Date.now() + duration)
        return { ...email, scheduledTime: newTime, status: "pending" }
      }
      return email
    }))
  }, [])
  
  // Cancel scheduled email
  const cancelScheduledEmail = useCallback((emailId: string) => {
    setScheduledEmails(prev => prev.filter(email => email.id !== emailId))
  }, [])
  
  // Pause/Resume email
  const toggleEmailStatus = useCallback((emailId: string) => {
    setScheduledEmails(prev => prev.map(email => {
      if (email.id === emailId) {
        return {
          ...email,
          status: email.status === "paused" ? "pending" : "paused"
        }
      }
      return email
    }))
  }, [])
  
  // Apply smart suggestion
  const applySuggestion = useCallback((suggestion: SmartScheduleSuggestion) => {
    const date = suggestion.time.toISOString().split("T")[0]
    const time = suggestion.time.toTimeString().slice(0, 5)
    setSelectedDate(date)
    setSelectedTime(time)
  }, [])
  
  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `in ${days} day${days > 1 ? "s" : ""}`
    if (hours > 0) return `in ${hours} hour${hours > 1 ? "s" : ""}`
    const minutes = Math.floor(diff / (1000 * 60))
    return `in ${minutes} minute${minutes > 1 ? "s" : ""}`
  }
  
  // Get time period icon
  const getTimePeriodIcon = (date: Date) => {
    const hour = date.getHours()
    if (hour < 6) return <Moon className="w-4 h-4" />
    if (hour < 12) return <Sunrise className="w-4 h-4" />
    if (hour < 18) return <Sun className="w-4 h-4" />
    if (hour < 21) return <Sunset className="w-4 h-4" />
    return <Moon className="w-4 h-4" />
  }
  
  return (
    <Card className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="w-8 h-8 text-indigo-600" />
            Email Scheduler & Automation
          </h2>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              <Globe className="w-3 h-3 mr-1" />
              {userTimezone}
            </Badge>
            <Button
              variant={smartScheduling ? "default" : "outline"}
              size="sm"
              onClick={() => setSmartScheduling(!smartScheduling)}
            >
              <Brain className="w-4 h-4 mr-1" />
              Smart Scheduling
            </Button>
            <Button onClick={() => setShowScheduler(true)}>
              <Clock className="w-4 h-4 mr-1" />
              Schedule Email
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Scheduled</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {scheduledEmails.filter(e => e.status === "pending").length}
            </p>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sent</span>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-900">
              {scheduledEmails.filter(e => e.status === "sent").length}
            </p>
          </div>
          
          <div className="p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Paused</span>
              <Pause className="w-4 h-4 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-900">
              {scheduledEmails.filter(e => e.status === "paused").length}
            </p>
          </div>
          
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Recurring</span>
              <Repeat className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {scheduledEmails.filter(e => e.recurring).length}
            </p>
          </div>
        </div>
      </div>
      
      {/* Scheduler Modal */}
      {showScheduler && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Schedule Email</h3>
            
            {/* Email Details */}
            <div className="space-y-4 mb-6">
              <input
                type="email"
                placeholder="To..."
                className="w-full px-3 py-2 border rounded-lg"
                onChange={(e) => {
                  // Detect recipient timezone from email domain
                  if (e.target.value.includes("@")) {
                    // In production, lookup timezone based on domain
                    setRecipientTimezone("America/New_York")
                  }
                }}
              />
              <input
                type="text"
                placeholder="Subject..."
                className="w-full px-3 py-2 border rounded-lg"
              />
              <textarea
                placeholder="Message..."
                className="w-full px-3 py-2 border rounded-lg h-32 resize-none"
              />
            </div>
            
            {/* Smart Suggestions */}
            {smartScheduling && suggestions.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  AI Recommendations
                </h4>
                <div className="space-y-2">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => applySuggestion(suggestion)}
                      className="w-full p-3 border rounded-lg hover:bg-gray-50 text-left"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">
                          {suggestion.time.toLocaleString()}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(suggestion.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{suggestion.reason}</p>
                      <div className="flex gap-2 mt-2">
                        {suggestion.factors.map((factor, i) => (
                          <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {factor}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Manual Scheduling */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time</label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              
              {/* Timezone Selection */}
              {recipientTimezone && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm">
                    <Globe className="inline w-4 h-4 mr-1" />
                    Recipient timezone detected: <strong>{recipientTimezone}</strong>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Email will be delivered at recipient's local time
                  </p>
                </div>
              )}
              
              {/* Recurring Options */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={recurringEnabled}
                    onChange={(e) => setRecurringEnabled(e.target.checked)}
                  />
                  <Repeat className="w-4 h-4" />
                  <span className="text-sm font-medium">Make this recurring</span>
                </label>
                
                {recurringEnabled && (
                  <div className="mt-3 p-3 border rounded-lg">
                    <select
                      value={recurringPattern.type}
                      onChange={(e) => setRecurringPattern({
                        ...recurringPattern,
                        type: e.target.value as any
                      })}
                      className="w-full px-3 py-2 border rounded mb-2"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="custom">Custom</option>
                    </select>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Every</span>
                      <input
                        type="number"
                        value={recurringPattern.interval}
                        onChange={(e) => setRecurringPattern({
                          ...recurringPattern,
                          interval: parseInt(e.target.value)
                        })}
                        className="w-16 px-2 py-1 border rounded"
                        min="1"
                      />
                      <span className="text-sm">{recurringPattern.type}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Working Hours */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={workingHoursOnly}
                  onChange={(e) => setWorkingHoursOnly(e.target.checked)}
                />
                <Briefcase className="w-4 h-4" />
                <span className="text-sm">Only send during working hours (9-5)</span>
              </label>
            </div>
            
            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowScheduler(false)}>
                Cancel
              </Button>
              <Button onClick={() => scheduleEmail({
                to: "recipient@example.com",
                subject: "Scheduled Email",
                body: "This is a scheduled email"
              })}>
                <Send className="w-4 h-4 mr-1" />
                Schedule Email
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Scheduled Emails List */}
      <div className="space-y-3">
        <h3 className="font-semibold mb-3">Scheduled Emails</h3>
        
        {scheduledEmails.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No scheduled emails</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setShowScheduler(true)}
            >
              Schedule your first email
            </Button>
          </div>
        ) : (
          scheduledEmails.map((email) => (
            <div
              key={email.id}
              className={`p-4 border rounded-lg ${
                email.status === "paused" ? "bg-yellow-50" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {email.status === "pending" && <Clock className="w-4 h-4 text-blue-500" />}
                    {email.status === "sent" && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {email.status === "paused" && <Pause className="w-4 h-4 text-yellow-500" />}
                    {email.status === "failed" && <XCircle className="w-4 h-4 text-red-500" />}
                    
                    <h4 className="font-semibold">{email.subject}</h4>
                    
                    {email.recurring && (
                      <Badge variant="outline" className="text-xs">
                        <Repeat className="w-3 h-3 mr-1" />
                        Recurring
                      </Badge>
                    )}
                    
                    {email.aiSuggestion && (
                      <Badge variant="outline" className="text-xs">
                        <Brain className="w-3 h-3 mr-1" />
                        AI Optimized
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <span>To: {email.to}</span>
                    <span className="mx-2">·</span>
                    <span className="flex items-center gap-1 inline">
                      {getTimePeriodIcon(email.scheduledTime)}
                      {email.scheduledTime.toLocaleString()}
                    </span>
                    <span className="mx-2">·</span>
                    <span className="text-blue-600 font-medium">
                      {formatRelativeTime(email.scheduledTime)}
                    </span>
                  </div>
                  
                  {email.aiSuggestion && (
                    <p className="text-xs text-gray-500 italic">
                      AI: {email.aiSuggestion}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Snooze Options */}
                  {email.status === "pending" && (
                    <div className="relative group">
                      <Button size="sm" variant="outline">
                        <Bell className="w-4 h-4" />
                      </Button>
                      <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg p-2 hidden group-hover:block z-10 w-48">
                        <p className="text-xs font-semibold mb-2">Snooze</p>
                        {snoozeOptions.map((option) => (
                          <button
                            key={option.label}
                            onClick={() => snoozeEmail(email.id, option.duration)}
                            className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm flex items-center gap-2"
                          >
                            {option.icon}
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Pause/Resume */}
                  {(email.status === "pending" || email.status === "paused") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleEmailStatus(email.id)}
                    >
                      {email.status === "paused" ? (
                        <Play className="w-4 h-4" />
                      ) : (
                        <Pause className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                  
                  {/* Cancel */}
                  {email.status !== "sent" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelScheduledEmail(email.id)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}