# Freaks AI - Configuration Template

## Setup Instructions

1. Copy this file and rename it to `config.js`
2. Replace `YOUR_API_KEY_HERE` with your actual Gemini API key
3. Get your API key from: https://aistudio.google.com/apikey

## config.js Template

```javascript
// API Configuration
// This file is git-ignored for security
// DO NOT COMMIT THIS FILE

export const CONFIG = {
    GEMINI_API_KEY: 'YOUR_API_KEY_HERE'
};

// For production, move this to environment variables
```

## Security Notes

- `config.js` is automatically ignored by git
- Never commit API keys to version control
- For production deployments, use environment variables instead
