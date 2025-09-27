"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageBubble } from "@/components/message-bubble"
import { CodeEditorModal } from "@/components/code-editor-modal"
import { AIAssistantPanel } from "@/components/ai-assistant-panel"
import { Loader2, MessageSquare, Code, Sparkles, Send, Hash, CodeIcon, Bot, ArrowLeft, Menu, X, ImageIcon } from "lucide-react"
import { type Message, sendMessage, listenToMessages, isConfigured } from "@/lib/firebase"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { uploadImage } from "@/lib/cloudinary"

export default function ChatRoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const isMobile = useIsMobile()
  
  const { user, loading, signInAnonymously, isAuthenticated, username } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [aiMinimized, setAiMinimized] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Listen to messages for current room
  useEffect(() => {
    if (!isAuthenticated || !roomId) return

    const unsubscribe = listenToMessages(roomId, (roomMessages) => {
      setMessages(roomMessages)
    })

    return () => unsubscribe()
  }, [roomId, isAuthenticated])

  // Auto sign in anonymously
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      signInAnonymously()
    }
  }, [loading, isAuthenticated, signInAnonymously])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      const handleClickOutside = () => setSidebarOpen(false)
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isMobile, sidebarOpen])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || sending) return

    setSending(true)
    try {
      await sendMessage(roomId, newMessage.trim(), user.uid, username)
      setNewMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setSending(false)
    }
  }

  const handleSendCode = async (code: string, language: string) => {
    if (!user) return
    await sendMessage(roomId, code, user.uid, username, "code", language)
  }

  const handleBackToLanding = () => {
    router.push("/")
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <Card className="p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Firebase Not Configured</h2>
            <p className="text-muted-foreground mb-6">Please configure Firebase to use the chat functionality.</p>
            <Button onClick={handleBackToLanding}>Back to Home</Button>
          </Card>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Connecting to Chat</h2>
          <p className="text-muted-foreground">Setting up your anonymous session...</p>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold mb-2">Guest Chat Rooms</h1>
          <p className="text-muted-foreground mb-6">Join anonymous chat rooms for code sharing and collaboration</p>
          <Button onClick={signInAnonymously} className="w-full">
            <Sparkles className="h-4 w-4 mr-2" />
            Enter Chat
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen relative">
        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <div className={cn(
          "bg-sidebar border-r border-sidebar-border p-4 transition-transform duration-300 ease-in-out",
          isMobile ? "fixed inset-y-0 left-0 z-50 w-64 transform" : "w-64",
          isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"
        )}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-sidebar-primary" />
              <h1 className="font-bold text-lg text-sidebar-foreground">Chat Room</h1>
            </div>
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full justify-start mb-6"
            onClick={handleBackToLanding}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Rooms
          </Button>

          <div className="mt-6 pt-4 border-t border-sidebar-border">
            <Button
              variant={showAIAssistant ? "default" : "outline"}
              onClick={() => {
                setShowAIAssistant(!showAIAssistant)
                if (isMobile) setSidebarOpen(false)
              }}
              className="w-full justify-start"
            >
              <Bot className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
          </div>

          <div className="mt-8 p-3 bg-sidebar-accent/10 rounded-lg">
            <div className="text-xs text-sidebar-foreground/70 mb-1">Signed in as</div>
            <div className="text-sm font-medium text-sidebar-foreground">{username}</div>
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(true)}
                    className="h-8 w-8 p-0 mr-2"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                )}
                <Hash className="h-5 w-5 text-primary" />
                <div>
                  <h2 className={cn("font-semibold", isMobile ? "text-base" : "text-lg")}>
                    {isMobile && roomId.length > 15 ? `${roomId.slice(0, 15)}...` : roomId}
                  </h2>
                  <p className="text-sm text-muted-foreground">{messages.length} messages</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isMobile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAIAssistant(!showAIAssistant)}
                    disabled={sending}
                    className="flex items-center gap-2"
                  >
                    <Bot className="h-4 w-4" />
                    AI Help
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                    {isMobile ? "Online" : "Connected"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat messages area */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <Card className="p-6 text-center">
                <Sparkles className="h-8 w-8 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Welcome to the room!</h3>
                <p className="text-muted-foreground">Start the conversation by sending the first message.</p>
              </Card>
            ) : (
              <div className="space-y-1">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} isOwnMessage={message.userId === user?.uid} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message input area */}
          <div className="border-t border-border p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                type="text"
                placeholder={isMobile ? `Message...` : `Message ${roomId}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
                disabled={sending}
              />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="image-upload"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file && user) {
                    setSending(true);
                    try {
                      const result = await uploadImage(file);
                      await sendMessage(roomId, "Shared an image", user.uid, username, "image", undefined, result.secure_url, result.public_id);
                    } catch (error) {
                      console.error("Failed to upload image:", error);
                    } finally {
                      setSending(false);
                      e.target.value = ''; // Reset the input
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("image-upload")?.click()}
                disabled={sending}
                className="px-3 flex-shrink-0"
                title="Share Image"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCodeEditor(true)}
                disabled={sending}
                className="px-3 flex-shrink-0"
                title="Share Code"
              >
                <CodeIcon className="h-4 w-4" />
              </Button>
              <Button type="submit" disabled={!newMessage.trim() || sending} className="flex-shrink-0">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <CodeEditorModal open={showCodeEditor} onOpenChange={setShowCodeEditor} onSendCode={handleSendCode} />

      <AIAssistantPanel
        isOpen={showAIAssistant}
        onToggle={() => setShowAIAssistant(!showAIAssistant)}
        chatMessages={messages}
        currentRoom={roomId}
        isMinimized={aiMinimized}
        onMinimizeToggle={() => setAiMinimized(!aiMinimized)}
        onSendMessage={async (text, type = "text", imageUrl, imageId) => {
          if (!user) return;
          await sendMessage(roomId, text, user.uid, username, type, undefined, imageUrl, imageId);
        }}
      />
    </div>
  )
}