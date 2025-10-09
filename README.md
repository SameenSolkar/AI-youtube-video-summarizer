# AI powered YouTube Summarizer Chrome Extension

A Chrome extension that generates AI-powered summaries of YouTube videos using Google's Gemini API. Get quick overviews of video content in different formats without watching the entire video.

## Features

- Generate concise summaries of YouTube videos
- Multiple summary styles:
  - **TL;DR** - Brief overview
  - **Bullets with Timestamps** - Key points with video timestamps
  - **Chapterized** - Organized by video chapters
  - **Study Notes** - Key points with quiz questions
- Secure API key management
- Clean and intuitive user interface

## Installation

### Prerequisites
- Google Chrome browser (or any Chromium-based browser)
- Google Gemini API key

### Getting Your Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click on "Get API key"
4. Click "Create API key"
5. Copy the generated API key (you won't be able to see it again after closing the dialog)

### Installation Steps
1. **Clone or download** this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked** and select the extension directory

### Adding Your API Key
1. Click on the extension icon in your browser's toolbar
2. Click the gear icon (⚙️) or select **Options** from the menu
3. In the options page, paste your Gemini API key in the provided field
4. Click **Save** to store your API key securely

> 🔒 **Security Note**: Your API key is stored locally in your browser's storage and is only used to make requests to Google's Gemini API.

## Usage
1. Click the extension icon in your browser's toolbar
2. Paste a YouTube URL into the input field
3. Select your preferred summary style
4. Click **Summarize**
5. View your generated summary

## Privacy
- Your API key is stored locally in your browser's storage
- The extension only communicates with Google's Gemini API and the YouTube API
- No data is collected or stored by the extension

## Troubleshooting
- **API Key Issues**: Ensure your API key is valid and has the necessary permissions
- **Rate Limiting**: If you encounter rate limits, try again after some time
- **Video Not Supported**: Some videos may not be available for summarization due to restrictions

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is open source and available under the [MIT License](LICENSE).

---

*This extension is not affiliated with or endorsed by Google or YouTube.*
