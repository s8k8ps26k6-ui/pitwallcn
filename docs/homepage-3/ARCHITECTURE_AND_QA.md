# LAPMETRY 3.0：Globe-first 首页原型审计与验收

交付范围：独立 `/home-next`，不切换生产首页。开发分支 `work/lapmetry-3-globe-homepage-prototype-20261106`。本报告记录可复核结果，不代表正式上线或真实 iPhone 验收完成。

## 基线与冻结范围

检查时 main 为 `fed7ef858ff40a04a94aca941bbefde2e41120c7`。采用 Atlas 开发分支 `work/atlas-2-globe-raceweek-prototype-20261102` 的 `33229fe864e88b411de858be3b663fd3f3e593bd`，它包含 Atlas 原型与双停靠点手势修复（Draft PR #68）。本 PR 堆叠于该分支，避免将其未合并内容混入首页专属审查。

Homepage Recovery `1f8db583` 与 Race Week reset `89d99ee` 分别存在 8、15 个未合并提交；后者包含前者。它们不是最新 Atlas 基线，本轮不引入其首页改动。

`src/app/page.tsx`、原 Homepage 组件、Calendar/Schedule 页面、全局样式及原 Atlas 页面没有修改。SiteShell 只增加 `/home-next` 沉浸式路由识别。生产路由 `/` 保留。未修改部署配置，未合并 main。

## 架构变化

| 维度 | 既有首页 | 新原型 |
|---|---|---|
| 页面组织 | 服务端赛事选择、HomepageV3、MobileRaceDock，纵向内容流 | 固定视口空间应用，地球→比赛周→数据页面 |
| 导航 | 页面内容与独立页面入口 | 全球/欧洲/赛站聚焦；统一导航与直接赛事选择 |
| 移动信息 | 首页模块与移动赛事入口 | 双状态抽屉：紧凑条/全视口，展开内容独立滚动 |
| 桌面信息 | 网页内容组织 | 可收起右侧赛事面板；地球占据剩余主要空间 |
| 数据状态 | 仓库已有赛事模型 | 保留模型，明确区分计划时间与真实比赛状态 |

`GlobeHomepage` 负责选站、默认赛事入口、面板、导航、时间显示。`AtlasGlobe` 继续承担 R3F Canvas、节点、地理坐标、自由旋转/缩放、欧洲模式与聚焦。赛历由 `season-2026` / `events-2026` 读取，赛道由 circuit registry 提供；详情链接使用真实 eventId。

复用已修复的 `useRaceSheet` 与 `useAtlasViewport`：仅 collapsed/expanded 两个最终状态；手势区使用 pointer capture、touch-action，RAF 直接更新 transform，距离和近期释放速度决定吸附。内容区域保持原生滚动，不把内容下滑解释为关闭；收起通过顶部明确手势区。路由挂载时锁 document/body，卸载恢复原样；动态 visualViewport 与安全区沿用原实现。展开后底层导航/Canvas 区域 inert，焦点转入手柄。桌面可键盘收起/打开面板。

Canvas 未按 sheet/panel 状态条件卸载或设动态 key。移动展开仅暂停 active 场景；桌面关闭面板移动固定尺寸地球区域，不改变其尺寸。源码结构满足连续挂载设计，但本环境无法实测真实 WebGL identity，仍需 GPU 浏览器验收。

## 真实数据与降级

仓库本地 2026 赛历：22 站、110 条 Session，5 条标记时间已确认，105 条未确认（原始计数见 qa/session-source-status.json）。新的 session summary 仅采纳明确确认且可解析的时间，按时间选择下一节；不会根据计划时间推断正在比赛或已经完赛。

默认当前比赛周/下一站/休赛期选择复用既有 UTC 比赛周边界。手动选择过去赛事显示历史资料。未接通的天气、圈数、赛会消息与实时 Session 状态均明确说明；赛历未在线核验。2026 赛季与 UTC 边界是既有模型限制，跨年与当地日期边界需后续产品化处理。

## 渲染审计与性能策略

继续使用 Three/R3F/Drei、现有地球 shader、纹理、节点、OrbitControls 与摄像机聚焦，没有引入外部专有素材。新的可选 `performanceMode` 仅由 `/home-next` 开启，关闭可选 Bloom 的创建，并禁止欧洲模式升级 8K 日间纹理；原 Atlas 默认行为不变。

