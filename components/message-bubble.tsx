"use client"

import type { Message } from "@/lib/firebase"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Code, User, Copy, Check, Download, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { getDownloadUrl } from "@/lib/cloudinary"
import Image from "next/image"

interface MessageBubbleProps {
  message: Message
  isOwnMessage: boolean
  onAskAI?: (code: string, language: string) => void
}

export function MessageBubble({ message, isOwnMessage, onAskAI }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const isMobile = useIsMobile()

  const formatTime = (timestamp: any) => {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy code:", error)
    }
  }

  const getLanguageLabel = (lang: string) => {
    const languageMap: Record<string, string> = {
      javascript: "JavaScript",
      typescript: "TypeScript",
      python: "Python",
      java: "Java",
      cpp: "C++",
      html: "HTML",
      css: "CSS",
      json: "JSON",
      sql: "SQL",
      bash: "Bash",
      plaintext: "Plain Text",
    }
    return languageMap[lang] || lang
  }

  return (
    <div className={cn("flex gap-3 mb-4", isOwnMessage ? "flex-row-reverse" : "flex-row")}>
      <div className="flex-shrink-0">
        <div className={cn("bg-primary/10 rounded-full flex items-center justify-center", isMobile ? "w-6 h-6" : "w-8 h-8")}>
          <User className={cn("text-primary", isMobile ? "h-3 w-3" : "h-4 w-4")} />
        </div>
      </div>

      <div
        className={cn(
          "flex flex-col",
          message.type === "code" 
            ? (isMobile ? "max-w-[85%]" : "max-w-2xl lg:max-w-4xl") 
            : (isMobile ? "max-w-[80%]" : "max-w-xs lg:max-w-md"),
          isOwnMessage ? "items-end" : "items-start",
        )}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("font-medium text-muted-foreground", isMobile ? "text-xs" : "text-xs")}>
            {message.username}
          </span>
          <span className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-xs")}>
            {formatTime(message.timestamp)}
          </span>
        </div>

        <Card
          className={cn(
            "relative",
            message.type === "code" ? "p-0 overflow-hidden" : (isMobile ? "p-2.5" : "p-3"),
            isOwnMessage && message.type !== "code" ? "bg-primary text-primary-foreground" : "bg-card",
          )}
        >
          {message.type === "code" ? (
            <div>
              {/* Code header */}
              <div className={cn("flex items-center justify-between bg-muted/50 border-b", isMobile ? "p-2.5" : "p-3")}>
                <div className="flex items-center gap-2">
                  <Code className={cn("text-primary", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                  <Badge variant="secondary" className={cn(isMobile ? "text-xs px-1.5 py-0.5" : "text-xs")}>
                    {getLanguageLabel(message.codeLanguage || "plaintext")}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  {onAskAI && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAskAI(message.text, message.codeLanguage || "plaintext")}
                      className={cn("text-primary hover:text-primary hover:bg-primary/10", isMobile ? "h-6 w-6 p-0" : "h-8 w-8 p-0")}
                      title="Ask AI about this code"
                    >
                      <Sparkles className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className={cn(isMobile ? "h-6 w-6 p-0" : "h-8 w-8 p-0")}
                  >
                    {copied ? (
                      <Check className={cn("text-green-600", isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                    ) : (
                      <Copy className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                    )}
                  </Button>
                </div>
              </div>

              {/* Code content */}
              <div className={cn(isMobile ? "p-2.5" : "p-4")}>
                <pre className={cn("overflow-x-auto", isMobile ? "text-xs" : "text-sm")}>
                  <code className="font-mono whitespace-pre-wrap break-words">{message.text}</code>
                </pre>
              </div>
            </div>
          ) : message.type === "image" ? (
            <div className="relative">
              <div className="relative rounded-lg overflow-hidden" style={{ maxWidth: '300px', maxHeight: '400px' }}>
                <Image
                  src={message.imageUrl || ""}
                  alt="Shared image"
                  width={300}
                  height={300}
                  className="object-contain max-w-full h-auto"
                  style={{ minHeight: '200px', backgroundColor: '#f0f0f0' }}
                />
              </div>
              {message.imageId && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-2 right-2 opacity-90 hover:opacity-100"
                  onClick={() => {
                    const downloadUrl = getDownloadUrl(message.imageId!);
                    window.open(downloadUrl, "_blank");
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              )}
              <p className="mt-2 text-sm text-muted-foreground">{message.text}</p>
            </div>
          ) : (
            <div 
              className={cn(
                "whitespace-pre-wrap break-words", 
                isMobile ? "text-sm leading-relaxed" : ""
              )}
            >
              {message.text}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
