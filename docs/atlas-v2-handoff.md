# Atlas V2 归档与开发交接

- 归档时间：2026-07-17（Asia/Shanghai）
- 仓库：`E:\GridDeltaSandbox\pitwallcn`
- 页面：`/atlas-v2`

## 1. 仓库、分支与 HEAD

- 当前分支：`codex/velocity-at-dawn-homepage`
- 归档前 HEAD：`2798e80ff97a5e1817e95112ef29c631dd6d7ab9`
- 归档前最近提交：`chore: retrigger Vercel deployment`
- 工作区在 Atlas V2 开始前已经是 dirty 状态，包含用户对原首页、布局、依赖和视觉素材的大量未提交修改。
- 本次未推送 GitHub、未合并 `main`、未部署，也未回滚任何用户修改。
- Atlas 本地检查点只允许包含可明确归属本次工作的新增文件和本文档。`src/components/site-shell.tsx` 是混合所有权文件，原因见第 13 节。
- 检查点提交完成后，以 `git rev-parse HEAD` 输出作为本地检查点哈希；本文档位于该检查点提交中，不在文档内硬编码自引用哈希。

## 2. 产品目标与视觉方向

`/atlas-v2` 是与现有首页隔离的桌面端首屏原型。目标不是地球背景图，也不是静态视频，而是实时渲染、可交互的 2026 F1 赛季地球：

- 真正的 Three.js 3D 球体，使用可靠的全球观测纹理，不描摹概念图大陆轮廓。
- 全球始终渲染官方 2026 赛历的全部 22 个有效分站节点；只按镜头和交互状态控制标签显隐，不删除节点。
- 通过鼠标或触控旋转、惯性、自转、Raycasting、磁吸聚焦和点击选择，让地球成为赛季导航核心。
- 视觉延续参考素材的深黑蓝、冷白和少量暖金；强调大气、城市夜光、微云、星尘和克制 Bloom，避免卡片堆叠、廉价霓虹和数据看板感。
- 页面只保留左上 `GRIDDELTA CN / SEASON ATLAS`、右下聚焦赛站信息和底部继续滚动提示；积分榜等后续内容仅保留滚动状态接口。

## 3. 已完成的功能

### 3.1 地球与空间环境

- 使用 React Three Fiber 创建真实球体，并复用仓库已有的 `three`、`@react-three/fiber`、`@react-three/drei` 和后处理能力；本次未新增依赖。
- 自定义昼夜混合着色器叠加 NASA Blue Marble 日间纹理与 Black Marble 夜间城市灯光。
- 独立半透明云层、蓝色大气边缘、确定性星尘/空间粒子背景和克制的 Unreal Bloom。
- 22 个站点均通过统一 `lat/lon -> Vector3` 函数贴附在球面，不使用概念图坐标。

### 3.2 交互实现（代码层）

- OrbitControls 支持鼠标拖动、触控拖动、阻尼惯性和距离限制，不能穿入球体。
- 空闲缓慢自转；用户开始交互时停止，结束并等待约 2.4 秒后平滑恢复。
- 每帧对球体做 Raycasting，使用射线与球面交点计算最近赛站和角距离。
- 邻近站点会触发局部光晕增强、粒子聚集、标签显现、节点暖金高亮和轻微镜头靠近。
- 鼠标离开后采用插值恢复；触控可轻触选中，不依赖 hover。
- 点击节点或靠近区域可保持聚焦；欧洲聚焦时显示欧洲全部 9 站标签。
- 密集区域使用固定偏移、分层标签和引导线，未通过删减节点规避拥挤。

### 3.3 页面、状态与质量

- 独立路由 `/atlas-v2`，未直接修改当前首页页面内容。
- 全屏 WebGL 画布、左上品牌、右下当前赛站信息、底部滚动提示均已实现。
- 数据、日期、轮次、状态、Sprint 标记集中在 Typed TypeScript 数据文件，不写死在贴图或组件图片中。
- DPR 按桌面/紧凑屏幕限制；处理窗口变化、文档可见性和组件卸载。
- 支持 `prefers-reduced-motion`，紧凑屏幕降低粒子与特效强度，手机端可以加载。
- 预留滚动阶段状态接口，尚未制作完整积分榜。

