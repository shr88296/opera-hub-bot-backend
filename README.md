# Opera Hub Bot Backend

A serverless backend for the Opera Hub Bot Chrome extension that fetches news articles from NewsAPI.

## Features

- Fetches latest news articles from NewsAPI
- Supports multiple countries and topics
- CORS-enabled for browser requests
- Fallback articles when API fails
- Deployed on Vercel for high availability

## API Endpoints

### GET /api/news

Fetches news articles based on country and topic.

**Parameters:**
- `country` (optional): Country code (default: 'us')
- `topic` (optional): News category (default: 'general')

**Example:**
