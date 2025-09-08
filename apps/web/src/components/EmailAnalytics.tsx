"use client"

import { useState, useEffect } from "react"
import { 
  BarChart3, TrendingUp, Users, Clock, Mail, 
  Calendar, Target, Activity, Zap, Brain,
  ArrowUp, ArrowDown, Minus
} from "lucide-react"
import { analyzeRelationships } from "@/lib/services/emailAIEnhanced"

interface AnalyticsData {
  totalEmails: number
  sentEmails: number
  receivedEmails: number
  averageResponseTime: number
  topContacts: any[]
  emailsByHour: number[]
  emailsByDay: number[]
  sentimentDistribution: {
    positive: number
    neutral: number
    negative: number
  }
  categoryDistribution: {
    work: number
    personal: number
    marketing: number
    other: number
  }
}

export default function EmailAnalytics({ emails }: { emails: any[] }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [relationships, setRelationships] = useState<any>(null)
  const [selectedMetric, setSelectedMetric] = useState<'volume' | 'response' | 'sentiment'>('volume')
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week')

  useEffect(() => {
    if (emails.length > 0) {
      calculateAnalytics()
      analyzeEmailRelationships()
    }
  }, [emails, timeRange])

  const calculateAnalytics = () => {
    const now = new Date()
    const rangeStart = new Date()
    
    if (timeRange === 'day') {
      rangeStart.setDate(now.getDate() - 1)
    } else if (timeRange === 'week') {
      rangeStart.setDate(now.getDate() - 7)
    } else {
      rangeStart.setMonth(now.getMonth() - 1)
    }

    const filteredEmails = emails.filter(e => 
      new Date(e.timestamp) >= rangeStart
    )

    // Calculate metrics
    const sentEmails = filteredEmails.filter(e => e.folder === 'sent')
    const receivedEmails = filteredEmails.filter(e => e.folder === 'received')

    // Calculate hourly distribution
    const emailsByHour = new Array(24).fill(0)
    filteredEmails.forEach(e => {
      const hour = new Date(e.timestamp).getHours()
      emailsByHour[hour]++
    })

    // Calculate daily distribution
    const emailsByDay = new Array(7).fill(0)
    filteredEmails.forEach(e => {
      const day = new Date(e.timestamp).getDay()
      emailsByDay[day]++
    })

    // Mock sentiment distribution (in production, would analyze actual emails)
    const sentimentDistribution = {
      positive: Math.floor(filteredEmails.length * 0.6),
      neutral: Math.floor(filteredEmails.length * 0.3),
      negative: Math.floor(filteredEmails.length * 0.1)
    }

    // Mock category distribution
    const categoryDistribution = {
      work: Math.floor(filteredEmails.length * 0.5),
      personal: Math.floor(filteredEmails.length * 0.2),
      marketing: Math.floor(filteredEmails.length * 0.2),
      other: Math.floor(filteredEmails.length * 0.1)
    }

    // Calculate top contacts
    const contactFrequency = new Map()
    filteredEmails.forEach(e => {
      const contact = e.folder === 'sent' ? e.to : e.from
      if (contact) {
        contactFrequency.set(contact, (contactFrequency.get(contact) || 0) + 1)
      }
    })

    const topContacts = Array.from(contactFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([email, count]) => ({ email, count }))

    setAnalytics({
      totalEmails: filteredEmails.length,
      sentEmails: sentEmails.length,
      receivedEmails: receivedEmails.length,
      averageResponseTime: 2.5, // Mock value in hours
      topContacts,
      emailsByHour,
      emailsByDay,
      sentimentDistribution,
      categoryDistribution
    })
  }

  const analyzeEmailRelationships = async () => {
    try {
      const analysis = await analyzeRelationships(emails)
      setRelationships(analysis)
    } catch (error) {
      console.error("Error analyzing relationships:", error)
    }
  }

  const getChangeIndicator = (value: number) => {
    if (value > 0) return <ArrowUp className="w-4 h-4 text-green-500" />
    if (value < 0) return <ArrowDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-500">Analyzing email patterns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Email Analytics</h2>
            <p className="text-sm text-gray-500">Insights powered by AI</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {(['day', 'week', 'month'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-md text-sm capitalize transition-colors ${
                timeRange === range
                  ? 'bg-white dark:bg-gray-700 shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <Mail className="w-5 h-5 text-blue-500" />
            {getChangeIndicator(12)}
          </div>
          <p className="text-2xl font-bold">{analytics.totalEmails}</p>
          <p className="text-sm text-gray-500">Total Emails</p>
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-green-500" />
            {getChangeIndicator(-8)}
          </div>
          <p className="text-2xl font-bold">{analytics.averageResponseTime}h</p>
          <p className="text-sm text-gray-500">Avg Response Time</p>
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            {getChangeIndicator(25)}
          </div>
          <p className="text-2xl font-bold">{analytics.sentEmails}</p>
          <p className="text-sm text-gray-500">Emails Sent</p>
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-orange-500" />
            {getChangeIndicator(3)}
          </div>
          <p className="text-2xl font-bold">{analytics.topContacts.length}</p>
          <p className="text-sm text-gray-500">Active Contacts</p>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
        {(['volume', 'response', 'sentiment'] as const).map(metric => (
          <button
            key={metric}
            onClick={() => setSelectedMetric(metric)}
            className={`px-4 py-2 rounded-md text-sm capitalize transition-colors ${
              selectedMetric === metric
                ? 'bg-white dark:bg-gray-700 shadow-sm'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {metric}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Activity by Hour */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            Email Activity by Hour
          </h3>
          <div className="h-40 flex items-end justify-between gap-1">
            {analytics.emailsByHour.map((count, hour) => (
              <div
                key={hour}
                className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t hover:from-blue-600 hover:to-blue-500 transition-colors relative group"
                style={{ height: `${(count / Math.max(...analytics.emailsByHour)) * 100}%` }}
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-1 py-0.5 rounded">
                  {count}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>12AM</span>
            <span>6AM</span>
            <span>12PM</span>
            <span>6PM</span>
            <span>11PM</span>
          </div>
        </div>

        {/* Activity by Day */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-500" />
            Email Activity by Day
          </h3>
          <div className="h-40 flex items-end justify-between gap-2">
            {analytics.emailsByDay.map((count, day) => (
              <div key={day} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t hover:from-green-600 hover:to-green-500 transition-colors relative group"
                  style={{ height: `${(count / Math.max(...analytics.emailsByDay)) * 100}%` }}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-1 py-0.5 rounded">
                    {count}
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-2">{dayNames[day]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-500" />
            Sentiment Analysis
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Positive</span>
                <span className="text-green-600">{analytics.sentimentDistribution.positive}</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-400"
                  style={{ width: `${(analytics.sentimentDistribution.positive / analytics.totalEmails) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Neutral</span>
                <span className="text-gray-600">{analytics.sentimentDistribution.neutral}</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-gray-500 to-gray-400"
                  style={{ width: `${(analytics.sentimentDistribution.neutral / analytics.totalEmails) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Negative</span>
                <span className="text-red-600">{analytics.sentimentDistribution.negative}</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-red-400"
                  style={{ width: `${(analytics.sentimentDistribution.negative / analytics.totalEmails) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Contacts */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" />
            Top Contacts
          </h3>
          <div className="space-y-2">
            {analytics.topContacts.map((contact, i) => (
              <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {contact.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm truncate max-w-[150px]">{contact.email}</span>
                </div>
                <span className="text-sm font-medium text-gray-500">{contact.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {relationships && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-600" />
            AI Insights & Recommendations
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Communication Patterns</p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Peak activity: {relationships.communicationPatterns?.peakHours?.[0] || 'N/A'}</li>
                <li>• Most active day: {relationships.communicationPatterns?.peakDays?.[0] || 'N/A'}</li>
                <li>• Avg response time: {relationships.communicationPatterns?.averageResponseTime || 'N/A'}</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommendations</p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {relationships.recommendations?.slice(0, 3).map((rec: string, i: number) => (
                  <li key={i}>• {rec}</li>
                )) || <li>No recommendations available</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}