## 4. 新增与修改文件

### 4.1 本次 Atlas V2 新增文件

| 文件 | 用途 |
| --- | --- |
| `src/app/atlas-v2/page.tsx` | 独立 App Router 页面与 metadata |
| `src/components/atlas-v2/season-atlas.tsx` | 页面外壳、焦点状态、WebGL/HTML 协调 |
| `src/components/atlas-v2/atlas-globe.tsx` | 地球、站点、Raycasting、OrbitControls、后处理和动画 |
| `src/components/atlas-v2/season-atlas.module.css` | 首屏 HUD、标签、响应式和 reduced-motion 样式 |
| `src/lib/atlas/season-2026.ts` | 2026 全部 22 站 Typed 数据、来源与动态状态 |
| `src/lib/atlas/geo.ts` | 统一经纬度到球面坐标及相关地理计算 |
| `public/atlas-v2/earth-day.png` | NASA Blue Marble 日间地球纹理 |
| `public/atlas-v2/earth-night.jpg` | NASA Black Marble 夜间城市光纹理 |
| `public/atlas-v2/earth-clouds.jpg` | NASA 全球云层纹理 |
| `public/atlas-v2/SOURCES.md` | 纹理、赛历和坐标来源 |
| `docs/atlas-v2-handoff.md` | 本交接记录 |

### 4.2 混合所有权集成文件

- `src/components/site-shell.tsx` 在 Atlas 工作开始前已是用户的未跟踪文件。
- 本次只在其中将沉浸式判断从首页扩展为 `isHomepage || pathname.startsWith("/atlas-v2")`，让 Atlas 不显示常规站点导航壳。
- 因 Git 无法从未跟踪文件中安全拆分“用户原文件”和“两行 Atlas 集成修改”，该文件不应整文件加入 Atlas 检查点；工作区原文件必须保留。

### 4.3 明确未修改的范围

- Atlas 实现没有改写 `src/app/page.tsx` 的首页内容。
- Atlas 实现没有改动 `package.json`、`package-lock.json`、`src/app/globals.css`、`src/app/layout.tsx` 或 `tailwind.config.ts`；这些均是开始 Atlas 前已有的用户修改。
- 未新增 npm 依赖。

## 5. 2026 全部 22 站数据实现状态

统一数据源：`src/lib/atlas/season-2026.ts`。每条记录包含 `id`、`round`、`name`、`country`、`city`、`circuitName`、`latitude`、`longitude`、`region`、`startDate`、`endDate`、`status`、`isSprint`。`status` 由当前时间统一派生。

归档日 2026-07-17 的派生状态为：R1-R9 `completed`，Belgium R10 `current`，R11-R22 `upcoming`。

