"use client"

import { Reply, ReplyAll, Forward, Archive, Trash2, Star, MoreVertical } from "lucide-react"

interface EmailViewProps {
  emailId: string | null
}

export default function EmailView({ emailId }: EmailViewProps) {
  if (!emailId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <Mail className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Select an email to view</p>
        </div>
      </div>
    )
  }

  // Mock email data - will be replaced with real API call
  const email = {
    from: "GitHub <noreply@github.com>",
    to: "you@example.com",
    subject: "Your pull request has been merged",
    date: "Dec 20, 2024 at 2:30 PM",
    content: `
      <p>Congratulations! Your pull request #42 has been successfully merged into main.</p>
      <p>The following changes were included:</p>
      <ul>
        <li>Added new authentication system</li>
        <li>Improved error handling</li>
        <li>Updated documentation</li>
      </ul>
      <p>Thanks for your contribution!</p>
      <p>Best regards,<br>The GitHub Team</p>
    `,
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950">
      {/* Email Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">{email.subject}</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <Archive className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <Star className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="font-medium">{email.from}</p>
            <p className="text-gray-500">to {email.to}</p>
          </div>
          <p className="text-gray-500">{email.date}</p>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div 
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: email.content }}
        />
      </div>

      {/* Action Buttons */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Reply className="w-4 h-4" />
            Reply
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            <ReplyAll className="w-4 h-4" />
            Reply All
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            <Forward className="w-4 h-4" />
            Forward
          </button>
        </div>
      </div>
    </div>
  )
}

// Import Mail icon that was missing
import { Mail } from "lucide-react"