| 输入 | 文件传输字节 | RGBA8 + mip 静态估算 |
|---|---:|---:|
| 日间 2048×1024 | 1,912,469 | 10.67 MiB |
| 夜景 3600×1800 | 794,479 | 32.96 MiB |
| 云层 2048×1024 | 829,367 | 10.67 MiB |
| 可选日间 8192×4096 | 24,147,269 | 170.67 MiB |

基础三图约 54.29 MiB；旧桌面欧洲升级若同时保留基础缓存约 224.96 MiB。新配置避免这项可选升级。此为源文件/尺寸推算，不是 GPU 内存实测；旧移动端本来就使用基础图，不能宣称移动端纹理内存改善。

build 输出 `/home-next` First Load JS 447 kB，`/atlas-v2` 445 kB。这是 Next 构建预算，不是网络耗时。Three 依赖负担、3.6K 夜景、持续渲染循环、缓存纹理与移动 GPU 资源释放仍是后续测量重点。没有 FPS、GPU 时间或地球首帧改善结论。

`?measure=1` 输出真实 browser Performance API 的 DOM/navigation 观察值。单次 Next development 样本：

| CSS/桌面尺寸 | responseEnd ms | domInteractive ms | shell commit 观察 ms | 下一 DOM RAF ms |
|---|---:|---:|---:|---:|
| 430×932 CSS 容器 | 422.9 | 499.7 | 1132.4 | 1137.3 |
| 1363×936 桌面 | 108.2 | 236.6 | 1021.5 | 1028.1 |

原始 JSON 在 qa/。样本受开发编译、缓存和请求差异影响，不可作为前后性能对比，不是 paint/Canvas 首帧/FPS。390×844 也进行了工程交互检查，但不纳入持久化性能样本。

## QA 结果

| 检查 | 结果与边界 |
|---|---|
| npm run build | 通过；完整原始日志 qa/build.log |
| npm run typecheck | 通过 |
| npm run lint | 通过 |
| npm run test:unit | 31/31 通过；新增已确认时间筛选、乱序下一节、过去计划时间语义测试 |
| npm run test:e2e -- tests/e2e/home-globe.spec.ts --max-failures=1 | 环境阻塞：缺少 Playwright Chromium executable，首个测试未启动，其余未运行；下载曾返回损坏 ZIP。不得视为通过 |
| git diff --check | 提交前通过 |
| 桌面 1363×936 | 面板关闭/重开、Enter 键操作、Japan 选择与详情链接、当前入口恢复默认赛事通过 |
| 390×844 CSS 容器 | collapsed 顶部 y636，expanded y0；内容可滚动 285px，document/window scroll 保持 0 |
| 430×932 CSS 容器 | 顶部手势拖动上滑展开、箭头收起；全屏高度 932，document/root scroll 0 |
| 选择联动 | 菜单 Japan → SUZUKA/历史赛事/正确详情 URL；当前入口恢复默认 Brazil 数据；同一 select 处理函数供地球节点使用 |
| 对比度 | scoped token 静态计算文字/底色最低 7.34:1；见 qa/token-contrast.json；不代表所有合成像素审查 |
| 真实 WebGL | 云端 Chromium webgl2 不可用，截图为真实降级 UI；无法验证节点点击、旋转切换、Canvas identity、首帧、GPU 内存与 FPS |
| iPhone Safari | 未完成：真实快速反复滑动、轻拖速度阈值、工具栏动态变化、rubber-band、安全区/Home Indicator、低内存与掉帧验收均需真机 |

移动检查为桌面 Chromium 内的指定 CSS 容器，不是移动 UA/触摸硬件或 WebKit。截图显示的是 WebGL 降级而非最终地球视觉，不能据此验收完整 Globe-first 画面。路由滚动锁卸载恢复有源码清理与待运行自动化覆盖；完整跨页浏览器回归尚未验收。

## 截图与评审入口

- `/home-next`：实际适配路由；手机直接打开此路由。
- `/home-next/qa?viewport=390`、`?viewport=430`：CSS 容器工程检查入口。
- [430px 展开态（WebGL 降级）](qa/mobile-430-expanded-fallback.jpg)
- [桌面面板（WebGL 降级）](qa/desktop-open-fallback.jpg)

本轮保持独立预览；正式切换首页、补充在线赛事数据、真实 Safari/GPU 验收均不在已完成声明中。等待视觉与交互评审后再决定下一步。
