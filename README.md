# CodeRoom

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8)
![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-8E75B2)

CodeRoom is a real-time chat and code collaboration application designed for instant, anonymous communication. Built with Next.js 15 and Firebase, it allows users to create or join temporary rooms to share code snippets, debug with AI assistance, and collaborate without the need for account registration.

## 🌟 Features

- **🚀 Instant Access**: Frictionless entry using Firebase Anonymous Authentication—no sign-up required.
- **💬 Real-time Messaging**: Live chat functionality powered by Cloud Firestore.
- **🤖 AI Assistant**: Integrated Google Gemini AI to analyze code, answer programming questions, and provide debugging help directly in the chat.
- **💻 Code Sharing**: Dedicated code editor modal with syntax highlighting for multiple languages (JavaScript, Python, C++, etc.).
- **📸 Media Sharing**: Seamless image upload and sharing via Cloudinary.
- **🎨 Modern UI**: Clean, responsive interface built with Shadcn UI and Tailwind CSS v4, supporting both Light and Dark modes.
- **📱 Mobile Responsive**: Optimized layout for mobile devices with collapsible sidebars and drawers.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI)
- **Backend**: [Firebase](https://firebase.google.com/) (Authentication & Firestore)
- **AI**: [Google Generative AI SDK](https://ai.google.dev/) (Gemini)
- **Storage**: [Cloudinary](https://cloudinary.com/) (Image Hosting)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Firebase project (for Auth and Firestore)
- A Google AI Studio API Key
- A Cloudinary account

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/guest-chat-app.git](https://github.com/your-username/guest-chat-app.git)
    cd guest-chat-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    pnpm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory and add the following variables:

    ```env
    # Firebase Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

    # Google AI (Gemini)
    NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

    # Cloudinary (Image Uploads)
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
