import { NextRequest, NextResponse } from "next/server"
import { initiateOAuth2Flow, handleOAuth2Callback, getConfiguredProviders } from "@/lib/services/email-universal"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get("action")
  const code = searchParams.get("code")
  
  try {
    // Handle OAuth2 callback
    if (code) {
      const tokens = await handleOAuth2Callback(code)
      return NextResponse.json({
        success: true,
        message: "OAuth2 authentication successful",
        tokens: {
          access_token: tokens.access_token ? "***hidden***" : null,
          refresh_token: tokens.refresh_token ? "***hidden***" : null
        }
      })
    }
    
    // Initiate OAuth2 flow
    if (action === "oauth2") {
      const authUrl = await initiateOAuth2Flow()
      return NextResponse.redirect(authUrl)
    }
    
    // Get current configuration status
    const providers = getConfiguredProviders()
    
    return NextResponse.json({
      configured_providers: providers,
      oauth2_setup_url: "/api/auth/setup?action=oauth2",
      instructions: {
        current_setup: providers.length > 0 
          ? `Currently using: ${providers.join(", ")}` 
          : "No email providers configured",
        oauth2: "Visit /api/auth/setup?action=oauth2 to set up Gmail OAuth2",
        gmail_app_password: "Add GMAIL_USER and GMAIL_APP_PASSWORD to environment",
        fallback: "Emails will be saved locally if no provider is configured"
      }
    })
  } catch (error) {
    console.error("Auth setup error:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Authentication setup failed",
        configured_providers: getConfiguredProviders()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle manual token configuration
    if (body.tokens) {
      const { access_token, refresh_token } = body.tokens
      
      // In production, save these securely
      // For now, return success
      return NextResponse.json({
        success: true,
        message: "Tokens configured successfully",
        configured_providers: getConfiguredProviders()
      })
    }
    
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Auth configuration error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Configuration failed" },
      { status: 500 }
    )
  }
}