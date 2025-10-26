import { generateText } from "ai"
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Access the environment variable correctly for client-side usage
const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

// Validate API key format and presence
const isValidApiKey = googleApiKey &&
  googleApiKey !== 'your_google_api_key_here' &&
  googleApiKey.trim().length > 0

import type { Message } from "./firebase"

export interface AIMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const googleProvider = createGoogleGenerativeAI({ apiKey: googleApiKey });

export async function getAIResponse(
  userMessage: string,
  chatContext: Message[] = [],
  currentRoom: string,
): Promise<string> {
  try {
    // Check if API key is available and valid
    if (!isValidApiKey) {
      if (!googleApiKey) {
        throw new Error("Google Generative AI API key is not configured. Please add NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY to your .env.local file.")
      } else if (googleApiKey === 'your_google_api_key_here') {
        throw new Error("Please replace 'your_google_api_key_here' with your actual Google API key in .env.local file.")
      } else {
        throw new Error("Invalid Google API key format. Please check your NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY in .env.local file.")
      }
    }

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
      model: googleProvider("gemini-2.5-flash"),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
    })

    return text
  } catch (error) {
    console.error("AI response error:", error)
    if (error instanceof Error && error.message.includes("API key")) {
      throw new Error("AI service configuration error. Please check your Google API key setup.")
    }
    throw new Error("Failed to get AI response. Please try again.")
  }
}

export async function analyzeCode(code: string, language: string): Promise<string> {
  try {
    // Check if API key is available and valid
    if (!isValidApiKey) {
      if (!googleApiKey) {
        throw new Error("Google Generative AI API key is not configured. Please add NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY to your .env.local file.")
      } else if (googleApiKey === 'your_google_api_key_here') {
        throw new Error("Please replace 'your_google_api_key_here' with your actual Google API key in .env.local file.")
      } else {
        throw new Error("Invalid Google API key format. Please check your NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY in .env.local file.")
      }
    }

    const { text } = await generateText({
      model: googleProvider("gemini-2.5-flash"),
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
      temperature: 0.3,
    })

    return text
  } catch (error) {
    console.error("Code analysis error:", error)
    if (error instanceof Error && error.message.includes("API key")) {
      throw new Error("AI service configuration error. Please check your Google API key setup.")
    }
    throw new Error("Failed to analyze code. Please try again.")
  }
}
