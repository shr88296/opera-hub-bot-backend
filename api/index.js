const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");
const TurndownService = require("turndown");

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { country = "us", topic = "general", city = "" } = req.query;
    
    console.log(`Processing request for country: ${country}, topic: ${topic}, city: ${city}`);
    
    // Multiple API keys for NewsAPI
    const NEWSAPI_KEYS = [
      "1d3d97c541964b1694ecc20e4f041750",
      // Add more API keys here if needed
    ];
    
    // Get a random API key
    const getApiKey = () => NEWSAPI_KEYS[Math.floor(Math.random() * NEWSAPI_KEYS.length)];
    
    // Map topics to NewsAPI categories
    const topicToCategory = {
      "TOP": "general",
      "WORLD": "general",
      "NATION": "general",
      "BUSINESS": "business",
      "TECHNOLOGY": "technology",
      "ENTERTAINMENT": "entertainment",
      "SPORTS": "sports",
      "SCIENCE": "science",
      "HEALTH": "health"
    };
    
    const category = topicToCategory[topic] || "general";
    
    // Map country codes to country names for search queries
    const countryToName = {
      "ng": "Nigeria",
      "ke": "Kenya",
      "za": "South Africa",
      "gh": "Ghana",
      "ug": "Uganda",
      "tz": "Tanzania",
      "mw": "Malawi",
      "ci": "Côte d'Ivoire",
      "in": "India",
      "us": "United States"
    };
    
    const countryName = countryToName[country] || country;
    
    // Calculate time range (last 4 hours)
    const now = new Date();
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const from = fourHoursAgo.toISOString();
    const to = now.toISOString();
    
    // Build the search query
    let searchQuery = "";
    if (city) {
      searchQuery = `"${city}" AND ${category}`;
    } else {
      searchQuery = `${countryName} AND ${category}`;
    }
    
    console.log(`Search query: ${searchQuery}`);
    console.log(`Time range: ${from} to ${to}`);
    
    // Try the Everything endpoint first for precise time filtering
    let apiKey = getApiKey();
    let apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&from=${from}&to=${to}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`;
    
    console.log(`Trying Everything endpoint: ${apiUrl}`);
    
    let response = await fetch(apiUrl);
    let data = await response.json();
    
    console.log(`Everything endpoint response status: ${data.status}`);
    console.log(`Everything endpoint total results: ${data.totalResults}`);
    
    // If Everything endpoint fails or returns no articles, try Top Headlines
    if (data.status !== "ok" || data.totalResults === 0) {
      console.log("Everything endpoint failed or returned no results, trying Top Headlines");
      
      // For Top Headlines, we can't filter by time, but we can filter by country and category
      apiUrl = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&pageSize=20&apiKey=${apiKey}`;
      
      if (city) {
        apiUrl += `&q=${encodeURIComponent(city)}`;
      }
      
      console.log(`Trying Top Headlines endpoint: ${apiUrl}`);
      
      response = await fetch(apiUrl);
      data = await response.json();
      
      console.log(`Top Headlines endpoint response status: ${data.status}`);
      console.log(`Top Headlines endpoint total results: ${data.totalResults}`);
    }
    
    if (data.status !== "ok") {
      throw new Error(`NewsAPI error: ${data.message || "Unknown error"}`);
    }
    
    if (!data.articles || data.articles.length === 0) {
      throw new Error("No articles found in NewsAPI response");
    }
    
    console.log(`Found ${data.articles.length} articles in NewsAPI response`);
    
    // Try to find a suitable article
    const maxAttempts = Math.min(10, data.articles.length);
    
    for (let i = 0; i < maxAttempts; i++) {
      const article = data.articles[i];
      console.log(`Processing article ${i+1}/${maxAttempts}: ${article.title}`);
      
      try {
        // Check if article is recent (within 4 hours)
        const articleDate = new Date(article.publishedAt);
        
        if (articleDate < fourHoursAgo) {
          console.log(`Article is too old: ${articleDate.toISOString()}`);
          continue;
        }
        
        console.log(`Article is recent: ${articleDate.toISOString()}`);
        
        // Get the article image
        let imageUrl = article.urlToImage;
        
        if (!imageUrl) {
          imageUrl = `https://picsum.photos/seed/${Date.now()}/640/360.jpg`;
          console.log(`Using placeholder image: ${imageUrl}`);
        } else {
          console.log(`Using article image: ${imageUrl}`);
        }
        
        // Get the article content
        let content = article.content || "";
        
        // Clean up the content
        content = content
          .replace(/\s+/g, " ") // Replace multiple spaces with single space
          .trim();
        
        console.log(`Content length: ${content.length} characters`);
        
        // If we have some content, use it
        if (content.length > 50) {
          // If content is too short, add a note about it
          if (content.length < 100) {
            content += "\n\n[Note: Limited content available for this article. The system will attempt to expand on this topic.]";
          }
          
          const articleData = {
            title: article.title,
            link: article.url,
            pubDate: articleDate.toISOString(),
            author: article.author || article.source.name,
            full_content: content,
            image: imageUrl,
          };
          
          console.log(`Successfully processed article: ${articleData.title}`);
          
          return res.status(200).json(articleData);
        }
      } catch (processError) {
        console.warn(`Error processing article: ${processError.message}`);
        continue;
      }
    }
    
    // If we get here, no suitable articles were found
    throw new Error("No suitable articles found with recent date and sufficient content");
    
  } catch (error) {
    console.error("Error:", error.message);
    
    const fallbackArticle = {
      title: "Latest News Update",
      link: "https://newsapi.org",
      pubDate: new Date().toISOString(),
      author: "News Service",
      full_content: "Unable to fetch specific news at this time. This is a placeholder article while the system resolves the issue.",
      image: `https://picsum.photos/seed/fallback/640/360.jpg`,
      debug_error: error.message  // Add this line for debugging
    };
    
    return res.status(200).json(fallbackArticle);
  }
};
