import { EmailSetupGuide } from "@/components/EmailSetupGuide"

export default function SetupPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Mail-01 Setup</h1>
      <EmailSetupGuide />
      
      <div className="mt-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Quick Start Guide</h2>
        
        <div className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-2">Option 1: SendGrid (Recommended)</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Get a SendGrid API key from sendgrid.com</li>
              <li>Set environment variable: <code className="bg-background px-1">export SENDGRID_API_KEY=your-key</code></li>
              <li>Restart the application</li>
              <li>Emails will automatically send via SendGrid</li>
            </ol>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-2">Option 2: Gmail OAuth2</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Click "Set Up Gmail OAuth2" button above</li>
              <li>Sign in with your Google account</li>
              <li>Authorize Mail-01 to send emails</li>
              <li>You're done - tokens are saved automatically</li>
            </ol>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-2">Option 3: Development Mode</h3>
            <p className="text-sm">
              No configuration needed! Emails will be saved locally to <code className="bg-background px-1">agent/inbox/sent/</code>
            </p>
          </div>
        </div>
        
        <div className="mt-8 p-4 border border-blue-200 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <p className="text-sm">
            <strong>Pro Tip:</strong> Mail-01 automatically falls back through providers.
            If SendGrid fails, it tries Gmail. If Gmail fails, it saves locally.
            Your emails are never lost!
          </p>
        </div>
      </div>
    </div>
  )
}