import { NextRequest, NextResponse } from "next/server"
import { handleOAuth2Callback } from "@/lib/services/email-universal"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  
  // Handle OAuth2 errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(error)}`, request.url)
    )
  }
  
  // Handle OAuth2 success
  if (code) {
    try {
      const tokens = await handleOAuth2Callback(code)
      
      // Redirect to success page
      return NextResponse.redirect(
        new URL("/?auth_success=true&provider=gmail_oauth2", request.url)
      )
    } catch (error) {
      console.error("OAuth2 callback error:", error)
      return NextResponse.redirect(
        new URL(`/?auth_error=${encodeURIComponent("OAuth2 authentication failed")}`, request.url)
      )
    }
  }
  
  // No code or error
  return NextResponse.redirect(
    new URL("/?auth_error=Invalid+callback", request.url)
  )
}