| R | id | 国家 / 城市 | 赛道 | 日期 | 纬度, 经度 | 区域 | Sprint | 状态 |
| ---: | --- | --- | --- | --- | --- | --- | :---: | --- |
| 1 | `australia` | Australia / Melbourne | Melbourne Grand Prix Circuit | 03-06—03-08 | -37.8497, 144.9680 | APAC | 否 | completed |
| 2 | `china` | China / Shanghai | Shanghai International Circuit | 03-13—03-15 | 31.3389, 121.2197 | APAC | 是 | completed |
| 3 | `japan` | Japan / Suzuka | Suzuka International Racing Course | 03-27—03-29 | 34.8417, 136.5389 | APAC | 否 | completed |
| 4 | `miami` | United States / Miami | Miami International Autodrome | 05-01—05-03 | 25.9581, -80.2389 | AMERICAS | 是 | completed |
| 5 | `canada` | Canada / Montréal | Circuit Gilles-Villeneuve | 05-22—05-24 | 45.5006, -73.5225 | AMERICAS | 是 | completed |
| 6 | `monaco` | Monaco / Monaco | Circuit de Monaco | 06-05—06-07 | 43.7347, 7.4206 | EUROPE | 否 | completed |
| 7 | `barcelona-catalunya` | Spain / Barcelona | Circuit de Barcelona-Catalunya | 06-12—06-14 | 41.5700, 2.2611 | EUROPE | 否 | completed |
| 8 | `austria` | Austria / Spielberg | Red Bull Ring | 06-26—06-28 | 47.2197, 14.7647 | EUROPE | 否 | completed |
| 9 | `great-britain` | United Kingdom / Silverstone | Silverstone Circuit | 07-03—07-05 | 52.0750, -1.0167 | EUROPE | 是 | completed |
| 10 | `belgium` | Belgium / Spa-Francorchamps | Circuit de Spa-Francorchamps | 07-17—07-19 | 50.4372, 5.9714 | EUROPE | 否 | current |
| 11 | `hungary` | Hungary / Budapest | Hungaroring | 07-24—07-26 | 47.5822, 19.2511 | EUROPE | 否 | upcoming |
| 12 | `netherlands` | Netherlands / Zandvoort | Circuit Zandvoort | 08-21—08-23 | 52.3883, 4.5430 | EUROPE | 是 | upcoming |
| 13 | `italy` | Italy / Monza | Autodromo Nazionale Monza | 09-04—09-06 | 45.6206, 9.2894 | EUROPE | 否 | upcoming |
| 14 | `madrid` | Spain / Madrid | Madring | 09-11—09-13 | 40.4636, -3.6178 | EUROPE | 否 | upcoming |
| 15 | `azerbaijan` | Azerbaijan / Baku | Baku City Circuit | 09-24—09-26 | 40.3725, 49.8533 | EURASIA | 否 | upcoming |
| 16 | `singapore` | Singapore / Singapore | Marina Bay Street Circuit | 10-09—10-11 | 1.2914, 103.8640 | APAC | 是 | upcoming |
| 17 | `united-states` | United States / Austin | Circuit of The Americas | 10-23—10-25 | 30.1328, -97.6411 | AMERICAS | 否 | upcoming |
| 18 | `mexico` | Mexico / Mexico City | Autódromo Hermanos Rodríguez | 10-30—11-01 | 19.4042, -99.0887 | AMERICAS | 否 | upcoming |
| 19 | `sao-paulo` | Brazil / São Paulo | Autódromo José Carlos Pace | 11-06—11-08 | -23.7011, -46.6972 | AMERICAS | 否 | upcoming |
| 20 | `las-vegas` | United States / Las Vegas | Las Vegas Strip Circuit | 11-19—11-21 | 36.1100, -115.1618 | AMERICAS | 否 | upcoming |
| 21 | `qatar` | Qatar / Lusail | Lusail International Circuit | 11-27—11-29 | 25.4900, 51.4542 | MIDDLE_EAST | 否 | upcoming |
| 22 | `abu-dhabi` | United Arab Emirates / Abu Dhabi | Yas Marina Circuit | 12-04—12-06 | 24.4702, 54.6061 | MIDDLE_EAST | 否 | upcoming |

自动不变量检查结果：22 轮、轮次 1—22 连续、欧洲 9 站、Sprint 6 站、Belgium 为 Round 10、Madrid/Madring 属于欧洲，全部通过。

欧洲 9 站完整实现为 R6 Monaco、R7 Barcelona-Catalunya、R8 Austria、R9 Great Britain、R10 Belgium、R11 Hungary、R12 Netherlands、R13 Italy、R14 Madrid/Madring。全球节点始终保留全部 22 个；欧洲聚焦只改变标签显隐和聚焦反馈。

## 6. 实际浏览器测试结果

昨晚 Browser QA 子任务已完成其原子检查，但 in-app Browser 初始化和清理重试均失败，原始错误为：

```text
Cannot redefine property: process
```

因此没有伪造浏览器结果，也没有使用截图替代测试。遵守“不要生成或上传截图”的归档要求，本轮没有新增截图。当前可确认的是开发服务器编译和 HTTP 可达性；以下交互仍需真实浏览器验收。

