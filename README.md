
# Opera Hub Bot Backend

A serverless backend API for the Opera Hub Bot Chrome extension that fetches news articles from NewsAPI and serves them with proper CORS headers for browser-based requests.

## 🚀 Features

- **Latest News Fetching**: Retrieves fresh news articles from NewsAPI
- **Multi-Country Support**: Supports 8+ countries including Nigeria, Kenya, US, India, etc.
- **Topic Filtering**: Filter by categories like Technology, Business, Sports, Health, etc.
- **CORS Enabled**: Properly configured for browser requests from Chrome extensions
- **Fallback System**: Returns backup articles when primary API fails
- **High Availability**: Deployed on Vercel serverless infrastructure
- **Error Handling**: Comprehensive error handling with detailed logging
- **Content Validation**: Ensures articles have images and sufficient content

## 📡 API Endpoints

### GET /api/news

Fetches the latest news articles based on country and topic parameters.

**Base URL**: `https://your-project.vercel.app`

**Parameters:**
- `country` (optional): Country code for news filtering (default: 'us')
- `topic` (optional): News category (default: 'general')

**Example Requests:**
```
GET /api/news
GET /api/news?country=ng&topic=technology
GET /api/news?country=ke&topic=business
GET /api/news?country=us&topic=entertainment
```

**Response Format:**
```
{
  "title": "Breaking: Latest Technology Breakthrough",
  "link": "https://example-news-site.com/article",
  "pubDate": "2025-08-03T10:30:00Z",
  "author": "News Source Name",
  "full_content": "Complete article content with details...",
  "image": "https://example.com/image.jpg",
  "country": "us",
  "topic": "technology",
  "success": true,
  "timestamp": "2025-08-03T10:30:00Z"
}
```

**Error Response:**
```
{
  "title": "Fallback Article Title",
  "success": false,
  "fallback": true,
  "debug_error": "Specific error message",
  "timestamp": "2025-08-03T10:30:00Z"
}
```

## 🌍 Supported Countries

| Code | Country | Flag |
|------|---------|------|
| `us` | United States | 🇺🇸 |
| `ng` | Nigeria | 🇳🇬 |
| `ke` | Kenya | 🇰🇪 |
| `za` | South Africa | 🇿🇦 |
| `gh` | Ghana | 🇬🇭 |
| `ug` | Uganda | 🇺🇬 |
| `tz` | Tanzania | 🇹🇿 |
| `in` | India | 🇮🇳 |

## 📂 Supported Topics

| Code | Category | Description |
|------|----------|-------------|
| `general` | Top Stories | Breaking news and general updates |
| `business` | Business | Market trends, economy, finance |
| `technology` | Technology | Tech innovations, gadgets, software |
| `entertainment` | Entertainment | Movies, music, celebrities |
| `sports` | Sports | Sports news, matches, athletics |
| `science` | Science | Research, discoveries, innovations |
| `health` | Health | Medical news, wellness, healthcare |

## 🛠️ Installation & Deployment

### Prerequisites
- GitHub account
- Vercel account
- NewsAPI key (free tier available)

### Step 1: Repository Setup
1. Create a new GitHub repository named `opera-hub-bot-backend`
2. Clone the repository to your local machine
3. Create the following file structure:
```
opera-hub-bot-backend/
├── api/
│   └── news.js
├── vercel.json
├── README.md
└── .gitignore
```

### Step 2: Add Your NewsAPI Key
1. Get a free API key from [NewsAPI.org](https://newsapi.org/)
2. Replace the `NEWSAPI_KEY` in `api/news.js` with your actual key

### Step 3: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your `opera-hub-bot-backend` repository
4. Deploy with default settings
5. Get your deployment URL (e.g., `https://opera-hub-bot-backend.vercel.app`)

### Step 4: Test Your API
Visit your deployed endpoint:
```
https://your-project.vercel.app/api/news?country=us&topic=technology
```

You should receive JSON data with news articles.

## 🔧 Configuration

### Environment Variables
Currently uses hardcoded NewsAPI key. For production, consider using environment variables:

1. Add `NEWSAPI_KEY` to your Vercel environment variables
2. Update `api/news.js` to use `process.env.NEWSAPI_KEY`

### CORS Configuration
The API is configured to allow requests from any origin (`*`). For production, consider restricting to specific domains:

```
res.setHeader('Access-Control-Allow-Origin', 'chrome-extension://*');
```

## 📊 Usage Statistics

- **Response Time**: ~500-2000ms (depends on NewsAPI)
- **Rate Limits**: 1000 requests/day (NewsAPI free tier)
- **Uptime**: 99.9% (Vercel infrastructure)
- **Supported Browsers**: Chrome, Edge, Firefox (via extensions)

## 🐛 Troubleshooting

### Common Issues

**404 Error on `/api/news`**
- Ensure `api/news.js` exists in your repository
- Check that the file is properly deployed to Vercel
- Verify the API endpoint URL is correct

**CORS Errors**
- Check that CORS headers are properly set in `vercel.json`
- Ensure the extension has proper host permissions

**No Articles Returned**
- Verify your NewsAPI key is valid and has quota remaining
- Check that the country/topic combination has available articles
- Look for fallback articles in the response

**Rate Limit Exceeded**
- NewsAPI free tier allows 1000 requests/day
- Consider upgrading to a paid plan for higher limits
- Implement caching to reduce API calls

### Testing Your Backend

**Direct Browser Test:**
```
https://your-vercel-url.vercel.app/api/news?country=us&topic=technology
```

**Chrome Extension Test:**
Use the "Test" button in your Opera Hub Bot extension interface.

**CURL Test:**
```
curl "https://your-vercel-url.vercel.app/api/news?country=ng&topic=business"
```

## 🔒 Security Considerations

- API key is exposed in client-side code (consider server-side proxy for production)
- No authentication required (consider adding API keys for production)
- CORS allows all origins (restrict for production use)

## 📈 Performance Optimization

- **Caching**: Consider implementing response caching for repeated requests
- **CDN**: Vercel automatically provides CDN distribution
- **Rate Limiting**: Implement client-side rate limiting to avoid API quota exhaustion
- **Error Handling**: Graceful degradation with fallback content

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -am 'Add improvement'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Create a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Related Projects

- Opera Hub Bot Chrome Extension
- [NewsAPI Documentation](https://newsapi.org/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

## 📞 Support

For support and questions:
- Create an issue in this repository
- Check the troubleshooting section above
- Review Vercel deployment logs for errors

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Chrome Ext    │───▶│  Vercel Backend  │───▶│    NewsAPI      │
│  (Opera Hub)    │    │   /api/news      │    │   (External)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        ▼                        ▼                        ▼
   User Interface          CORS Headers              News Articles
   Bot Controls           Error Handling             Content + Images
```

## 📋 Changelog

### v1.0.0 (Latest)
- Initial release with NewsAPI integration
- Multi-country and topic support
- CORS configuration for Chrome extensions
- Fallback article system
- Comprehensive error handling

---

**Built with ❤️ for automated content creation on Opera Hub**

*Last updated: August 3, 2025*
```
