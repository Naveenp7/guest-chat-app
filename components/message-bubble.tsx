"use client"

import type { Message } from "@/lib/firebase"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Code, User, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface MessageBubbleProps {
  message: Message
  isOwnMessage: boolean
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)

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
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-primary" />
        </div>
      </div>

      <div
        className={cn(
          "flex flex-col",
          message.type === "code" ? "max-w-2xl lg:max-w-4xl" : "max-w-xs lg:max-w-md",
          isOwnMessage ? "items-end" : "items-start",
        )}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-muted-foreground">{message.username}</span>
          <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
        </div>

        <Card
          className={cn(
            "relative",
            message.type === "code" ? "p-0 overflow-hidden" : "p-3",
            isOwnMessage && message.type !== "code" ? "bg-primary text-primary-foreground" : "bg-card",
          )}
        >
          {message.type === "code" ? (
            <div>
              {/* Code header */}
              <div className="flex items-center justify-between p-3 bg-muted/50 border-b">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-primary" />
                  <Badge variant="secondary" className="text-xs">
                    {getLanguageLabel(message.codeLanguage || "plaintext")}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 w-8 p-0">
                  {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>

              {/* Code content */}
              <div className="p-4">
                <pre className="text-sm overflow-x-auto">
                  <code className="font-mono whitespace-pre-wrap break-words">{message.text}</code>
                </pre>
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap break-words">{message.text}</div>
          )}
        </Card>
      </div>
    </div>
  )
}
