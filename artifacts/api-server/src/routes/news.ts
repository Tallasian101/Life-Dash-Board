import { Router } from "express";
import Parser from "rss-parser";

const router = Router();
const parser = new Parser({ timeout: 8000 });

const RSS_FEEDS = [
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC World" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", source: "NY Times" },
  { url: "https://feeds.reuters.com/reuters/topNews", source: "Reuters" },
  { url: "https://www.theguardian.com/world/rss", source: "The Guardian" },
];

let cachedNews: object[] = [];
let cacheTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000;

router.get("/news", async (req, res) => {
  const now = Date.now();
  if (cachedNews.length > 0 && now - cacheTime < CACHE_TTL_MS) {
    return res.json(cachedNews);
  }

  const articles: {
    id: string;
    title: string;
    source: string;
    url: string;
    publishedAt: string;
    description: string | null;
  }[] = [];

  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);
      return parsed.items.slice(0, 5).map((item, idx) => ({
        id: `${feed.source}-${idx}-${Date.now()}`,
        title: item.title ?? "No title",
        source: feed.source,
        url: item.link ?? "#",
        publishedAt: item.pubDate ?? new Date().toISOString(),
        description: item.contentSnippet ?? item.summary ?? null,
      }));
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    }
  }

  if (articles.length === 0) {
    req.log.warn("All RSS feeds failed");
    return res.json(cachedNews.length > 0 ? cachedNews : []);
  }

  articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  cachedNews = articles.slice(0, 20);
  cacheTime = now;

  return res.json(cachedNews);
});

export default router;
