# API Setup Instructions

## Google Generative AI Setup

To use the AI assistant feature, you need to configure a Google Generative AI API key:

### Step 1: Get Your API Key
1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign up or log in with your Google account
3. Create a new API key
4. Copy the API key

### Step 2: Configure Environment Variables
1. Open the `.env.local` file in your project root
2. Replace `your_google_api_key_here` with your actual API key:
   ```
   NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY=your_actual_api_key_here
   ```

### Step 3: Restart Development Server
After updating the environment variables, restart your development server:
```bash
npm run dev
```

## Security Notes
- Never commit your API keys to version control
- The `.env.local` file is already included in `.gitignore`
- API keys are sensitive - keep them secure

## Troubleshooting
If you see API key configuration errors:
1. Make sure you've replaced the placeholder in `.env.local`
2. Verify your API key is valid
3. Restart the development server
4. Check the browser console for detailed error messages

## Support
For issues with Google AI API, visit the [Google AI documentation](https://ai.google.dev/docs).
