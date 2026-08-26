import { BackNavigation } from "@/components/back-navigation";
import styles from "@/app/data-pages.module.css";

const entries = [
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
      <div className={styles.backRow}>
        <BackNavigation className={styles.back} fallbackHref="/" fallbackLabel="返回主页" />
      </div>
      <header className={styles.pageHead}>
        <div>
          <p className={styles.routeCode}>PROJECT / RELEASE JOURNAL</p>
          <h1 className={styles.title}>项目记录</h1>
          <p className={styles.lede}>这里记录已经进入代码的方向变化，并把每次发布绑定到可核验的实现与数据状态。</p>
        </div>
        <p className={styles.source}>CURRENT ARCHITECTURE · 2.0</p>
      </header>

      <p className={styles.journalLead}>
        LAPMETRY 是一套围绕比赛、赛道、时间和数据来源组织的中文 F1 产品。页面可以有不同职业，但来源状态、品牌语言和交互纪律必须一致。
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
