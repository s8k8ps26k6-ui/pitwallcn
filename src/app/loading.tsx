export default function Loading() {
  return (
    <main
      className="min-h-[100dvh] bg-[#020712] px-5 pt-5 text-zinc-200"
      aria-live="polite"
      aria-label="LAPMETRY 页面加载中"
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between border-b border-white/10 pb-4">
        <span className="text-xs font-bold tracking-[0.14em] text-zinc-100">LAPMETRY</span>
        <span className="text-[11px] text-zinc-500">正在切换页面…</span>
      </div>
      <div className="mx-auto mt-3 h-px w-full max-w-[1440px] overflow-hidden bg-white/5">
        <div className="h-full w-1/3 animate-pulse bg-[#d7b56d]/70" />
      </div>
    </main>
  );
}
