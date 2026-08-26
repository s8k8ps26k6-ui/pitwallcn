import styles from "@/app/data-pages.module.css";

const entries = [
  {
    id: "2026.08.26",
    date: "2026-08-26",
    title: "数据页重铸",
    items: [
      "数据页改用同一张赛事环境底板，页面内容直接生长在底板上。",
      "移动端首屏先呈现当前任务；导航仅在需要时展开。",
      "Live 明确展示数据源状态，不再模拟实时刷新。"
    ]
  },
  {
    id: "2026.08.26",
    date: "2026-08-26",
    title: "设计架构",
    items: [
      "统一品牌语言，不统一页面模板。",
      "成绩以分类表呈现，赛控以时间线呈现，圈速以工作台呈现。",
      "圆角、字号、间距和状态语言在所有数据页遵循同一套规则。"
    ]
  },
  {
    id: "2026.08",
    date: "2026-08",
    title: "路由职责",
    items: [
      "主页独立拥有移动赛事快捷坞，切换到 Atlas、赛历和比赛详情时不再残留主页内容。",
      "沉浸式路由与数据工作区分开，避免同一外壳强迫所有页面使用相同宽度和节奏。"
    ]
  },
  {
    id: "LAPMETRY",
    date: "2026-08",
    title: "品牌基线",
    items: [
      "对外品牌从 GridDelta 迁移到 LAPMETRY。",
      "保留既有仓库名与生产路由，降低品牌迁移对部署和链接的影响。"
    ]
  },
  {
    id: "ATLAS",
    date: "2026-07",
    title: "沉浸式入口",
    items: [
      "Atlas 建立全球赛历入口、欧洲节点与赛道轮廓。",
      "比赛详情形成赛道技术图、下一赛段、日程、纪录与历史分区。",
      "主页、赛历、Atlas 和比赛详情确立 LAPMETRY 的沉浸式产品方向。"
    ]
  },
  {
    id: "FOUNDATION",
    date: "2026-05",
    title: "数据基础",
    items: [
      "建立 Results、Race Control、Lap Analysis 与 Weather 的 OpenF1 服务层。",
      "完成移动端路由、错误边界、加载状态和基础 E2E 边界测试。",
      "这一阶段的通用 Dashboard 结构现已由 Architecture 2.0 逐步替换。"
    ]
  }
] as const;

export default function ProjectPage() {
  return (
    <main className={`${styles.page} ${styles.journal}`}>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>项目记录</h1>
          <p className={styles.lede}>记录已进入代码的产品与数据变化。</p>
        </div>
        <p className={styles.source}>设计记录</p>
      </header>

      <p className={styles.journalLead}>
        LAPMETRY 围绕比赛、赛道、时间和数据来源组织。每个路由有自己的任务与节奏，但共享同一套状态语言、导航和视觉底板。
      </p>

      <section aria-label="LAPMETRY 更新记录">
        {entries.map((entry) => (
          <article className={styles.journalEntry} key={entry.id}>
            <div>
              <p className={styles.version}>{entry.id}</p>
              <time className={styles.journalDate}>{entry.date}</time>
            </div>
            <h2>{entry.title}</h2>
            <ul>{entry.items.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        ))}
      </section>
    </main>
  );
}
