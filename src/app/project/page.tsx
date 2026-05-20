import Link from "next/link";

const featureModules = [
  {
    title: "赛会控制",
    href: "/race-control",
    status: "OpenF1",
    description: "按比赛周末和赛段查看 Race Control 消息，并对常见旗语、安全车、DRS、赛道边界和圈速删除消息做中文化处理。"
  },
  {
    title: "比赛结果",
    href: "/results",
    status: "OpenF1",
    description: "使用 session_result 展示排位赛、冲刺赛和正赛成绩，包含名次、车手、车队、时间/差距、圈数和完赛状态。"
  },
  {
    title: "圈速分析",
    href: "/lap-analysis",
    status: "OpenF1",
    description: "整合 laps、stints、position、intervals 和 drivers 数据，用于查看单圈、分段、stint 与位置变化。"
  },
  {
    title: "赛道天气",
    href: "/weather",
    status: "OpenF1",
    description: "展示赛道温度、空气温度、湿度、气压、降雨、风向与风速，辅助判断轮胎窗口和赛道状态。"
  },
  {
    title: "赛程",
    href: "/schedule",
    status: "Local + OpenF1",
    description: "以本地校验赛历为主，避免错误外部赛历覆盖，同时在可用时补充 OpenF1 session 数据。"
  },
  {
    title: "车手 / 积分榜 / 实时计时",
    href: "/drivers",
    status: "Prototype",
    description: "保留为后续扩展区域，用于完善车手资料、积分模型和更深的实时计时体验。"
  }
] as const;

const decisions = [
  "用 Next.js App Router 承担页面和服务端数据请求，减少浏览器直接访问外部 API 的依赖。",
  "用 TypeScript 约束 OpenF1 返回数据，避免页面直接处理杂乱的原始字段。",
  "真实数据缺失时显示正式空状态，不用 Mock 冒充比赛结果。",
  "把 Race Control、Lap Analysis、Results、Weather 分成独立 service 文件，方便后续缓存和镜像。",
  "用小分支和 PR 控制改动范围，防止旧 dashboard、错误赛历和 mock 数据污染 main。"
] as const;

const timeline = [
  {
    step: "01",
    title: "原型阶段",
    description: "先完成首页、赛程、车手、积分榜和基础数据看板结构，验证整体 UI 和移动端布局。"
  },
  {
    step: "02",
    title: "真实数据接入",
    description: "逐步接入 OpenF1，优先完成 Race Control、Lap Analysis、Results 和 Weather。"
  },
  {
    step: "03",
    title: "稳定性修复",
    description: "清理污染分支，保护 main，修复错误赛历、mock fallback、排序和空状态等问题。"
  },
  {
    step: "04",
    title: "作品化整理",
    description: "补充 README、项目说明、国内访问考虑和未来路线，让项目更适合作为申请作品展示。"
  }
] as const;

const roadmap = [
  "为车手详情页接入最近比赛结果和赛季表现",
  "完善积分榜真实数据或维护可靠本地积分模型",
  "增加单站复盘页面，把结果、赛控、圈速和天气串成完整故事",
  "增加数据缓存层，降低 OpenF1 不稳定或网络延迟带来的影响",
  "根据实际访问情况考虑国内镜像和服务端缓存部署"
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
            <p className="eyebrow">Project Story</p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">关于 Pitwall CN</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300">
              Pitwall CN 是一个面向中文 F1 车迷的非官方数据看板。它不是单纯的资讯页，而是围绕比赛周末的信息流来设计：先看赛程，再看赛控、结果、圈速和天气，尽量把车迷真正会用到的数据集中在一个移动端友好的主控台里。
            </p>
          </div>
          <div className="rounded-2xl border border-neonAmber/30 bg-neonAmber/10 p-4">
            <p className="race-code text-neonAmber">Current Focus</p>
            <p className="mt-2 text-2xl font-bold text-white">Portfolio-ready v1</p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">真实数据模块已经成型，后续重点是稳定性、复盘页面和更强的数据叙事。</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["技术栈", "Next.js · TypeScript · Tailwind · Vercel"],
          ["数据源", "OpenF1 + 本地校验赛历"],
          ["项目定位", "中文 F1 比赛周末数据主控台"]
        ].map(([label, value]) => (
          <article key={label} className="card motion-fade-up motion-delay-1">
            <p className="eyebrow">{label}</p>
            <p className="mt-3 text-lg font-semibold leading-7 text-white">{value}</p>
          </article>
        ))}
      </section>

      <section className="card motion-fade-up motion-delay-2 space-y-4">
        <div>
          <p className="eyebrow">Why this project</p>
          <h2 className="mt-1 text-xl font-bold text-white">为什么做这个项目</h2>
        </div>
        <p className="text-sm leading-7 text-zinc-300">
          我本身长期关注 F1，也会看比赛、赛控消息和圈速变化。中文车迷常见的问题是：信息分散、英文门槛高、赛控消息不直观、移动端体验不够像一个真正的数据工具。所以这个项目从一开始就不是为了做一个“好看的主页”，而是想把真实比赛周末会用到的页面拆出来，逐步做成一个可以持续迭代的数据产品。
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {featureModules.map((item) => (
          <Link key={item.title} className="card group motion-fade-up flex flex-col justify-between" href={item.href}>
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="eyebrow">{item.status}</p>
                <span className="text-zinc-600 transition group-hover:translate-x-1 group-hover:text-neonAmber">→</span>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{item.description}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="card motion-fade-up motion-delay-3">
          <p className="eyebrow">Technical Decisions</p>
          <h2 className="mt-1 text-xl font-bold text-white">关键技术取舍</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-400">
            {decisions.map((item) => (
              <li key={item} className="rounded-xl border border-zinc-800 bg-black/25 p-3">{item}</li>
            ))}
          </ul>
        </article>

        <article className="card motion-fade-up motion-delay-4">
          <p className="eyebrow">Development Timeline</p>
          <h2 className="mt-1 text-xl font-bold text-white">迭代过程</h2>
          <ol className="mt-4 space-y-3">
            {timeline.map((item) => (
              <li key={item.step} className="grid grid-cols-[3rem_1fr] gap-3 rounded-xl border border-zinc-800 bg-black/25 p-3">
                <span className="font-mono text-lg font-bold text-neonAmber">{item.step}</span>
                <span>
                  <span className="block font-semibold text-white">{item.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-zinc-400">{item.description}</span>
                </span>
              </li>
            ))}
          </ol>
        </article>
      </section>

      <section className="card motion-fade-up motion-delay-5 space-y-4">
        <div>
          <p className="eyebrow">AI-assisted workflow</p>
          <h2 className="mt-1 text-xl font-bold text-white">开发方式说明</h2>
        </div>
        <p className="text-sm leading-7 text-zinc-300">
          这个项目使用了 AI 辅助编码和排错，但项目方向、功能优先级、页面取舍、问题验收、部署决策和迭代判断由我主导。我更关注的是能不能把 AI 当成工程工具，配合 GitHub PR、changed files 检查和 Vercel 构建结果，把一个真实可访问的数据产品稳定推进下去。
        </p>
      </section>

      <section className="card motion-fade-up motion-delay-6">
        <p className="eyebrow">Roadmap</p>
        <h2 className="mt-1 text-xl font-bold text-white">下一步计划</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {roadmap.map((item) => (
            <div key={item} className="rounded-xl border border-zinc-800 bg-black/25 p-3 text-sm leading-6 text-zinc-400">
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
