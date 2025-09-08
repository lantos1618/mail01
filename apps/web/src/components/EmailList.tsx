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
}

export default function EmailList({ onSelectEmail }: EmailListProps) {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedFolder, setSelectedFolder] = useState("inbox")

  useEffect(() => {
    // Mock data for now - will be replaced with real API calls
    setEmails([
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
    ])
  }, [])

  const folders = [
    { id: "inbox", label: "Inbox", icon: Mail, count: 2 },
    { id: "starred", label: "Starred", icon: Star, count: 1 },
    { id: "sent", label: "Sent", icon: Send, count: 0 },
    { id: "archive", label: "Archive", icon: Archive, count: 0 },
    { id: "trash", label: "Trash", icon: Trash2, count: 0 },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Folders */}
      <div className="p-4 space-y-1">
        {folders.map((folder) => {
          const Icon = folder.icon
          return (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                selectedFolder === folder.id
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Icon className={`w-4 h-4 ${folder.color || ''}`} />
              <span className="flex-1 text-left text-sm font-medium">{folder.label}</span>
              {folder.count > 0 && (
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  {folder.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="border-t" />

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
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