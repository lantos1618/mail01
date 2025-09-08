"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Mic, MicOff, Send, Pause, Play, RotateCcw, 
  Sparkles, Volume2, Loader2, CheckCircle,
  AlertCircle, FileAudio, Brain, Zap
} from "lucide-react"

interface TranscriptionSegment {
  text: string
  confidence: number
  timestamp: number
  isFinal: boolean
}

interface VoiceCommand {
  command: string
  action: string
  params?: Record<string, any>
}

export default function VoiceEmailComposer() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [transcription, setTranscription] = useState("")
  const [segments, setSegments] = useState<TranscriptionSegment[]>([])
  const [audioLevel, setAudioLevel] = useState(0)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [aiEnhancedMode, setAiEnhancedMode] = useState(true)
  const [detectedCommands, setDetectedCommands] = useState<VoiceCommand[]>([])
  const [processingStatus, setProcessingStatus] = useState<
    "idle" | "listening" | "processing" | "enhancing" | "complete"
  >("idle")
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"
      
      recognition.onresult = (event: any) => {
        const results = event.results
        const currentIndex = results.length - 1
        const transcript = results[currentIndex][0].transcript
        const isFinal = results[currentIndex].isFinal
        
        if (isFinal) {
          const segment: TranscriptionSegment = {
            text: transcript,
            confidence: results[currentIndex][0].confidence,
            timestamp: Date.now(),
            isFinal: true,
          }
          
          setSegments(prev => [...prev, segment])
          setTranscription(prev => prev + " " + transcript)
          
          // Check for voice commands
          detectVoiceCommands(transcript)
          
          // AI enhancement in real-time
          if (aiEnhancedMode) {
            enhanceTranscription(transcript)
          }
        } else {
          // Show interim results
          setProcessingStatus("listening")
        }
      }
      
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setProcessingStatus("idle")
      }
      
      recognitionRef.current = recognition
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [aiEnhancedMode])
  
  // Voice command detection
  const detectVoiceCommands = (text: string) => {
    const commands: VoiceCommand[] = []
    const lowerText = text.toLowerCase()
    
    // Email commands
    if (lowerText.includes("send to")) {
      const recipient = text.split("send to")[1]?.trim()
      commands.push({
        command: "Send to recipient",
        action: "setRecipient",
        params: { recipient },
      })
    }
    
    if (lowerText.includes("subject")) {
      const subject = text.split("subject")[1]?.trim()
      commands.push({
        command: "Set subject",
        action: "setSubject",
        params: { subject },
      })
    }
    
    if (lowerText.includes("new paragraph")) {
      commands.push({
        command: "New paragraph",
        action: "addParagraph",
      })
    }
    
    if (lowerText.includes("add attachment")) {
      commands.push({
        command: "Add attachment",
        action: "openAttachmentDialog",
      })
    }
    
    if (lowerText.includes("mark as urgent")) {
      commands.push({
        command: "Mark urgent",
        action: "setPriority",
        params: { priority: "urgent" },
      })
    }
    
    setDetectedCommands(prev => [...prev, ...commands])
  }
  
  // AI enhancement of transcription
  const enhanceTranscription = async (text: string) => {
    setProcessingStatus("enhancing")
    
    // Simulate AI processing
    setTimeout(() => {
      // Grammar correction
      let enhanced = text
        .replace(/\bi\b/g, "I")
        .replace(/\bdont\b/g, "don't")
        .replace(/\bcant\b/g, "can't")
        .replace(/\bwont\b/g, "won't")
      
      // Punctuation enhancement
      if (!enhanced.match(/[.!?]$/)) {
        enhanced += "."
      }
      
      // Update transcription with enhanced version
      setTranscription(prev => {
        const parts = prev.split(" ")
        parts[parts.length - 1] = enhanced
        return parts.join(" ")
      })
      
      setProcessingStatus("complete")
    }, 500)
  }
  
  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      // Setup audio context for visualization
      audioContextRef.current = new AudioContext()
      analyzerRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyzerRef.current)
      analyzerRef.current.fftSize = 256
      
      // Start recording
      mediaRecorderRef.current = new MediaRecorder(stream)
      const chunks: Blob[] = []
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        chunks.push(e.data)
      }
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" })
        // Process or send the audio blob
        processAudioBlob(blob)
      }
      
      mediaRecorderRef.current.start()
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }
      
      setIsRecording(true)
      setProcessingStatus("listening")
      
      // Start duration timer
      let duration = 0
      timerRef.current = setInterval(() => {
        duration += 100
        setRecordingDuration(duration)
        
        // Update audio level
        if (analyzerRef.current) {
          const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount)
          analyzerRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          setAudioLevel(average / 255)
        }
      }, 100)
      
    } catch (error) {
      console.error("Error starting recording:", error)
      alert("Microphone access denied. Please allow microphone access to use voice input.")
    }
  }, [])
  
  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    setIsRecording(false)
    setProcessingStatus("processing")
    
    // Final AI processing
    setTimeout(() => {
      setProcessingStatus("complete")
    }, 1500)
  }, [])
  
  // Pause/Resume recording
  const togglePause = useCallback(() => {
    if (!isRecording) return
    
    if (isPaused) {
      mediaRecorderRef.current?.resume()
      recognitionRef.current?.start()
      setIsPaused(false)
      setProcessingStatus("listening")
    } else {
      mediaRecorderRef.current?.pause()
      recognitionRef.current?.stop()
      setIsPaused(true)
      setProcessingStatus("idle")
    }
  }, [isRecording, isPaused])
  
  // Process audio blob
  const processAudioBlob = async (blob: Blob) => {
    // Here you would send to your transcription service
    console.log("Audio blob ready for processing:", blob.size, "bytes")
  }
  
  // Format duration
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }
  
  // Generate email from transcription
  const generateEmail = () => {
    const emailParts: string[] = []
    let currentPart = ""
    
    // Parse transcription for email structure
    const lines = transcription.split(". ")
    lines.forEach(line => {
      if (line.toLowerCase().includes("dear") || line.toLowerCase().includes("hi")) {
        emailParts.push(line)
      } else {
        currentPart += line + ". "
      }
    })
    
    if (currentPart) {
      emailParts.push(currentPart)
    }
    
    return emailParts.join("\n\n")
  }
  
  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileAudio className="w-8 h-8 text-purple-600" />
            Voice Email Composer
          </h2>
          <div className="flex items-center gap-2">
            <Badge variant={aiEnhancedMode ? "default" : "outline"}>
              <Brain className="w-3 h-3 mr-1" />
              AI Enhanced
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAiEnhancedMode(!aiEnhancedMode)}
            >
              {aiEnhancedMode ? "Disable" : "Enable"} AI
            </Button>
          </div>
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center gap-2 mb-4">
          {processingStatus === "listening" && (
            <>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">Listening...</span>
            </>
          )}
          {processingStatus === "processing" && (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-sm text-gray-600">Processing...</span>
            </>
          )}
          {processingStatus === "enhancing" && (
            <>
              <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
              <span className="text-sm text-gray-600">AI Enhancing...</span>
            </>
          )}
          {processingStatus === "complete" && (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">Ready</span>
            </>
          )}
        </div>
      </div>
      
      {/* Recording controls */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-4">
          <Button
            size="lg"
            variant={isRecording ? "destructive" : "default"}
            onClick={isRecording ? stopRecording : startRecording}
            className="rounded-full w-24 h-24 relative"
          >
            {isRecording ? (
              <MicOff className="w-10 h-10" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
          </Button>
          
          {/* Audio level indicator */}
          {isRecording && (
            <div 
              className="absolute inset-0 rounded-full border-4 border-blue-400 animate-pulse"
              style={{
                transform: `scale(${1 + audioLevel * 0.3})`,
                opacity: 0.5 + audioLevel * 0.5,
              }}
            />
          )}
        </div>
        
        {isRecording && (
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="outline"
              onClick={togglePause}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
            <span className="text-sm font-mono">{formatDuration(recordingDuration)}</span>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all"
                style={{ width: `${audioLevel * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Transcription display */}
      {transcription && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <FileAudio className="w-4 h-4" />
            Transcription
          </h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm leading-relaxed">{transcription}</p>
          </div>
          
          {/* Confidence scores */}
          {segments.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-500">Confidence:</span>
              <div className="flex gap-1">
                {segments.slice(-5).map((seg, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-1 rounded-full"
                    style={{
                      backgroundColor: seg.confidence > 0.8 
                        ? "#10b981" 
                        : seg.confidence > 0.6 
                        ? "#f59e0b" 
                        : "#ef4444",
                    }}
                    title={`${(seg.confidence * 100).toFixed(0)}%`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Detected commands */}
      {detectedCommands.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            Voice Commands Detected
          </h3>
          <div className="space-y-2">
            {detectedCommands.map((cmd, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <span className="text-sm">{cmd.command}</span>
                <Button size="sm" variant="ghost">
                  Apply
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Email preview */}
      {transcription && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Email Preview</h3>
          <div className="p-4 border rounded-lg bg-white">
            <div className="space-y-2 mb-4">
              <input
                type="text"
                placeholder="To..."
                className="w-full px-3 py-2 border rounded text-sm"
              />
              <input
                type="text"
                placeholder="Subject..."
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div className="whitespace-pre-wrap text-sm">
              {generateEmail()}
            </div>
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setTranscription("")
              setSegments([])
              setDetectedCommands([])
              setRecordingDuration(0)
            }}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button variant="outline">
            <Volume2 className="w-4 h-4 mr-1" />
            Play Back
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Sparkles className="w-4 h-4 mr-1" />
            AI Enhance
          </Button>
          <Button disabled={!transcription}>
            <Send className="w-4 h-4 mr-1" />
            Send Email
          </Button>
        </div>
      </div>
    </Card>
  )
}