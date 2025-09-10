import { NextRequest, NextResponse } from "next/server"
import { gmail } from "@/lib/email/gmail"
import { z } from "zod"

const SendEmailSchema = z.object({
  to: z.string().email(),
  from: z.string().email().default('agent@lambda.run'),
  subject: z.string(),
  content: z.string().optional(),
  text: z.string().optional(),
  html: z.string().optional(),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request
    const validated = SendEmailSchema.parse(body)
    
    // If content is provided but not text, use content as text
    if (validated.content && !validated.text) {
      validated.text = validated.content
    }
    
    // Send email using Gmail
    const result = await gmail.sendEmail(validated)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully via Gmail',
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to send email',
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
    // Return basic stats for Gmail (no SendGrid statistics available)
    return NextResponse.json({
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      message: "Email statistics not available for Gmail integration"
    })
  } catch (error) {
    return NextResponse.json({
      error: "Failed to get statistics",
    }, { status: 500 })
  }
}