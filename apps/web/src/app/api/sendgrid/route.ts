import { NextRequest, NextResponse } from "next/server"
import { sendGridService, SendEmailSchema } from "@/lib/email/sendgrid-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request
    const validated = SendEmailSchema.parse(body)
    
    // Send email
    const result = await sendGridService.sendEnhancedEmail({
      ...validated,
      enhance: body.enhance !== false, // Default to true
      tone: body.tone,
      style: body.style,
    })
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        enhancements: result.enhancements,
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 400 })
    }
  } catch (error) {
    console.error("Email sending error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const stats = await sendGridService.getStatistics()
    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json({
      error: "Failed to get statistics",
    }, { status: 500 })
  }
}