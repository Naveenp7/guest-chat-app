"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Send, Loader2, Bot, User, X, Minimize2, Maximize2, Image as ImageIcon } from "lucide-react"
import { uploadImage } from "@/lib/cloudinary"
import { type AIMessage, getAIResponse, analyzeCode } from "@/lib/ai"
import type { Message } from "@/lib/firebase"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface AIAssistantPanelProps {
  isOpen: boolean
  onToggle: () => void
  chatMessages: Message[]
  currentRoom: string
  isMinimized: boolean
  onMinimizeToggle: () => void
  onSendMessage: (text: string, type?: "text" | "code" | "image", imageUrl?: string, imageId?: string) => void
  isSplitScreen?: boolean
}

export function AIAssistantPanel({
  isOpen,
  onToggle,
  chatMessages,
  currentRoom,
  isMinimized,
  onMinimizeToggle,
  onSendMessage,
  isSplitScreen = false,
}: AIAssistantPanelProps) {
  const isMobile = useIsMobile()
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hi! I'm your AI coding assistant. I can help you with programming questions, code analysis, debugging, and explanations. Feel free to ask me anything about the code being shared in ${currentRoom}!`,
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [aiMessages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    }

    setAiMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await getAIResponse(inputMessage.trim(), chatMessages, currentRoom)

      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setAiMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      let errorContent = "Sorry, I encountered an error. Please try again."

      if (error instanceof Error) {
        if (error.message.includes("Google Generative AI API key is not configured")) {
          errorContent = "⚠️ AI service is not configured. Please set up your Google API key in the .env.local file. You can get one from https://ai.google.dev/"
        } else if (error.message.includes("replace 'your_google_api_key_here'")) {
          errorContent = "⚠️ Please replace the placeholder API key with your actual Google API key in .env.local file."
        } else if (error.message.includes("configuration error")) {
          errorContent = "⚠️ There's an issue with the AI service configuration. Please check your Google API key setup."
        }
      }

      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorContent,
        timestamp: new Date(),
      }
      setAiMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyzeLatestCode = async () => {
    const latestCodeMessage = [...chatMessages].reverse().find((msg) => msg.type === "code")

    if (!latestCodeMessage) {
      const noCodeMessage: AIMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "No code found in recent messages to analyze.",
        timestamp: new Date(),
      }
      setAiMessages((prev) => [...prev, noCodeMessage])
      return
    }

    setIsLoading(true)
    try {
      const analysis = await analyzeCode(latestCodeMessage.text, latestCodeMessage.codeLanguage || "unknown")

      const analysisMessage: AIMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: `**Code Analysis:**\n\n${analysis}`,
        timestamp: new Date(),
      }

      setAiMessages((prev) => [...prev, analysisMessage])
    } catch (error) {
      let errorContent = "Failed to analyze the code. Please try again."

      if (error instanceof Error) {
        if (error.message.includes("Google Generative AI API key is not configured")) {
          errorContent = "⚠��� AI service is not configured. Please set up your Google API key in the .env.local file. You can get one from https://ai.google.dev/"
        } else if (error.message.includes("replace 'your_google_api_key_here'")) {
          errorContent = "⚠️ Please replace the placeholder API key with your actual Google API key in .env.local file."
        } else if (error.message.includes("configuration error")) {
          errorContent = "⚠️ There's an issue with the AI service configuration. Please check your Google API key setup."
        }
      }

      const errorMessage: AIMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: errorContent,
        timestamp: new Date(),
      }
      setAiMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen && !isSplitScreen) return null

  // Desktop Split Screen Mode
  if (isSplitScreen && !isMobile) {
    return (
      <div className="w-full h-full flex flex-col bg-card border-l">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-sm block">AI Assistant</span>
              <span className="text-xs text-muted-foreground truncate block">{currentRoom}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle} className="h-7 w-7 p-0 flex-shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 min-w-0">
          <div className="space-y-2.5 p-3">
            {aiMessages.length === 1 && !isLoading ? (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-3 rounded-lg text-xs leading-relaxed text-muted-foreground break-words overflow-hidden flex-1 min-w-0">
                  {aiMessages[0].content}
                </div>
              </div>
            ) : (
              aiMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex gap-2 min-w-0 animate-in fade-in duration-300", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  {message.role === "assistant" && (
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs break-words overflow-hidden",
                      message.role === "user"
                        ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm"
                        : "bg-muted/60 text-foreground",
                    )}
                    style={{ maxWidth: "calc(100% - 2rem)" }}
                  >
                    <div className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</div>
                  </div>

                  {message.role === "user" && (
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="h-3 w-3 text-primary" />
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
                <div className="bg-muted/60 px-3 py-2 rounded-lg flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="px-3 py-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyzeLatestCode}
            disabled={isLoading}
            className="w-full text-xs h-8 hover:bg-primary/5"
          >
            <Sparkles className="h-3 w-3 mr-1.5" />
            Analyze Latest Code
          </Button>
        </div>

        {/* Input */}
        <div className="p-3 border-t bg-muted/30">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask AI..."
              className="flex-1 text-xs h-8 bg-background"
              disabled={isLoading}
            />
            <Button type="submit" size="sm" disabled={!inputMessage.trim() || isLoading} className="px-2.5 h-8">
              <Send className="h-3 w-3" />
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // Mobile: Full screen overlay
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-base">AI Assistant</h1>
              <Badge variant="secondary" className="text-xs mt-1">
                {currentRoom.length > 15 ? `${currentRoom.slice(0, 15)}...` : currentRoom}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle} className="h-8 w-8 p-0 flex-shrink-0 -mr-2">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 min-w-0">
          <div className="space-y-3 p-4">
            {aiMessages.length === 1 && !isLoading ? (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-4 rounded-xl text-sm leading-relaxed text-muted-foreground break-words overflow-hidden flex-1 min-w-0">
                  {aiMessages[0].content}
                </div>
              </div>
            ) : (
              aiMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex gap-3 min-w-0 animate-in fade-in duration-300", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  {message.role === "assistant" && (
                    <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm break-words overflow-hidden",
                      message.role === "user"
                        ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm"
                        : "bg-muted/60 text-foreground",
                    )}
                    style={{ maxWidth: "85%" }}
                  >
                    <div className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</div>
                  </div>

                  {message.role === "user" && (
                    <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="bg-muted/60 px-4 py-2.5 rounded-2xl flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="px-4 py-3 border-t bg-muted/30">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyzeLatestCode}
            disabled={isLoading}
            className="w-full text-sm h-10 hover:bg-primary/5 font-medium"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Analyze Latest Code
          </Button>
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t bg-card">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              id="image-upload-mobile"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setIsLoading(true);
                  try {
                    const result = await uploadImage(file);
                    onSendMessage("Shared an image", "image", result.secure_url, result.public_id);
                  } catch (error) {
                    console.error("Failed to upload image:", error);
                  } finally {
                    setIsLoading(false);
                  }
                }
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isLoading}
              onClick={() => document.getElementById("image-upload-mobile")?.click()}
              className="px-2 h-10"
              title="Share Image"
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask AI..."
              className="flex-1 text-sm h-10 bg-muted/50"
              disabled={isLoading}
            />
            <Button type="submit" disabled={!inputMessage.trim() || isLoading} className="px-3 h-10 font-medium">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return null
}
