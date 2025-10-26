"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createRoom, listenToRecentRooms, type Room } from "@/lib/firebase"
import { Loader2, MessageSquare, Code, Sparkles, Plus, LogIn, Clock } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

export default function LandingPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const { user, loading, signInAnonymously, isAuthenticated, username } = useAuth()
  const [roomName, setRoomName] = useState("")
  const [roomDescription, setRoomDescription] = useState("")
  const [roomCategory, setRoomCategory] = useState("general") // Default category
  const [joinRoomId, setJoinRoomId] = useState("")
  const [recentRooms, setRecentRooms] = useState<Room[]>([])
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [activeTab, setActiveTab] = useState<"join" | "create">("join")
  
  // Auto sign in anonymously
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      signInAnonymously()
    }
  }, [loading, isAuthenticated, signInAnonymously])

  // Listen to recent rooms
  useEffect(() => {
    if (!isAuthenticated) return

    const unsubscribe = listenToRecentRooms((rooms) => {
      setRecentRooms(rooms)
    })

    return () => unsubscribe()
  }, [isAuthenticated])

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomName.trim() || !user || creatingRoom) return

    setCreatingRoom(true)
    try {
      const roomId = await createRoom(roomName.trim(), user.uid, username, roomDescription.trim(), roomCategory)
      if (roomId) {
        router.push(`/chat/${roomId}`)
      }
    } catch (error) {
      console.error("Failed to create room:", error)
    } finally {
      setCreatingRoom(false)
    }
  }

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinRoomId.trim()) return
    
    router.push(`/chat/${joinRoomId.trim()}`)
  }

  const joinRecentRoom = (roomId: string) => {
    router.push(`/chat/${roomId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Connecting to CodeRoom</h2>
          <p className="text-muted-foreground">Setting up your anonymous session...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MessageSquare className="h-8 w-8 text-primary" />
          <h1 className={cn("font-bold", isMobile ? "text-2xl" : "text-3xl")}>CodeRoom</h1>
        </div>
        <p className="text-muted-foreground">Code • Share • Learn</p>
        
        <div className="mt-6 mb-10">
          <h2 className={cn("font-bold mb-4", isMobile ? "text-xl" : "text-2xl")}>Code Together</h2>
          <p className={cn("text-muted-foreground mx-auto", isMobile ? "text-sm" : "max-w-2xl")}>
            Real-time collaboration rooms for the college computer lab. Share code, get
            AI assistance, and learn together.
          </p>
          <div className="flex items-center justify-center mt-2">
            <div className="flex items-center text-sm text-primary">
              <Sparkles className="h-4 w-4 mr-1" />
              <span className={cn(isMobile ? "text-xs" : "")}>No signup required! Connect instantly.</span>
            </div>
          </div>
        </div>

        {/* Mobile: Tabs for Join/Create */}
        {isMobile ? (
          <div className="w-full max-w-md mx-auto">
            {/* Tab Buttons */}
            <div className="flex mb-6 bg-muted rounded-lg p-1">
              <button
                onClick={() => setActiveTab("join")}
                className={cn(
                  "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
                  activeTab === "join" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Join Room
              </button>
              <button
                onClick={() => setActiveTab("create")}
                className={cn(
                  "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
                  activeTab === "create" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Create Room
              </button>
            </div>

            {/* Tab Content */}
            <Card className="p-6 text-left">
              {activeTab === "join" ? (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <LogIn className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Join Room</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter an existing room code or name to join
                  </p>
                  
                  <form onSubmit={handleJoinRoom}>
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-1">Room Code or Name</label>
                      <Input 
                        type="text" 
                        placeholder="e.g. XYZ-123 or study-group"
                        value={joinRoomId}
                        onChange={(e) => setJoinRoomId(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={!joinRoomId.trim()}
                    >
                      Join Room
                    </Button>
                  </form>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Plus className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Create Room</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start a new room for collaboration
                  </p>
                  
                  <form onSubmit={handleCreateRoom}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Room Name *</label>
                      <Input 
                        type="text" 
                        placeholder="e.g. Study Session"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <Input 
                        type="text" 
                        placeholder="Brief description (optional)"
                        value={roomDescription}
                        onChange={(e) => setRoomDescription(e.target.value)}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={!roomName.trim() || creatingRoom}
                    >
                      {creatingRoom ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        "Create Room"
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </Card>
          </div>
        ) : (
          /* Desktop: Side by Side Layout */
          <div className="flex justify-center gap-6 mb-10">
            {/* Join Room Card */}
            <Card className="p-6 text-left flex-1 max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <LogIn className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Join Room</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Enter an existing room code or name to join
              </p>
              
              <form onSubmit={handleJoinRoom}>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1">Room Code or Name</label>
                  <Input 
                    type="text" 
                    placeholder="e.g. XYZ-123 or study-group"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!joinRoomId.trim()}
                >
                  Get Started
                </Button>
              </form>
            </Card>

            {/* Create Room Card */}
            <Card className="p-6 text-left flex-1 max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Create Room</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Start a new room for collaboration
              </p>
              
              <form onSubmit={handleCreateRoom}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Room Name *</label>
                  <Input 
                    type="text" 
                    placeholder="e.g. Study Session"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Input 
                    type="text" 
                    placeholder="Brief description (optional)"
                    value={roomDescription}
                    onChange={(e) => setRoomDescription(e.target.value)}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!roomName.trim() || creatingRoom}
                >
                  {creatingRoom ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create & Join"
                  )}
                </Button>
              </form>
            </Card>
          </div>
        )}
        
        {/* Recent Rooms Section */}
        {recentRooms.length > 0 && (
          <div className={cn("mx-auto w-full", isMobile ? "max-w-md" : "max-w-2xl")}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className={cn("font-semibold", isMobile ? "text-lg" : "text-xl")}>Recent Rooms</h3>
            </div>
            
            <div className="space-y-3">
              {recentRooms.slice(0, isMobile ? 3 : 5).map((room) => {
                const Icon = room.category === "javascript" ? Code : 
                             room.category === "python" ? Code : MessageSquare
                
                // Calculate time ago
                const timeAgo = room.timestamp ? (
                  new Date().getTime() - new Date(room.timestamp.toDate()).getTime()
                ) : 0
                
                const minutes = Math.floor(timeAgo / (1000 * 60))
                const hours = Math.floor(minutes / 60)
                const days = Math.floor(hours / 24)
                
                let timeDisplay = "just now"
                if (days > 0) timeDisplay = `${days}d ago`
                else if (hours > 0) timeDisplay = `${hours}h ago`
                else if (minutes > 0) timeDisplay = `${minutes}m ago`
                
                return (
                  <div 
                    key={room.id} 
                    className="bg-card p-4 rounded-lg border border-border cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => joinRecentRoom(room.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h4 className={cn("font-medium truncate", isMobile ? "text-sm" : "")}>
                            {room.name}
                          </h4>
                          <div className={cn("flex items-center text-muted-foreground", isMobile ? "text-xs" : "text-xs")}>
                            <span>P: {room.memberCount || 1}</span>
                            <span className="mx-1">•</span>
                            <span>{timeDisplay}</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="flex-shrink-0">
                        <LogIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
      
      <div className={cn("text-center text-muted-foreground", isMobile ? "text-xs" : "text-xs")}>
        Built with ❤️ by Naveen @ Allied
      </div>
    </div>
  )
}