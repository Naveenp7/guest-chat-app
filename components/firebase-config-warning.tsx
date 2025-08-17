import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function FirebaseConfigWarning() {
  return (
    <Alert className="border-amber-500/50 bg-amber-500/10 text-amber-400">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Firebase Configuration Required</AlertTitle>
      <AlertDescription className="mt-2">
        To use this chat application, you need to configure Firebase environment variables:
        <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
          <li>NEXT_PUBLIC_FIREBASE_API_KEY</li>
          <li>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
          <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
          <li>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</li>
          <li>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</li>
          <li>NEXT_PUBLIC_FIREBASE_APP_ID</li>
        </ul>
        <p className="mt-2 text-xs opacity-80">
          Add these variables in your Vercel project settings or create a Firebase project at
          console.firebase.google.com
        </p>
      </AlertDescription>
    </Alert>
  )
}
