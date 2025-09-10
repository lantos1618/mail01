"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SetupStatus {
  configured_providers: string[]
  oauth2_setup_url: string
  instructions: {
    current_setup: string
    oauth2: string
    sendgrid: string
    gmail_app_password: string
    fallback: string
  }
}

export function EmailSetupGuide() {
  const [status, setStatus] = useState<SetupStatus | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchStatus()
  }, [])
  
  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/auth/setup")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("Failed to fetch setup status:", error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleOAuth2Setup = () => {
    window.location.href = "/api/auth/setup?action=oauth2"
  }
  
  if (loading) {
    return <div className="p-4">Loading setup status...</div>
  }
  
  if (!status) {
    return <div className="p-4">Failed to load setup status</div>
  }
  
  const providerBadges = {
    sendgrid: { label: "SendGrid", variant: "default" as const },
    gmail: { label: "Gmail", variant: "secondary" as const },
    local: { label: "Local", variant: "outline" as const }
  }
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Email Provider Setup</CardTitle>
        <CardDescription>
          Configure email providers for Mail-01
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Current Status</h3>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active Providers:</span>
            {status.configured_providers.length > 0 ? (
              status.configured_providers.map(provider => {
                const badge = providerBadges[provider as keyof typeof providerBadges]
                return badge ? (
                  <Badge key={provider} variant={badge.variant}>
                    {badge.label}
                  </Badge>
                ) : (
                  <Badge key={provider} variant="outline">
                    {provider}
                  </Badge>
                )
              })
            ) : (
              <Badge variant="destructive">None Configured</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {status.instructions.current_setup}
          </p>
        </div>
        
        {/* Setup Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Setup Options</h3>
          
          {/* SendGrid */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">SendGrid (Recommended)</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Professional email delivery service with high reliability
                </p>
                <code className="text-xs bg-muted p-1 rounded mt-2 block">
                  export SENDGRID_API_KEY=your-api-key
                </code>
              </div>
              {status.configured_providers.includes("sendgrid") && (
                <Badge variant="default">Active</Badge>
              )}
            </div>
          </div>
          
          {/* Gmail OAuth2 */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium">Gmail OAuth2</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Secure authentication without storing passwords
                </p>
                <Button 
                  onClick={handleOAuth2Setup}
                  size="sm"
                  className="mt-2"
                  variant={status.configured_providers.includes("gmail") ? "secondary" : "default"}
                >
                  {status.configured_providers.includes("gmail") ? "Reconfigure" : "Set Up"} Gmail OAuth2
                </Button>
              </div>
              {status.configured_providers.includes("gmail") && (
                <Badge variant="secondary">Active</Badge>
              )}
            </div>
          </div>
          
          {/* Gmail App Password */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">Gmail App Password</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Quick setup with app-specific password
                </p>
                <code className="text-xs bg-muted p-1 rounded mt-2 block">
                  export GMAIL_USER=your-email@gmail.com
                  <br />
                  export GMAIL_APP_PASSWORD=your-app-password
                </code>
              </div>
              {status.configured_providers.includes("gmail") && (
                <Badge variant="secondary">Active</Badge>
              )}
            </div>
          </div>
          
          {/* Local Storage */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">Local Storage (Fallback)</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Saves emails locally when no provider is configured
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Always available as final fallback
                </p>
              </div>
              <Badge variant="outline">Always Active</Badge>
            </div>
          </div>
        </div>
        
        {/* Help Text */}
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm">
            <strong>Note:</strong> Mail-01 uses a fallback chain. If the primary provider fails,
            it automatically tries the next available provider. Emails are never lost.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}