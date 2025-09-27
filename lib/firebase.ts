import { initializeApp } from "firebase/app"
import { getAuth, signInAnonymously, type Auth } from "firebase/auth"
import {
  getFirestore,
  type Firestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type Timestamp,
  getDocs,
  where,
  limit,
} from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
}

const isFirebaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  )
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth: Auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db: Firestore = getFirestore(app)

export const isConfigured = isFirebaseConfigured()

// Message interface
export interface Message {
  id: string
  text: string
  userId: string
  username: string
  timestamp: Timestamp
  roomId: string
  type: "text" | "code" | "image"
  codeLanguage?: string
  imageUrl?: string
  imageId?: string
}

// Room interface
export interface Room {
  id: string
  name: string
  description?: string
  createdBy: string
  createdByUsername: string
  timestamp: Timestamp
  memberCount?: number
  lastActivity?: Timestamp
  category?: string
}

export const signInAnonymouslyUser = async () => {
  try {
    if (!isConfigured) {
      console.warn("Firebase is not properly configured. Please add your Firebase environment variables.")
      return null
    }
    const result = await signInAnonymously(auth)
    return result.user
  } catch (error) {
    console.error("Error signing in anonymously:", error)
    return null
  }
}

export const sendMessage = async (
  roomId: string,
  text: string,
  userId: string,
  username: string,
  type: "text" | "code" | "image" = "text",
  codeLanguage?: string,
  imageUrl?: string,
  imageId?: string,
) => {
  try {
    if (!isConfigured) {
      console.warn("Firebase is not properly configured. Cannot send message.")
      return
    }
    await addDoc(collection(db, "messages"), {
      text,
      userId,
      username,
      timestamp: serverTimestamp(),
      roomId,
      type,
      ...(type === "code" && codeLanguage && { codeLanguage }),
      ...(type === "image" && { imageUrl, imageId }),
    })
  } catch (error) {
    console.error("Error sending message:", error)
  }
}

// Listen to messages function
export const listenToMessages = (roomId: string, callback: (messages: Message[]) => void) => {
  if (!isConfigured) {
    console.warn("Firebase is not properly configured. Cannot listen to messages.")
    return () => {} // Return empty unsubscribe function
  }

  const q = query(collection(db, "messages"), orderBy("timestamp", "asc"))

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      if (data.roomId === roomId) {
        messages.push({
          id: doc.id,
          ...data,
        } as Message)
      }
    })
    callback(messages)
  })
}

// Create a new room
export const createRoom = async (
  name: string,
  userId: string,
  username: string,
  description?: string,
  category?: string
): Promise<string | null> => {
  try {
    if (!isConfigured) {
      console.warn("Firebase is not properly configured. Cannot create room.")
      return null
    }
    
    const roomRef = await addDoc(collection(db, "rooms"), {
      name,
      description,
      createdBy: userId,
      createdByUsername: username,
      timestamp: serverTimestamp(),
      memberCount: 1,
      lastActivity: serverTimestamp(),
      category,
    })
    
    return roomRef.id
  } catch (error) {
    console.error("Error creating room:", error)
    return null
  }
}

// Get recent rooms
export const getRecentRooms = async (limit_count: number = 10): Promise<Room[]> => {
  try {
    if (!isConfigured) {
      console.warn("Firebase is not properly configured. Cannot get recent rooms.")
      return []
    }
    
    const q = query(
      collection(db, "rooms"),
      orderBy("lastActivity", "desc"),
      limit(limit_count)
    )
    
    const snapshot = await getDocs(q)
    const rooms: Room[] = []
    
    snapshot.forEach((doc) => {
      rooms.push({
        id: doc.id,
        ...doc.data(),
      } as Room)
    })
    
    return rooms
  } catch (error) {
    console.error("Error getting recent rooms:", error)
    return []
  }
}

// Listen to recent rooms
export const listenToRecentRooms = (callback: (rooms: Room[]) => void, limit_count: number = 10) => {
  if (!isConfigured) {
    console.warn("Firebase is not properly configured. Cannot listen to rooms.")
    return () => {} // Return empty unsubscribe function
  }

  const q = query(
    collection(db, "rooms"),
    orderBy("lastActivity", "desc"),
    limit(limit_count)
  )

  return onSnapshot(q, (snapshot) => {
    const rooms: Room[] = []
    snapshot.forEach((doc) => {
      rooms.push({
        id: doc.id,
        ...doc.data(),
      } as Room)
    })
    callback(rooms)
  })
}
