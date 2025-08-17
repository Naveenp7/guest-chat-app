"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Code, Send, Loader2 } from "lucide-react"

interface CodeEditorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSendCode: (code: string, language: string) => Promise<void>
}

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "plaintext", label: "Plain Text" },
]

export function CodeEditorModal({ open, onOpenChange, onSendCode }: CodeEditorModalProps) {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!code.trim()) return

    setSending(true)
    try {
      await onSendCode(code, language)
      setCode("")
      setLanguage("javascript")
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to send code:", error)
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    if (!sending) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Share Code
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="language">Language:</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-h-[300px]">
            <Label htmlFor="code-input" className="text-sm font-medium">
              Code:
            </Label>
            <Textarea
              id="code-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="h-full overflow-auto font-mono"
              style={{
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!code.trim() || sending}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Share Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