| 项目 | 代码实现 | 实际浏览器结果 |
| --- | --- | --- |
| 鼠标拖动旋转 | OrbitControls 已接入 | 未执行，待验收 |
| 触控拖动/轻触 | touch controls 与 tap selection 已接入 | 未执行，待真机或触控模拟验收 |
| 松手惯性 | damping 已接入 | 未执行，待验收衰减手感 |
| 空闲自转与平滑恢复 | 交互暂停、约 2.4 秒后插值恢复已接入 | 未执行，待验收时序与平滑度 |
| 悬停/Raycasting | 每帧球面射线与最近站计算已接入 | 未执行，待验收命中范围 |
| 磁吸聚焦 | 局部光晕、粒子、标签、高亮和镜头靠近已接入 | 未执行，待验收强度和跳变 |
| 点击选择 | 节点/球面选择状态已接入 | 未执行，待验收保持与取消逻辑 |
| 缩放限制 | min/max distance 已接入 | 未执行，待验收滚轮边界和不可穿球 |
| 欧洲 9 站标签 | 欧洲聚焦时全部 9 站进入标签层 | 未执行，待验收避让和引导线 |

已获得的运行证据：2026-07-16 开发服务器成功编译 `/atlas-v2`（1755 modules），`GET http://127.0.0.1:3000/atlas-v2` 返回 HTTP 200。归档时端口 3000 已停止监听。

## 7. TypeScript、lint 与 production build

归档恢复后于 2026-07-17 重新运行：

1. Atlas 作用域 ESLint：通过。

   ```powershell
   & .\node_modules\.bin\eslint.cmd src/app/atlas-v2 src/components/atlas-v2 src/lib/atlas src/components/site-shell.tsx
   ```

2. Atlas 数据不变量：通过。结果为 `RoundCount=22`、`RoundsSequential=True`、`EuropeCount=9`、`SprintCount=6`、`BelgiumRound10=True`、`MadridEurope=True`。

3. 全量 TypeScript：失败，仅发现以下既有首页错误。

   ```text
   src/components/scene-background.tsx(775,7): error TS17001: JSX elements cannot have multiple attributes with the same name.
   ```

   判断：`src/components/scene-background.tsx` 在 Atlas 工作开始前就是用户已有的未跟踪首页文件；其 `<Canvas>` 在第 774、775 行重复声明 `className`。错误不来自 Atlas 文件。按归档要求今晚/归档阶段不修复。

4. 全量 lint：失败，同一既有错误。

   ```text
   E:\GridDeltaSandbox\pitwallcn\src\components\scene-background.tsx
     775:7  error  No duplicate props allowed  react/jsx-no-duplicate-props

   ✖ 1 problem (1 error, 0 warnings)
   ```

5. Production build：优化编译阶段成功（10.1 秒），随后 lint/type 验证阶段因同一重复 prop 失败。

   ```text
   ./src/components/scene-background.tsx
   775:7  Error: No duplicate props allowed  react/jsx-no-duplicate-props
   ```

   同次构建还出现 SWC 原生模块被其他进程占用的警告，Next.js 下载并使用 wasm fallback 后仍完成优化编译：

   ```text
   Attempted to load @next/swc-win32-x64-msvc, but an error occurred:
   The process cannot access the file because it is being used by another process.
   ```

   未为通过检查而大范围改代码。

## 8. 尚未完成、存在问题或需重新调整

- 最重要缺口是真实浏览器交互验收尚未完成；代码存在不等于拖动、惯性、磁吸、点击和缩放手感已通过。
- 需要观察 WebGL 控制台、纹理加载、Bloom 和显卡负载，尤其是 Windows/Chrome 桌面端。
- 欧洲 9 站的密集标签虽然已有偏移、层级和引导线，仍需在实际 1440p/1080p 画面中调整避让。
- 局部磁吸光晕、粒子聚集和镜头靠近强度尚未做视觉验收，可能需要克制化微调。
- 手机端仅实现可打开和降级策略，未做完整触控视觉适配。
- 滚动状态接口只有占位，赛季数据/积分榜尚未实现，符合第一阶段范围。
- 全仓 TypeScript/lint/build 被用户既有的重复 `className` 阻断；明日只允许做最小范围 JSX 属性修复。
- Production build 出现 SWC 文件占用警告；修复 JSX 后应在确认没有本仓库 dev server 占用时复跑，以判断警告是否复现。
- Atlas 检查点不包含用户原有 `package.json`/`package-lock.json` 中的 Three 依赖修改，也不包含混合所有权 `site-shell.tsx`；恢复时必须保留当前工作区。

