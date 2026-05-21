import Link from "next/link";

const changelog = [
  {
    version: "v1.6",
    title: "赛道天气模块上线",
    date: "2026-05",
    items: [
      "新增 /weather 赛道天气页面。",
      "接入 OpenF1 weather 数据，展示赛道温度、空气温度、湿度、气压、降雨、风向与风速。",
      "天气入口放在 Pitwall CN 标题旁边，避免主导航变成拥挤的 3×3。"
    ]
  },
  {
    version: "v1.5",
    title: "性能与加载体验优化",
    date: "2026-05",
    items: [
      "新增全站路由加载骨架屏。",
      "优化 Results、Race Control、Lap Analysis 的 OpenF1 赛段选择器请求方式。",
      "减少进入数据页时的等待感。"
    ]
  },
  {
    version: "v1.4",
    title: "首页主控台升级",
    date: "2026-05",
    items: [
      "新增比赛周末作战台。",
      "首页入口重新组织为结果、赛控、圈速、赛程的比赛周末使用流程。",
      "新增比赛结果模块入口。"
    ]
  },
  {
    version: "v1.3",
    title: "比赛结果中心上线",
    date: "2026-05",
    items: [
      "新增 /results 页面。",
      "接入 OpenF1 session_result 数据。",
      "支持排位赛、冲刺赛、正赛成绩表和赛段快捷切换。"
    ]
  },
  {
    version: "v1.2",
    title: "圈速分析与赛控数据稳定化",
    date: "2026-05",
    items: [
      "Lap Analysis 接入 OpenF1 laps、stints、position、intervals、drivers。",
      "Race Control 接入 OpenF1 race_control。",
      "修复 P1/P10/P11/P2 这类字符串排序问题，改为数字名次排序。"
    ]
  },
  {
    version: "v1.1",
    title: "基础数据看板结构完成",
    date: "2026-05",
    items: [
      "完成首页、赛程、实时计时、车手、积分榜等基础页面。",
      "确定暗色 F1 数据看板视觉方向。",
      "完成移动端优先的卡片式布局。"
    ]
  }
] as const;

const roadmap = [
  {
    title: "单站复盘页面",
    description: "把结果、赛控、圈速和天气串成一个完整大奖赛复盘页面。",
    priority: "High"
  },
  {
    title: "车手详情升级",
    description: "为车手页增加最近比赛结果、基础资料和近期表现。",
    priority: "High"
  },
  {
    title: "积分榜数据升级",
    description: "完善车手和车队积分数据源，减少静态占位内容。",
    priority: "Medium"
  },
  {
    title: "数据缓存层",
    description: "降低 OpenF1 网络波动和访问延迟对页面体验的影响。",
    priority: "Medium"
  },
  {
    title: "国内访问优化",
    description: "根据实际访问情况评估镜像、缓存和部署策略。",
    priority: "Later"
  }
] as const;

const statusCards = [
  ["当前版本", "v1.6"],
  ["主要数据源", "OpenF1 + 本地赛历"],
  ["部署状态", "Vercel Online"]
] as const;

export default function ProjectPage() {
  return (
    <main className="space-y-5">
      <Link className="race-code inline-flex rounded-full border border-zinc-800 bg-black/30 px-3 py-1.5 text-zinc-400 transition hover:border-neonAmber hover:text-neonAmber" href="/">
        ← BACK TO HOME
      </Link>

      <section className="motion-fade-up rounded-2xl border border-zinc-800 bg-black/30 p-5 shadow-xl shadow-black/20">
        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div>
            <p className="eyebrow">Update Log</p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">更新日志</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300">
              这里记录 Pitwall CN 的公开版本更新、主要功能变化和下一步计划。页面仅保留公开信息，不展示内部开发备注。
            </p>
          </div>
          <div className="rounded-2xl border border-neonAmber/30 bg-neonAmber/10 p-4">
            <p className="race-code text-neonAmber">Public Roadmap</p>
            <p className="mt-2 text-2xl font-bold text-white">Race-weekend dashboard</p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">后续重点：单站复盘、车手页升级、积分榜数据和访问速度优化。</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {statusCards.map(([label, value]) => (
          <article key={label} className="card motion-fade-up motion-delay-1">
            <p className="eyebrow">{label}</p>
            <p className="mt-3 text-lg font-semibold leading-7 text-white">{value}</p>
          </article>
        ))}
      </section>

      <section className="card motion-fade-up motion-delay-2">
        <p className="eyebrow">Changelog</p>
        <h2 className="mt-1 text-xl font-bold text-white">版本更新</h2>
        <div className="mt-4 space-y-4">
          {changelog.map((item) => (
            <article key={item.version} className="rounded-2xl border border-zinc-800 bg-black/25 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-sm font-bold text-neonAmber">{item.version}</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">{item.title}</h3>
                </div>
                <span className="race-code text-zinc-500">{item.date}</span>
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-400">
                {item.items.map((detail) => (
                  <li key={detail} className="rounded-xl border border-zinc-900 bg-black/20 px-3 py-2">{detail}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="card motion-fade-up motion-delay-3">
        <p className="eyebrow">Roadmap</p>
        <h2 className="mt-1 text-xl font-bold text-white">下一步计划</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {roadmap.map((item) => (
            <article key={item.title} className="rounded-xl border border-zinc-800 bg-black/25 p-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-white">{item.title}</h3>
                <span className="rounded-full border border-zinc-700 bg-zinc-900/60 px-2 py-0.5 text-[0.65rem] font-bold tracking-[0.14em] text-zinc-400">
                  {item.priority}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
