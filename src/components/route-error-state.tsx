"use client";

import Link from "next/link";
import { useEffect } from "react";
import styles from "@/app/data-pages.module.css";

type RouteErrorStateProps = {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
};

export function RouteErrorState({
  error,
  reset,
  title = "数据暂时无法加载",
  description = "OpenF1 暂时没有返回可用数据，或请求过程中出现异常。你可以稍后重试，页面不会丢失其他内容。"
}: RouteErrorStateProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className={`${styles.page} ${styles.errorPage}`}>
      <section
        aria-live="polite"
        className={styles.errorState}
        role="alert"
      >
        <p className={`${styles.source} ${styles.sourceDanger}`}>数据不可用</p>
        <h1 className={styles.errorTitle}>{title}</h1>
        <p className={styles.errorDescription}>{description}</p>
        <div className={styles.errorActions}>
          <button
            className={styles.submit}
            onClick={reset}
            type="button"
          >
            重新加载数据
          </button>
          <Link
            className={styles.back}
            href="/"
          >
            返回首页
          </Link>
        </div>
        {error.digest ? (
          <p className={styles.errorDigest} translate="no">错误标识：{error.digest}</p>
        ) : null}
      </section>
    </main>
  );
}
