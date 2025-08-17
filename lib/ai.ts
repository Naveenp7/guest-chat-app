import { generateText } from "ai"
import { google } from "@ai-sdk/google"

const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
import type { Message } from "./firebase"

export interface AIMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export async function getAIResponse(
  userMessage: string,
  chatContext: Message[] = [],
  currentRoom: string,
): Promise<string> {
  try {
    // Build context from recent chat messages
    const contextMessages = chatContext
      .slice(-5)
      .map((msg) => `${msg.username}: ${msg.text}${msg.type === "code" ? ` (${msg.codeLanguage} code)` : ""}`)
      .join("\n")

    const systemPrompt = `You are a helpful AI assistant in a guest chat room called "${currentRoom}". 
You help users with coding questions, debugging, explanations, and general programming support.

Recent chat context:
${contextMessages}

Guidelines:
- Be concise and helpful
- Focus on coding and technical topics
- If asked about code, provide clear explanations
- Suggest improvements when appropriate
- Be friendly and encouraging
- If no context is relevant, just answer the user's question directly`

    const { text } = await generateText({
      model: google("gemini-2.0-flash", { apiKey: googleApiKey }),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      maxTokens: 500,
      temperature: 0.7,
    })

    return text
  } catch (error) {
    console.error("AI response error:", error)
    throw new Error("Failed to get AI response. Please try again.")
  }
}

export async function analyzeCode(code: string, language: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: google("gemini-1.5-flash", { apiKey: googleApiKey }),
      messages: [
        {
          role: "system",
          content: `You are a code analysis assistant. Analyze the provided ${language} code and provide:
1. A brief explanation of what the code does
2. Any potential issues or improvements
3. Best practices suggestions if applicable
Keep your response concise and helpful.`,
        },
        {
          role: "user",
          content: `Please analyze this ${language} code:\n\n${code}`,
        },
      ],
      maxTokens: 400,
      temperature: 0.3,
    })

    return text
  } catch (error) {
    console.error("Code analysis error:", error)
    throw new Error("Failed to analyze code. Please try again.")
  }
}
