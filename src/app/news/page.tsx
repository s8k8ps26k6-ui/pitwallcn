import { NewsFeedView } from "@/components/news-feed/news-feed-view";
import { getNewsFeed } from "@/lib/news/news-service";

export default async function NewsPage() {
  const articles = await getNewsFeed();
  return <NewsFeedView articles={articles} />;
}
