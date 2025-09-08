"use client"

import { useState, useEffect } from "react"
import { Mail, Star, Archive, Trash2, Send } from "lucide-react"

interface Email {
  id: string
  from: string
  subject: string
  preview: string
  date: string
  unread: boolean
  starred: boolean
}

interface EmailListProps {
  onSelectEmail: (id: string) => void
  folder?: 'received' | 'sent' | 'drafts' | 'archived'
}

export default function EmailList({ onSelectEmail, folder = 'received' }: EmailListProps) {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch emails based on current folder
    const fetchEmails = async () => {
      setLoading(true)
      try {
        // For now, use mock data - will be connected to real API
        const mockEmails: Email[] = folder === 'sent' ? [
          {
            id: "s1",
            from: "Me",
            subject: "Project Update",
            preview: "Hi team, here's the latest update on our project progress...",
            date: "1 hour ago",
            unread: false,
            starred: false,
          },
        ] : folder === 'drafts' ? [
          {
            id: "d1",
            from: "Draft",
            subject: "Untitled Draft",
            preview: "This is a draft email that hasn't been sent yet...",
            date: "Yesterday",
            unread: false,
            starred: false,
          },
        ] : [
          {
            id: "1",
            from: "GitHub",
            subject: "Your pull request has been merged",
            preview: "Congratulations! Your pull request #42 has been successfully merged into main...",
            date: "2 hours ago",
            unread: true,
            starred: false,
          },
          {
            id: "2",
            from: "Team Lead",
            subject: "Sprint Planning Meeting Tomorrow",
            preview: "Hi team, just a reminder that we have our sprint planning meeting tomorrow at 10 AM...",
            date: "5 hours ago",
            unread: true,
            starred: true,
          },
          {
            id: "3",
            from: "AWS",
            subject: "Your monthly bill is ready",
            preview: "Your AWS bill for December 2024 is now available. Total amount: $127.43...",
            date: "1 day ago",
            unread: false,
            starred: false,
          },
        ]
        
        setEmails(mockEmails)
      } catch (error) {
        console.error('Failed to fetch emails:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchEmails()
  }, [folder])

  return (
    <div className="h-full flex flex-col">

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-center text-gray-500">
            Loading emails...
          </div>
        )}
        {!loading && emails.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No emails in {folder}
          </div>
        )}
        {emails.map((email) => (
          <button
            key={email.id}
            onClick={() => onSelectEmail(email.id)}
            className="w-full p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b text-left"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${email.unread ? "font-semibold" : ""}`}>
                    {email.from}
                  </span>
                  {email.starred && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                </div>
                <p className={`text-sm mt-1 ${email.unread ? "font-medium" : ""}`}>
                  {email.subject}
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{email.preview}</p>
              </div>
              <span className="text-xs text-gray-400">{email.date}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}