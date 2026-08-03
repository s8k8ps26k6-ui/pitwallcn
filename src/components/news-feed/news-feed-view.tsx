import Link from "next/link";
import { BackNavigation } from "@/components/back-navigation";
import type { NewsArticle } from "@/lib/news/news-types";
import { NEWS_CONFIDENCE_LABELS } from "@/lib/news/news-types";
import styles from "./news-feed.module.css";

function SourceLink({ article }: { article: NewsArticle }) {
  const source = article.primarySource;
  return (
    <a href={source.canonicalUrl} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
      查看原文 <span aria-hidden="true">↗</span>
    </a>
  );
}

export function NewsFeedView({ articles }: { articles: readonly NewsArticle[] }) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.topline}><Link href="/">GRIDDELTA <em>CN</em></Link><BackNavigation className={styles.back} fallbackHref="/" fallbackLabel="返回主页" /></div>
        <p>GRIDDELTA CN / F1 资讯</p>
        <h1>资讯流</h1>
        <span>只显示可追溯来源的中文短摘要。</span>
      </header>
      {articles.length ? (
        <section className={styles.feed} aria-label="F1 资讯">
          {articles.map((article) => (
            <article className={styles.article} key={article.id}>
              <div className={styles.articleMeta}>
                <span>{NEWS_CONFIDENCE_LABELS[article.confidence]}</span>
                <time dateTime={article.primarySource.publishedAt}>{new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(article.primarySource.publishedAt))}</time>
              </div>
              <h2>{article.title}</h2>
              <p>{article.summaryZh}</p>
              <footer><span>{article.primarySource.name}{article.primarySource.paywalled ? " · 可能需要订阅" : ""}</span><SourceLink article={article} /></footer>
            </article>
          ))}
        </section>
      ) : (
        <section className={styles.empty}>
          <p>资讯源正在完成授权与解析校验。</p>
          <span>当前不展示未经核验的转载、搜索结果或传闻聚合内容。</span>
        </section>
      )}
    </main>
  );
}
