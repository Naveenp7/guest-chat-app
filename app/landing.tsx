"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createRoom, listenToRecentRooms, type Room } from "@/lib/firebase"
import { Loader2, MessageSquare, Code, Sparkles, Plus, LogIn, Clock } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()
  const { user, loading, signInAnonymously, isAuthenticated, username } = useAuth()
  const [roomName, setRoomName] = useState("")
  const [roomDescription, setRoomDescription] = useState("")
  const [roomCategory, setRoomCategory] = useState("general") // Default category
  const [joinRoomId, setJoinRoomId] = useState("")
  const [recentRooms, setRecentRooms] = useState<Room[]>([])
  const [creatingRoom, setCreatingRoom] = useState(false)
  
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
      <div className="min-h-screen bg-background flex items-center justify-center">
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
          <h1 className="text-3xl font-bold">CodeRoom</h1>
        </div>
        <p className="text-muted-foreground">Code • Share • Learn</p>
        
        <div className="mt-6 mb-10">
          <h2 className="text-2xl font-bold mb-4">Code Together</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real-time collaboration rooms for the college computer lab. Share code, get
            AI assistance, and learn together.
          </p>
          <div className="flex items-center justify-center mt-2">
            <div className="flex items-center text-sm text-primary">
              <Sparkles className="h-4 w-4 mr-1" />
              <span>No signup required! Connect instantly.</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-10">
          
          
          {/* Join Room Card */}
          <Card className="p-6 text-left">
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
        </div>
        
        {/* Recent Rooms Section */}
        {recentRooms.length > 0 && (
          <div className="max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Recent Rooms</h3>
            </div>
            
            <div className="space-y-3">
              {recentRooms.map((room) => {
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
                if (days > 0) timeDisplay = `${days} days ago`
                else if (hours > 0) timeDisplay = `${hours} hours ago`
                else if (minutes > 0) timeDisplay = `${minutes} mins ago`
                
                return (
                  <div 
                    key={room.id} 
                    className="bg-card p-4 rounded-lg border border-border cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => joinRecentRoom(room.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <div>
                          <h4 className="font-medium">{room.name}</h4>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span>P: {room.memberCount || 1}</span>
                            <span className="mx-1">•</span>
                            <span>{timeDisplay}</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
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
      
      <div className="text-center text-xs text-muted-foreground">
        Built with ❤️ by ALLIED
      </div>
    </div>
  )
}