const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");
const TurndownService = require("turndown");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { country = "us", topic = "general", city = "" } = req.query;
    
    const NEWSAPI_KEYS = [
      "1d3d97c541964b1694ecc20e4f041750"
    ];
    
    const getApiKey = () => NEWSAPI_KEYS[Math.floor(Math.random() * NEWSAPI_KEYS.length)];
    
    const topicToCategory = {
      "TOP": "general", "WORLD": "general", "NATION": "general",
      "BUSINESS": "business", "TECHNOLOGY": "technology",
      "ENTERTAINMENT": "entertainment", "SPORTS": "sports",
      "SCIENCE": "science", "HEALTH": "health"
    };
    
    const category = topicToCategory[topic] || "general";
    
    const countryToName = {
      "ng": "Nigeria", "ke": "Kenya", "za": "South Africa",
      "gh": "Ghana", "ug": "Uganda", "tz": "Tanzania",
      "mw": "Malawi", "ci": "Côte d'Ivoire",
      "in": "India", "us": "United States"
    };
    
    const countryName = countryToName[country] || country;
    
    const now = new Date();
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const from = fourHoursAgo.toISOString();
    const to = now.toISOString();
    
    let searchQuery = city ? `"${city}" AND ${category}` : `${countryName} AND ${category}`;
    
    let apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&from=${from}&to=${to}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${getApiKey()}`;
    
    let response = await fetch(apiUrl);
    let data = await response.json();
    
    if (data.status !== "ok" || data.totalResults === 0) {
      apiUrl = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&pageSize=20&apiKey=${getApiKey()}`;
      if (city) apiUrl += `&q=${encodeURIComponent(city)}`;
      
      response = await fetch(apiUrl);
      data = await response.json();
    }
    
    if (data.status !== "ok" || !data.articles || data.articles.length === 0) {
      throw new Error("No articles found");
    }
    
    for (let article of data.articles.slice(0, 10)) {
      const articleDate = new Date(article.publishedAt);
      if (articleDate >= fourHoursAgo) {
        let content = article.content || "";
        content = content.replace(/\s+/g, " ").trim();
        
        if (content.length > 50) {
          if (content.length < 100) {
            content += "\n\n[Note: Limited content available.]";
          }
          
          return res.status(200).json({
            title: article.title,
            link: article.url,
            pubDate: articleDate.toISOString(),
            author: article.author || article.source.name,
            full_content: content,
            image: article.urlToImage || `https://picsum.photos/seed/${Date.now()}/640/360.jpg`
          });
        }
      }
    }
    
    throw new Error("No suitable articles found");
    
  } catch (error) {
    return res.status(200).json({
      title: "Latest News Update",
      link: "https://newsapi.org",
      pubDate: new Date().toISOString(),
      author: "News Service",
      full_content: "Unable to fetch specific news at this time.",
      image: `https://picsum.photos/seed/fallback/640/360.jpg`
    });
  }
};