## 9. 恢复开发后的优先任务

1. **核心交互浏览器验收**：启动 `/atlas-v2`，依次验证鼠标拖动、惯性、自转暂停/恢复、hover/Raycasting、磁吸、点击保持、滚轮缩放边界和离开后的平滑恢复；记录真实控制台与行为结果，不用截图代替。
2. **触控与欧洲密集区验收**：验证轻触选中不依赖 hover，并聚焦欧洲确认 9 个节点全部保留、标签避让/引导线可读；只修复验收发现的 Atlas 核心问题。
3. **最小修复既有 JSX 错误**：在完成 `/atlas-v2` 核心交互验收之后，只解决 `src/components/scene-background.tsx:775` 的重复 `className`/对应 JSX 属性，不重做原首页、不改变视觉设计、不顺带重构。
4. **最终全仓检查**：重新运行全量 TypeScript、全量 lint 和 production build，确认重复属性修复后全仓结果，并复核 SWC 文件占用警告是否复现。
5. **有证据后再微调**：仅基于实际浏览器结果调整欧洲标签、磁吸强度、Bloom 或性能参数；继续保持 22 个节点，不扩展积分榜等新功能。

## 10. 启动命令与准确地址

PowerShell：

```powershell
Set-Location 'E:\GridDeltaSandbox\pitwallcn'
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

打开：`http://127.0.0.1:3000/atlas-v2`

结束服务器：在启动服务器的终端按 `Ctrl+C`。归档时没有进程监听端口 3000。

## 11. 地图、纹理和参考素材

### 11.1 仓库内真实地球纹理

- `public/atlas-v2/earth-day.png`：NASA Visible Earth, Blue Marble（`https://visibleearth.nasa.gov/images/57730/the-blue-marble-land-surface-ocean-color-and-sea-ice`）
- `public/atlas-v2/earth-night.jpg`：NASA Earth Observatory / Suomi NPP, Black Marble 2012（`https://earthobservatory.nasa.gov/images/79765/night-lights-2012-map`）
- `public/atlas-v2/earth-clouds.jpg`：NASA Visible Earth global cloud composite（`https://visibleearth.nasa.gov/images/57747/blue-marble-clouds`）
- 完整来源记录：`public/atlas-v2/SOURCES.md`

赛历与坐标来源包括 Formula 1 官方 2026 赛历、FIA 修订/取消公告、FIA Sprint 公告、Wikidata P625 赛道实体坐标，以及 Madring 的 IFEMA 官方位置图。概念图未作为地理数据源。

### 11.2 用户提供的视觉参考（仓库外，只读）

- `C:\Users\Administrator\Desktop\ScreenRecording_07-14-2026 12-49-04_1.MP4`
- `C:\Users\Administrator\Desktop\c35f223e06bdb9d3b4e7fed718455bf7.png`
- `C:\Users\Administrator\Desktop\1b5701216540cd6dd73ba74a479eb10b.png`
- `C:\Users\Administrator\Desktop\e9c992e5c1c679e7ccd57e8c0ef3d2c4.png`
- `C:\Users\Administrator\Desktop\8103f91a15fd45213b4c0f91a12bed73.jpg`
- `C:\Users\Administrator\Desktop\a2b4f81679e9d7cf825299539da53034.jpg`
- `C:\Users\Administrator\Desktop\833cc3d9e076080ade6a9ec004affe83.jpg`
- `C:\Users\Administrator\Desktop\f98d3051cd2144ca8f914b8d258c3490.jpg`
- `C:\Users\Administrator\Desktop\72cf8fc44d4d3b2220c6c4c8ee80302d.jpg`
- `C:\Users\Administrator\Desktop\0ff12519f0f24e035ee4e671b6fb5c98.jpg`

