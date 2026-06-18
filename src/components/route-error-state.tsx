"use client";

import { useEffect } from "react";

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
    <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-4 py-12">
      <section
        aria-live="polite"
        className="w-full rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 text-center shadow-2xl shadow-black/30 sm:p-10"
        role="alert"
      >
        <div
          aria-hidden="true"
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-neonAmber/40 bg-neonAmber/10 text-2xl text-neonAmber"
        >
          !
        </div>
        <p className="eyebrow mt-5 text-zinc-500">Data unavailable</p>
        <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-400">{description}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            className="rounded-full bg-neonRed px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
            onClick={reset}
            type="button"
          >
            重新加载数据
          </button>
          <a
            className="rounded-full border border-zinc-700 bg-black/30 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-white"
            href="/"
          >
            返回首页
          </a>
        </div>
        {error.digest ? (
          <p className="mt-5 font-mono text-[0.65rem] text-zinc-600">错误标识：{error.digest}</p>
        ) : null}
      </section>
    </main>
  );
}
