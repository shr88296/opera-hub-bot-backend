export default async function handler(req, res) {
  // Enable CORS headers first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts GET requests'
    });
    return;
  }

  // Get query parameters
  const { country = 'us', topic = 'general' } = req.query;
  
  // NewsAPI key
  const NEWSAPI_KEY = '1d3d97c541964b1694ecc20e4f041750';
  
  try {
    console.log(`📡 Fetching news for ${country}/${topic}`);
    
    // Build NewsAPI URL
    const newsUrl = `https://newsapi.org/v2/top-headlines?country=${country}&category=${topic.toLowerCase()}&apiKey=${NEWSAPI_KEY}&pageSize=10&sortBy=publishedAt`;
    
    // Fetch from NewsAPI
    const response = await fetch(newsUrl, {
      headers: {
        'User-Agent': 'Opera-Hub-Bot/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`NewsAPI responded with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(`NewsAPI error: ${data.message}`);
    }
    
    if (!data.articles || data.articles.length === 0) {
      throw new Error('No articles found');
    }
    
    // Find the best article with content and image
    for (const article of data.articles) {
      if (article.content && 
          article.urlToImage && 
          article.content !== '[Removed]' && 
          article.title && 
          article.description) {
        
        const now = new Date();
        const articleDate = new Date(article.publishedAt);
        const hoursDiff = (now - articleDate) / (1000 * 60 * 60);
        
        // Return articles from last 48 hours
        if (hoursDiff <= 48) {
          const result = {
            title: article.title,
            link: article.url,
            pubDate: article.publishedAt,
            author: article.source?.name || 'News Source',
            full_content: article.content || article.description,
            image: article.urlToImage,
            country: country,
            topic: topic,
            success: true,
            timestamp: new Date().toISOString()
          };
          
          console.log(`✅ Article found: ${result.title}`);
          res.status(200).json(result);
          return;
        }
      }
    }
    
    throw new Error('No recent articles found');
    
  } catch (error) {
    console.error('❌ Backend error:', error.message);
    
    // Return fallback article instead of error
    const fallbackArticle = {
      title: "Breaking: Latest Global Technology News",
      link: "https://newsapi.org",
      pubDate: new Date().toISOString(),
      author: "Global News Network",
      full_content: "Stay informed with the latest developments in technology, business, and innovation worldwide. Our comprehensive coverage brings you breaking news, in-depth analysis, and expert insights from trusted sources across the globe. From cutting-edge technological breakthroughs to market trends, we keep you connected to what matters most.",
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop&auto=format",
      country: country,
      topic: topic,
      success: false,
      fallback: true,
      debug_error: error.message,
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json(fallbackArticle);
  }
}