视频分析临时帧曾位于 `C:\Users\Administrator\AppData\Local\Temp\pitwall-atlas-reference-frames`，不在仓库、不进入提交。仓库根目录已有的 `europe-3d-terrain-base.png`、`europe-focus-review.png`、`european-circuit-map-review*.png`、`global-core-review-v3.png` 是 Atlas 开始前已有的用户素材，绝不能覆盖。

## 12. Git 状态、安全与构建产物

归档前 `git status --short`：

```text
 M package-lock.json
 M package.json
 M src/app/globals.css
 M src/app/layout.tsx
 M src/app/page.tsx
 D src/components/cinematic-homepage.tsx
 D src/components/hud-grid-canvas.tsx
 M tailwind.config.ts
?? .playwright-cli/
?? codex-dev-server.err.log
?? codex-dev-server.out.log
?? europe-3d-terrain-base.png
?? europe-focus-review.png
?? european-circuit-map-review-v2.png
?? european-circuit-map-review.png
?? global-core-review-v3.png
?? output/
?? public/atlas-v2/
?? src/app/atlas-v2/
?? src/components/atlas-v2/
?? src/components/home-smooth-scroll.tsx
?? src/components/immersive-homepage.tsx
?? src/components/scene-background.tsx
?? src/components/site-shell.tsx
?? src/lib/atlas/
```

归档前 `git diff --stat`（Git 默认不统计未跟踪 Atlas 文件）：

```text
 package-lock.json                     | 662 +++++++++++++++++++++++++++++++++-
 package.json                          |   7 +-
 src/app/globals.css                   |  94 ++++-
 src/app/layout.tsx                    |  59 +--
 src/app/page.tsx                      |   4 +-
 src/components/cinematic-homepage.tsx | 647 ---------------------------------
 src/components/hud-grid-canvas.tsx    | 116 ------
 tailwind.config.ts                    |   6 +
 8 files changed, 759 insertions(+), 836 deletions(-)
```

安全检查结论：

- 仓库范围内只发现已有的 `.env.example`；`git status` 中没有 `.env`、密钥、凭据或 token 文件。
- `.next/` 会由 Next build 生成但被 Git 忽略，不加入检查点。
- 工作区存在 Atlas 开始前已有的 `.playwright-cli/`、`output/` 和 `codex-dev-server.*.log` 等 QA/日志产物。因“不得删除用户原有文件”，本次不清理它们，但全部排除在 Atlas 检查点外。
- Atlas 归档时自己创建的临时服务器日志、响应头和 HTML 已安全删除；端口 3000 未监听。
- 检查点暂存前必须以允许列表校验，只允许第 4.1 节文件；不得使用 `git add .`。

## 13. 用户此前已有且绝不能覆盖的修改

以下状态在 Atlas 工作开始前已经存在，所有权属于用户：

- 已修改：`package-lock.json`、`package.json`、`src/app/globals.css`、`src/app/layout.tsx`、`src/app/page.tsx`、`tailwind.config.ts`。
- 已删除：`src/components/cinematic-homepage.tsx`、`src/components/hud-grid-canvas.tsx`。不要恢复这些删除。
- 已有未跟踪源码：`src/components/home-smooth-scroll.tsx`、`src/components/immersive-homepage.tsx`、`src/components/scene-background.tsx`、`src/components/site-shell.tsx`。
- 已有未跟踪 QA/素材：`.playwright-cli/`、`output/`、`codex-dev-server.err.log`、`codex-dev-server.out.log`、`europe-3d-terrain-base.png`、`europe-focus-review.png`、`european-circuit-map-review-v2.png`、`european-circuit-map-review.png`、`global-core-review-v3.png`。
- `package.json`/`package-lock.json` 中的 Three.js、React Three Fiber、Drei 和相关版本属于用户此前修改；Atlas 仅复用，不应把依赖文件归入本次提交。
- `src/components/site-shell.tsx` 是混合所有权：必须保留整份用户文件和当前 Atlas 判断行，但不能把整份未跟踪文件错误归为 Atlas 新文件。

恢复开发时先重新阅读本节和 `git status`；禁止 checkout/reset/clean，禁止覆盖首页，禁止删除上述文件。
