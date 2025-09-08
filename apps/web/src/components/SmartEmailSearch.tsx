"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, Filter, Calendar, User, Paperclip, 
  Star, Archive, Trash2, Tag, Clock, 
  TrendingUp, Brain, Sparkles, Zap,
  FileText, Image, Video, Music, Code,
  MapPin, Phone, Mail, Globe, Hash
} from "lucide-react"

interface SearchFilter {
  id: string
  type: "sender" | "date" | "attachment" | "label" | "size" | "sentiment" | "priority"
  value: any
  operator: "equals" | "contains" | "greater" | "less" | "between"
}

interface SearchResult {
  id: string
  subject: string
  sender: string
  preview: string
  date: Date
  hasAttachment: boolean
  isStarred: boolean
  labels: string[]
  score: number
  highlights: string[]
  sentiment: "positive" | "neutral" | "negative"
  priority: "urgent" | "high" | "normal" | "low"
  category: string
}

interface SavedSearch {
  id: string
  name: string
  query: string
  filters: SearchFilter[]
  lastUsed: Date
  useCount: number
}

interface SearchInsight {
  type: "pattern" | "suggestion" | "trend"
  message: string
  action?: () => void
}

export default function SmartEmailSearch() {
  const [query, setQuery] = useState("")
  const [naturalLanguageMode, setNaturalLanguageMode] = useState(true)
  const [filters, setFilters] = useState<SearchFilter[]>([])
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([
    {
      id: "1",
      name: "Urgent from team",
      query: "urgent OR important",
      filters: [{ id: "1", type: "priority", value: "urgent", operator: "equals" }],
      lastUsed: new Date(Date.now() - 86400000),
      useCount: 15
    },
    {
      id: "2",
      name: "With attachments this week",
      query: "has:attachment",
      filters: [{ id: "2", type: "date", value: 7, operator: "less" }],
      lastUsed: new Date(Date.now() - 172800000),
      useCount: 8
    }
  ])
  const [searchInsights, setSearchInsights] = useState<SearchInsight[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [autoComplete, setAutoComplete] = useState<string[]>([])
  const [selectedResultIds, setSelectedResultIds] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<"list" | "grid" | "timeline">("list")
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)
  
  // Parse natural language query
  const parseNaturalLanguage = useCallback((input: string) => {
    const parsedFilters: SearchFilter[] = []
    let processedQuery = input
    
    // Date parsing
    const datePatterns = [
      { pattern: /yesterday/i, value: 1, type: "date" as const },
      { pattern: /last week/i, value: 7, type: "date" as const },
      { pattern: /last month/i, value: 30, type: "date" as const },
      { pattern: /this year/i, value: 365, type: "date" as const }
    ]
    
    datePatterns.forEach(({ pattern, value, type }) => {
      if (pattern.test(input)) {
        parsedFilters.push({
          id: Date.now().toString(),
          type,
          value,
          operator: "less"
        })
        processedQuery = processedQuery.replace(pattern, "")
      }
    })
    
    // Sender parsing
    const fromMatch = input.match(/from[: ](\S+)/i)
    if (fromMatch) {
      parsedFilters.push({
        id: Date.now().toString(),
        type: "sender",
        value: fromMatch[1],
        operator: "contains"
      })
      processedQuery = processedQuery.replace(fromMatch[0], "")
    }
    
    // Attachment detection
    if (/with attachment|has attachment|attached/i.test(input)) {
      parsedFilters.push({
        id: Date.now().toString(),
        type: "attachment",
        value: true,
        operator: "equals"
      })
      processedQuery = processedQuery.replace(/with attachment|has attachment|attached/gi, "")
    }
    
    // Sentiment analysis
    const sentimentPatterns = [
      { pattern: /urgent|important|critical/i, sentiment: "urgent" },
      { pattern: /happy|positive|good/i, sentiment: "positive" },
      { pattern: /angry|negative|bad/i, sentiment: "negative" }
    ]
    
    sentimentPatterns.forEach(({ pattern, sentiment }) => {
      if (pattern.test(input)) {
        parsedFilters.push({
          id: Date.now().toString(),
          type: "sentiment",
          value: sentiment,
          operator: "equals"
        })
      }
    })
    
    setFilters(parsedFilters)
    return processedQuery.trim()
  }, [])
  
  // Perform search
  const performSearch = useCallback(async () => {
    setIsSearching(true)
    
    // Parse natural language if enabled
    const searchQuery = naturalLanguageMode ? parseNaturalLanguage(query) : query
    
    // Simulate AI-powered search
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Generate mock results with AI scoring
    const mockResults: SearchResult[] = [
      {
        id: "1",
        subject: "Q4 Budget Review - Urgent Action Required",
        sender: "alice@company.com",
        preview: "Please review the attached Q4 budget projections and provide feedback by EOD...",
        date: new Date(Date.now() - 3600000),
        hasAttachment: true,
        isStarred: true,
        labels: ["Finance", "Urgent"],
        score: 0.95,
        highlights: ["Q4", "budget", "urgent"],
        sentiment: "neutral",
        priority: "urgent",
        category: "Work"
      },
      {
        id: "2",
        subject: "Team Meeting Notes - Product Roadmap Discussion",
        sender: "bob@company.com",
        preview: "Here are the key takeaways from today's product roadmap meeting...",
        date: new Date(Date.now() - 7200000),
        hasAttachment: false,
        isStarred: false,
        labels: ["Meeting", "Product"],
        score: 0.82,
        highlights: ["meeting", "product", "roadmap"],
        sentiment: "positive",
        priority: "normal",
        category: "Work"
      },
      {
        id: "3",
        subject: "Customer Feedback Analysis Report",
        sender: "analytics@company.com",
        preview: "Monthly analysis of customer feedback showing 15% improvement in satisfaction...",
        date: new Date(Date.now() - 86400000),
        hasAttachment: true,
        isStarred: false,
        labels: ["Analytics", "Customer"],
        score: 0.78,
        highlights: ["customer", "feedback", "analysis"],
        sentiment: "positive",
        priority: "normal",
        category: "Analytics"
      }
    ]
    
    // Apply filters
    let filteredResults = mockResults
    filters.forEach(filter => {
      switch (filter.type) {
        case "attachment":
          filteredResults = filteredResults.filter(r => r.hasAttachment === filter.value)
          break
        case "priority":
          filteredResults = filteredResults.filter(r => r.priority === filter.value)
          break
        case "sentiment":
          filteredResults = filteredResults.filter(r => r.sentiment === filter.value)
          break
      }
    })
    
    setResults(filteredResults)
    
    // Generate insights
    const insights: SearchInsight[] = []
    
    if (filteredResults.length > 0) {
      insights.push({
        type: "pattern",
        message: `Found ${filteredResults.length} emails matching your search`
      })
      
      const urgentCount = filteredResults.filter(r => r.priority === "urgent").length
      if (urgentCount > 0) {
        insights.push({
          type: "suggestion",
          message: `${urgentCount} urgent emails need attention`,
          action: () => setFilters([...filters, { 
            id: Date.now().toString(), 
            type: "priority", 
            value: "urgent", 
            operator: "equals" 
          }])
        })
      }
    }
    
    setSearchInsights(insights)
    
    // Update search history
    if (query && !searchHistory.includes(query)) {
      setSearchHistory(prev => [query, ...prev].slice(0, 10))
    }
    
    setIsSearching(false)
  }, [query, filters, naturalLanguageMode, parseNaturalLanguage, searchHistory])
  
  // Auto-complete suggestions
  useEffect(() => {
    if (query.length > 2) {
      const suggestions = [
        `${query} from team`,
        `${query} with attachments`,
        `${query} last week`,
        `urgent ${query}`,
        `${query} unread`
      ]
      setAutoComplete(suggestions)
    } else {
      setAutoComplete([])
    }
  }, [query])
  
  // Debounced search
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }
    
    if (query) {
      searchDebounceRef.current = setTimeout(() => {
        performSearch()
      }, 500)
    }
    
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
    }
  }, [query, performSearch])
  
  // Save search
  const saveSearch = useCallback(() => {
    if (!query) return
    
    const name = prompt("Name this search:")
    if (name) {
      const newSearch: SavedSearch = {
        id: Date.now().toString(),
        name,
        query,
        filters,
        lastUsed: new Date(),
        useCount: 0
      }
      
      setSavedSearches(prev => [newSearch, ...prev])
    }
  }, [query, filters])
  
  // Load saved search
  const loadSavedSearch = useCallback((search: SavedSearch) => {
    setQuery(search.query)
    setFilters(search.filters)
    
    // Update usage stats
    setSavedSearches(prev => prev.map(s => 
      s.id === search.id 
        ? { ...s, lastUsed: new Date(), useCount: s.useCount + 1 }
        : s
    ))
  }, [])
  
  // Bulk actions
  const performBulkAction = useCallback((action: "archive" | "delete" | "star" | "label") => {
    console.log(`Performing ${action} on ${selectedResultIds.size} emails`)
    // In production, implement actual bulk operations
  }, [selectedResultIds])
  
  return (
    <Card className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-600" />
            Smart Email Search
          </h2>
          
          <div className="flex items-center gap-2">
            <Button
              variant={naturalLanguageMode ? "default" : "outline"}
              size="sm"
              onClick={() => setNaturalLanguageMode(!naturalLanguageMode)}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              {naturalLanguageMode ? "Natural Language" : "Advanced Mode"}
            </Button>
            
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="list">List View</option>
              <option value="grid">Grid View</option>
              <option value="timeline">Timeline</option>
            </select>
          </div>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={naturalLanguageMode 
                  ? "Try: 'Urgent emails from Alice last week with attachments'" 
                  : "Search emails..."}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            
            <Button onClick={saveSearch} variant="outline">
              Save Search
            </Button>
          </div>
          
          {/* Auto-complete suggestions */}
          {autoComplete.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
              {autoComplete.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  <Search className="inline w-3 h-3 mr-2 text-gray-400" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Active Filters */}
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.map((filter) => (
              <Badge key={filter.id} variant="outline" className="px-3 py-1">
                {filter.type}: {filter.value}
                <button
                  onClick={() => setFilters(filters.filter(f => f.id !== filter.id))}
                  className="ml-2 text-xs hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            ))}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setFilters([])}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Saved Searches */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Saved Searches
            </h3>
            <div className="space-y-2">
              {savedSearches.map((search) => (
                <button
                  key={search.id}
                  onClick={() => loadSavedSearch(search)}
                  className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm"
                >
                  <div className="font-medium">{search.name}</div>
                  <div className="text-xs text-gray-500">
                    Used {search.useCount} times
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Quick Filters */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Quick Filters
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm flex items-center gap-2">
                <Paperclip className="w-3 h-3" />
                Has Attachments
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm flex items-center gap-2">
                <Star className="w-3 h-3" />
                Starred
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Unread
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Today
              </button>
            </div>
          </div>
          
          {/* Search Insights */}
          {searchInsights.length > 0 && (
            <div className="border rounded-lg p-4 bg-purple-50">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-600" />
                Insights
              </h3>
              <div className="space-y-2">
                {searchInsights.map((insight, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="text-purple-900">{insight.message}</p>
                    {insight.action && (
                      <button
                        onClick={insight.action}
                        className="text-xs text-purple-600 hover:underline mt-1"
                      >
                        Apply suggestion →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Results */}
        <div className="lg:col-span-3">
          {/* Bulk Actions */}
          {selectedResultIds.size > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
              <span className="text-sm">
                {selectedResultIds.size} emails selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => performBulkAction("archive")}>
                  <Archive className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => performBulkAction("delete")}>
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => performBulkAction("star")}>
                  <Star className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => performBulkAction("label")}>
                  <Tag className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Search Results */}
          {results.length === 0 && query && !isSearching ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No results found for "{query}"</p>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  className={`p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer ${
                    selectedResultIds.has(result.id) ? "bg-blue-50 border-blue-300" : ""
                  }`}
                  onClick={() => {
                    const newSelected = new Set(selectedResultIds)
                    if (newSelected.has(result.id)) {
                      newSelected.delete(result.id)
                    } else {
                      newSelected.add(result.id)
                    }
                    setSelectedResultIds(newSelected)
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="checkbox"
                          checked={selectedResultIds.has(result.id)}
                          onChange={() => {}}
                          className="mr-2"
                        />
                        <h4 className="font-semibold">
                          {result.subject}
                        </h4>
                        {result.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        {result.hasAttachment && <Paperclip className="w-4 h-4 text-gray-400" />}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">{result.sender}</span>
                        <span className="mx-2">·</span>
                        <span>{new Date(result.date).toLocaleDateString()}</span>
                      </div>
                      
                      <p className="text-sm text-gray-700">
                        {result.highlights.length > 0 ? (
                          <span dangerouslySetInnerHTML={{
                            __html: result.preview.replace(
                              new RegExp(`(${result.highlights.join("|")})`, "gi"),
                              "<mark>$1</mark>"
                            )
                          }} />
                        ) : (
                          result.preview
                        )}
                      </p>
                    </div>
                    
                    <div className="ml-4">
                      <div className="flex flex-col gap-1">
                        {result.labels.map((label) => (
                          <Badge key={label} variant="outline" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                        {result.priority === "urgent" && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      
                      {/* AI Score */}
                      <div className="mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Brain className="w-3 h-3" />
                          <span>Match: {Math.round(result.score * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Search History */}
          {!query && searchHistory.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-gray-700">Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((historyItem, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(historyItem)}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                  >
                    <Clock className="inline w-3 h-3 mr-1" />
                    {historyItem}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}