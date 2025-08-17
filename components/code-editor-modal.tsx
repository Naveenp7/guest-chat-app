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
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Share Code
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col px-6 py-4 gap-4 min-h-0">
          {/* Language Selector */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Label htmlFor="language" className="text-sm font-medium">
              Language:
            </Label>
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

          {/* Code Input Area */}
          <div className="flex-1 flex flex-col min-h-0">
            <Label htmlFor="code-input" className="text-sm font-medium mb-2 flex-shrink-0">
              Code:
            </Label>
            <div className="flex-1 relative min-h-0">
              <Textarea
                id="code-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                className="h-full resize-none font-mono text-sm leading-relaxed overflow-auto"
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/50 flex-shrink-0">
          <div className="flex gap-2 w-full justify-end">
            <Button variant="outline" onClick={handleClose} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={!code.trim() || sending}>
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sharing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Share Code
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}