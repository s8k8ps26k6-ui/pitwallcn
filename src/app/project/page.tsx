import styles from "@/app/data-pages.module.css";

const entries = [
  {
    id: "2026.08.26",
    date: "2026-08-26",
    title: "Data Console Recast",
    items: [
      "数据页移动端改为收起的路由菜单，首屏优先留给当前任务。",
      "Live 变为离线计时台；状态嵌入数据表面，不再作为整页说明。",
      "顶层工作区撤去重复返回键，并统一为紧凑的任务说明与来源标签。"
    ]
  },
  {
    id: "2026.08.26",
    date: "2026-08-26",
    title: "Design Architecture 2.0",
    items: [
      "数据页从旧 SiteShell 卡片模板迁移到统一的边缘导航与工作区。",
      "Results、Race Control、Lap Analysis、Weather、Standings、Drivers 与 Race Weekend 分别采用适合自身任务的结构。",
      "Live 取消 Mock 轮询与伪实时状态；积分榜取消手填积分回退。"
    ]
  },
  {
    id: "2026.08",
    date: "2026-08",
    title: "路由职责拆分",
    items: [
      "主页独立拥有移动赛事快捷坞，切换到 Atlas、赛历和比赛详情时不再残留主页内容。",
      "沉浸式路由与数据工作区分开，避免同一外壳强迫所有页面使用相同宽度和节奏。"
    ]
  },
  {
    id: "LAPMETRY",
    date: "2026-08",
    title: "品牌迁移",
    items: [
      "对外品牌从 GridDelta 迁移到 LAPMETRY。",
      "保留既有仓库名与生产路由，降低品牌迁移对部署和链接的影响。"
    ]
  },
  {
    id: "ATLAS",
    date: "2026-07",
    title: "赛季地图与比赛详情",
    items: [
      "Atlas 建立全球赛历入口、欧洲节点与赛道轮廓。",
      "比赛详情形成赛道技术图、下一赛段、日程、纪录与历史分区。",
      "主页、赛历、Atlas 和比赛详情确立 LAPMETRY 的沉浸式产品方向。"
    ]
  },
  {
    id: "FOUNDATION",
    date: "2026-05",
    title: "数据模块基础",
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
        <p className={styles.source}>CURRENT ARCHITECTURE · 2.1</p>
      </header>

      <p className={styles.journalLead}>
        LAPMETRY 围绕比赛、赛道、时间和数据来源组织。每个路由承担不同任务，但共享同一套来源状态、导航与交互纪律。
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
