# Atlas V2 归档与开发交接

- 归档时间：2026-07-17（Asia/Shanghai）
- 仓库：`E:\GridDeltaSandbox\pitwallcn`
- 页面：`/atlas-v2`

## 1. 仓库、分支与 HEAD

- 当前分支：`codex/velocity-at-dawn-homepage`
- 归档前 HEAD：`2798e80ff97a5e1817e95112ef29c631dd6d7ab9`
- 归档前最近提交：`chore: retrigger Vercel deployment`
- 第一阶段归档检查点：`af2258bb`（`wip: checkpoint atlas-v2 interactive globe`）。
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

**最终状态（2026-07-17）：已完成真实浏览器验收。** 已失效的 in-app Browser QA 没有再次使用；最终使用本机 Microsoft Edge 的 Playwright 库直接驱动真实 Chromium/WebGL2 上下文，临时脚本位于仓库外，未生成截图、视频或仓库测试产物。

最终桌面测试环境为 1440×900、DPR 1、headless Edge/WebGL2：

| 项目 | 最终实际结果 |
| --- | --- |
| 页面与全屏 WebGL | HTTP 200；CSS 画布与绘制缓冲均为 1440×900；WebGL 2.0 上下文正常 |
| 22 个全球节点 | `data-atlas-node-count=22`，Three HTML 标签层检测到 R01—R22 共 22 个标签 |
| 欧洲 9 站 | 选择 Dutch GP 后 R06—R14 九个欧洲标签全部可见，包括 Madrid/Madring |
| 空闲自转 | Belgium 标签 1.2 秒位移 7.588 px，确认实时自转 |
| 磁吸 hover | 从 Belgium 靠近 Netherlands 后右下焦点切换为 Dutch GP；Belgium 邻域显现 R06—R13 标签 |
| 节点点击与镜头聚焦 | Dutch GP 点击后出现 `LOCKED FOCUS` 和 `RELEASE FOCUS`，欧洲镜头过渡完成 |
| 缩放边界 | 近端标签宽度 633.634 px、远端 201.660 px；继续同向滚轮后两端变化均为 0，确认上下限生效 |
| 鼠标拖动 | 标签位移 159.597 px，确认球体旋转 |
| 松手惯性 | 抬手后 350 ms 继续位移 31.184 px |
| 自转自然恢复 | 冷却后 1.2 秒继续位移 0.217 px，确认自动恢复而非跳变 |
| 手机基本打开 | 390×844、DPR 1 下 HTTP 200、WebGL 画布正常、22 标签全部挂载 |
| 触控轻触/拖动 | 轻触节点成功锁定；CDP 原生触控拖动产生 155.601 px 位移 |
| reduced motion | 1280×800、`prefers-reduced-motion: reduce` 下 1.2 秒空闲位移为 0 |
| 运行时错误 | `pageerror=0`、场景资源 `requestfailed=0`；最终无 Three.js shader 编译错误 |

真实浏览器首次运行发现昼夜地球 fragment shader 中自定义 `luminance()` 与 Three.js 内置 GLSL 函数重名，导致材质无法编译；已重命名为 `atlasLuminance()`，最终复测通过。另发现触控 tap 的 `pointerup` 可能早于下一帧 Raycast，已改为抬手事件内同步计算最近节点，移动端复测通过。

### 6.1 归档阶段历史记录

昨晚 Browser QA 子任务已完成其原子检查，但 in-app Browser 初始化和清理重试均失败，原始错误为：

```text
Cannot redefine property: process
```

因此归档阶段没有伪造浏览器结果，也没有使用截图替代测试。下表保留的是归档当时的历史状态，已由上方最终实测取代。

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

### 7.1 最终检查（2026-07-17）

- 唯一一次局部 TypeScript：通过。临时配置仅覆盖 Atlas、`site-shell.tsx` 和最小修复的 `scene-background.tsx`，检查后已删除。
- 唯一一次局部 ESLint：通过。范围为 `src/app/atlas-v2`、`src/components/atlas-v2`、`src/lib/atlas`、`src/components/scene-background.tsx`、`src/components/site-shell.tsx`。
- 最终全仓 TypeScript：`tsc --noEmit --incremental false` 通过。
- 最终全仓 lint：`npm.cmd run lint` 通过，0 errors。
- 最终 production build：`npm.cmd run build` 通过；15/15 静态页面生成完成，`/atlas-v2` 静态输出为 261 kB、First Load JS 364 kB。
- 构建仍打印一次 `@next/swc-win32-x64-msvc` 文件被其他进程占用的警告，但 wasm fallback 完成优化编译、类型检查、lint 和静态生成，退出码为 0。该警告不再阻断构建。

旧首页重复属性已做唯一允许的最小修复：把 `src/components/scene-background.tsx` 原第 774、775 行的两个 `className` 合并为一个，保留 `!pointer-events-none absolute inset-0 z-0 h-full w-full`，未改变视觉或重构首页。

### 7.2 归档阶段历史结果（问题已解决）

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

- 核心功能和自动化交互标准已完成；仍需人在真实显示器上主观确认电影感、Bloom 克制度、城市夜光层次和欧洲密集标签的最终审美。按要求没有生成截图，因此本交接不把自动化数值当作视觉签字。
- 自动化使用本机 Edge/WebGL2 和 390×844 触控模拟；物理手机、不同 GPU 和 Safari 仍属于后续兼容性抽查范围。
- 浏览器控制台仍出现一条通用静态资源 HTTP 404 日志，但 `pageerror=0`、`requestfailed=0`，地球三张纹理和场景均正常；大概率为站点 favicon，需后续按网络 URL 精确确认，不阻断 Atlas。
- Production build 仍出现 SWC 原生模块文件占用警告，但最终退出码为 0；若以后追求干净日志，可单独排查 Windows 文件锁，不应借机重构页面。
- 22 条坐标已统一、合法并通过运行验证，但当前来源元数据只指向 Wikidata 总入口，尚未逐站记录 QID；这是数据可追溯性增强项，不是当前显示阻塞。
- 滚动状态接口仍只有占位，赛季数据/积分榜未实现，符合 Global Core 第一阶段范围。
- `site-shell.tsx` 与 `scene-background.tsx` 都是用户此前已有的未跟踪文件。Atlas 集成判断和重复 `className` 最小修复保留在工作区，但不能为了检查点而把用户整份文件错误归入本次提交。

## 9. 无人值守完成记录与后续优先级

1. **已完成：核心交互浏览器验收。** 拖动、惯性、自转、恢复、hover、磁吸、点击、镜头、缩放和欧洲 9 站均通过。
2. **已完成：移动基本触控与 reduced-motion。** 390×844 加载、tap、touch drag 和 reduced motion 均通过。
3. **已完成：最小 JSX 修复。** 仅合并重复 `className`，未更改首页设计。
4. **已完成：一次局部检查与一次最终全仓检查。** TypeScript、lint、build 全部通过。
5. **后续人工优先：视觉签字。** 在真实桌面 GPU 上查看 `http://127.0.0.1:3000/atlas-v2`，只记录主观视觉问题；若无阻塞，不再扩展第一阶段范围。

## 10. 启动命令与准确地址

PowerShell：

### Latest update — 2026-07-19: race-driven focus and responsive layout

- The typed 22-round calendar now chooses the race active during its inclusive UTC weekend, otherwise the next race; it uses Australia before the season and Abu Dhabi during the post-season. Belgium is not hard-coded.
- The scene requests automatic focus once after load. Manual interaction cancels the flight; `RETURN TO CURRENT RACE` clears manual focus and requests the automatic target again.
- Global mode keeps one Europe-region entry rather than nine Europe nodes. An automatic European race warms that entry while the information panel names the real race; entering Europe selects that circuit and only hover/selected labels are shown.
- Idle nodes are small dim neutral-grey points. Current/next is warm, with slow breathing under 8%; labels, leaders and raycast targets share the same anchor and disappear when back-facing or viewport-outside.
- `src/lib/atlas/visibility.ts` centralizes projected-viewport, horizon and adaptive-label placement helpers. Responsive CSS now includes safe-area-aware portrait and low-height landscape layouts, `100dvh`, and horizontal clipping.

Automated verification passed: calendar/visibility pure checks (Belgium during 2026-07-19, Hungary after; pre/post-season; 22 races; nine Europe races; Belgium R10), static route/CSS checks, TypeScript (after one one-line dead-branch correction), ESLint, and `npm.cmd run build` (all 15 pages; `/atlas-v2` static, 321 kB route size, 423 kB first-load JS).

This update deliberately did not run a local browser, headless browser, screenshot probe, or WebGL automation. Awaiting user Preview verification: automatic race focus, post-weekend next-race change, Europe entry and nine internal nodes, `RETURN TO CURRENT RACE`, and 390x844 / 844x390 / 430x932 / 1440x900 visual layouts with no horizontal overflow.

```powershell
Set-Location 'E:\GridDeltaSandbox\pitwallcn'
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

打开：`http://127.0.0.1:3000/atlas-v2`

结束服务器：在启动服务器的终端按 `Ctrl+C`。归档时没有进程监听端口 3000。

## 10A. Atlas render finishing — 2026-07-20

### Daylight root cause and correction

- The solar coordinate system was already correct: `getSolarDirection()` and `latLonToVector3()` both use the same static world coordinates, and OrbitControls moves the camera rather than rotating the Earth mesh. At `2026-07-19T16:09:00.000Z`, the reference test confirms New York / Los Angeles are day-side while Beijing / Singapore are night-side.
- The real surface-color failure was a second sRGB-to-linear conversion in `src/components/atlas-v2/atlas-globe.tsx`. `earth-day*.png` is correctly configured as `THREE.SRGBColorSpace`, so WebGL already returns a linear sample; the shader additionally called `sRGBTransferEOTF(...)`, crushing the day albedo and making the terminator appear visually ineffective. The duplicate conversion is removed.
- The Earth shader now uses ACES Filmic tone mapping, a 0.28 night-surface floor, a 0.94 saturation mix, neutral cloud color, restrained warm city lights, and a thin atmosphere. The day/night mix remains driven by the actual world-space solar dot product; camera movement does not move daylight geographically.

### Grid source and removal

- The screen-wide point grid came from `.grain` in `src/components/atlas-v2/season-atlas.module.css`: two `radial-gradient(...)` layers with `background-size: 7px 7px, 9px 9px`, `mix-blend-mode: screen`, and `z-index: 3` placed above the canvas.
- Production sets that layer to `opacity: calc(0.17 * var(--atlas-grid-opacity, 0))`, so it is off by default rather than hidden under a dark overlay. The same selector is `display: none` under the mobile breakpoint.

### Production render defaults

`src/lib/atlas/render-settings.ts` owns the production constants:

```text
exposure: 1.08
nightSurfaceFloor: 0.28
daylightStrength: 1.00
saturation: 0.94
cityLightsIntensity: 0.38
cloudsOpacity: 0.80
atmosphereAlpha: 0.72
bloomStrength: 0.08
vignetteStrength: 0.72
gridOverlay: false
```

### Preview/development calibration panel

- `src/components/atlas-v2/atlas-debug-panel.tsx` is lazy loaded only when both conditions are true: `NEXT_PUBLIC_ATLAS_DEBUG=1` and `/atlas-v2?atlasDebug=1` is requested. A normal `/atlas-v2` response does not render its DOM or request its dynamic code chunk.
- The control panel is session-only. It does not use a database, local storage, or any persisted state. It can change exposure, night floor, daylight, saturation, city lights, clouds, atmosphere, bloom, vignette, grid overlay, live/fixed UTC, and day-factor grayscale; Reset restores the constants above and Copy Settings serializes the current session values.
- Keep `NEXT_PUBLIC_ATLAS_DEBUG` unset for the Vercel Production environment. Set it only in Preview/development when a calibration URL is explicitly needed.

### Mobile/performance status and remaining human review

- Existing Atlas DPR limits remain `1.25` for compact/coarse-pointer screens and `1.7` for desktop. Orientation changes now resync renderer dimensions and perspective aspect from the canvas bounds; the existing projection helpers still hide back-facing and safe-viewport-outside markers, labels, and leaders rather than pinning them to an edge.
- No browser automation, headless Edge, screenshot probe, or new QA script was used in this pass. Static and pure-code verification cannot certify subjective color, Bloom, Safari safe-area behavior, or touch feel. Review these on iPhone Preview at 390x844, 430x932, and 844x390 before changing production defaults again.

### Final verification — 2026-07-20

- `node --test src/lib/atlas/solar.test.ts`: passed 3/3. The new 16:09 UTC reference asserts that New York and Los Angeles are day-side while Beijing and Singapore are night-side.
- `npx.cmd tsc --noEmit --pretty false --incremental false`: passed with exit code 0.
- `npm.cmd run lint`: passed with exit code 0.
- `npm.cmd run build`: passed with exit code 0. Next.js 15.5.19 compiled and generated all 15 pages; `/atlas-v2` is static at 324 kB (427 kB First Load JS).

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

## 14. 2026-07-18 交互稳定化与线上预览检查点

本轮基于 `b6481dd192830a97398385b6c071f5de4cf0c267` 完成以下修复：

- 磁吸 raycast 改为单一可见目标状态机，加入进入/退出迟滞、90–110ms 获取/切换稳定时间、220ms 最短保持时间与 180ms 释放延迟；相邻节点直接平滑切换，不再先回到 `null`。
- 节点视觉明确分为 `idle / current / hovered / selected`，限制光晕、粒子、emissive 与 Bloom 峰值；普通节点不再高频脉冲。
- 导航状态明确为 `global → europe-focus → station-focus`；全球视图隐藏欧洲 9 个独立节点，只保留 `EUROPE SEASON · 9 ROUNDS` 入口。
- 欧洲模式使用 Natural Earth 1:50m 公共领域真实地理要素生成贴合球面曲率的轻微抬升板块；欧洲 9 站仍从统一 2026 赛历数据按真实经纬度生成。
- 节点、标签与引导线由同一个 station id / `StationAnchor` 绑定，每帧按相机重新投影并隐藏背面标签。
- 任意非全球状态固定显示 `← BACK TO GLOBE`；按钮与 Esc 都会清除 hover/selection、覆盖当前相机 tween，并平滑恢复全球相机、缩放范围与自动旋转。
- 夜面提高最低 albedo，降低城市光、云层、大气边缘与局部聚焦亮度，避免北美夜面不可读及区域过曝。

新增数据与来源：

- `src/lib/atlas/europe-50m.json`：从 Natural Earth 1:50m Geography Regions Polygons v5.1.2 提取的 Europe continent feature。
- `src/components/atlas-v2/europe-plate.tsx`：运行时将真实经纬度多边形三角化、曲面细分并贴合地球球面。
- 来源与公共领域条款已补充到 `public/atlas-v2/SOURCES.md`。

发布前的唯一验证：

- `npx.cmd tsc --noEmit --pretty false`：通过，0 错误。
- `npm.cmd run build`：通过；Next.js 15.5.19 成功编译、类型/ESLint 阶段通过并生成全部 15 个静态页面，`/atlas-v2` 为静态路由。Windows 本机 SWC 原生模块出现一次文件占用警告，但 Next fallback 完成了成功构建。
- 按用户最新指令停止 headless Edge、本地 WebGL 与截图探针；没有把临时脚本、截图或测试输出加入提交，也不在本文宣称未完成的自动化触控验收。

自包含发布范围说明：第 13 节记录的首页/外壳源码原先属于用户既有未提交修改；本轮用户明确要求推送后的干净检出可以完成全仓 TypeScript 与 production build。因此发布检查点需要一并保存 `layout.tsx → site-shell.tsx` 以及 `page.tsx → immersive-homepage.tsx → scene-background.tsx / home-smooth-scroll.tsx` 的完整依赖闭包，并保留对应 package、全局样式、Tailwind 与旧组件删除状态。QA 目录、日志、参考 PNG、`output/` 和真实 `.env` 仍全部排除。

## 15. 最新交接 — 2026-07-29

### 当前状态

`/atlas-v2` 的主地球、昼夜纹理、云层、大气、赛站节点、赛事信息和 Preview 调试面板均已可用。用户已确认主地球不再呈现“云球/黑球”，当前工作重点是站点识别性，而不是继续调整地球贴图或渲染参数。

### 本轮已提交的修复

| Commit | 内容 |
| --- | --- |
| `2f4f7e95` | 移除主地球 fragment shader 中手工重复注入的 `tonemapping_pars_fragment` 和 `colorspace_pars_fragment`；Three.js 会在 `toneMapped` 材质中自动注入这些声明。该修复消除了 `LinearTransferOETF`、`sRGBTransferOETF`、`toneMappingExposure` 与各 Tone Mapping 函数的重复定义。与此同时，城市灯光淡出范围改为日出前完成，避免白昼面仍显示夜景灯光。 |
| `4a3287ea` | 所有当前可见的赛站标签默认显示，不再仅在 hover/selected 时出现；当前站点标签不透明度提高到 `0.78`，普通站点为 `0.42`，hover/selected 仍具有更强强调。 |

涉及代码仅为 `src/components/atlas-v2/atlas-globe.tsx`。没有改动地球贴图、校准默认参数、云层、大气、Bloom、相机控制、节点坐标或赛事 UI。

### 验证与部署

- `npm.cmd run build` 于 2026-07-29 通过，`/atlas-v2` 仍为静态路由。
- 本机构建期间可能出现 `api.openf1.org` 连接超时日志；构建退出码仍为 0，和 Atlas 渲染无关。
- Shader 修复及城市灯光修复曾部署到 Preview：`https://pitwallcn-2kly3g5t6-s8k8ps26k6-uis-projects.vercel.app/atlas-v2?atlasDebug=1`。
- 标签默认显示的提交已完成本地构建，但 Vercel CLI 两次在等待远端部署状态时超时，未能确认其 Preview URL。需要在网络恢复后重新部署并人工验收：

```powershell
Set-Location 'E:\GridDeltaSandbox\pitwallcn'
npx.cmd vercel deploy --yes
```

不要加 `--prod`。调试面板仅使用 Preview/development 环境的 `NEXT_PUBLIC_ATLAS_DEBUG=1`；不要把该变量加入 Production。

### 下一位维护者应先做的事

1. 部署 `4a3287ea` 所在分支的 Preview。
2. 打开 `/atlas-v2?atlasDebug=1`，确认普通赛站标签在前景球面默认可读、当前站点明显更亮，且 hover/selected 仍正常。
3. 若标签密度需要继续微调，只调整 `RaceLabel` 的 `emphasisOpacity` 或标签布局策略；不要重新隐藏默认标签，也不要借机改动主地球 shader、贴图或相机系统。

### 工作区保护

当前仍存在用户已有且未归属于 Atlas 提交的 `.gitignore` 修改、`.playwright-cli/`、`output/`、开发服务器日志和若干审阅 PNG。继续工作时不得执行 `git reset --hard`、`git clean` 或批量暂存；只暂存明确属于当前任务的文件。

## Atlas V2 continuation checkpoint — 2026-08-01

The earlier sections are legacy-encoded. This English addendum is authoritative for the current checkpoint.

- UTC solar state is calculated in `src/lib/atlas/solar.ts`; it refreshes every 45 seconds, on visibility recovery, and on return-to-current focus. Day factor, night lights, clouds, and atmosphere share the same `latLonToVector3` world-space direction.
- `?atlasDebug=1` (Preview only when `NEXT_PUBLIC_ATLAS_DEBUG=1`) exposes UTC, solar subpoint, normalized direction, a day-factor grayscale switch, and a day-texture-only switch. The latter disables clouds, atmosphere, and bloom for direct albedo diagnosis. Settings are session-only.
- Global rendering uses the 2K NASA Blue Marble texture; Europe focus promotes the existing 8K texture. Photographic textures use sRGB color space, mipmaps, linear filtering, and capped anisotropy. No new dependency was added.
- Added the typed circuit registry and event/calendar association layer: `src/lib/atlas/circuit-registry.ts` and `src/lib/atlas/events-2026.ts`. Calendar entries carry `eventId` and `circuitId`; registry statuses support active, reserve, inactive, historic, and retired. Unknown metrics/outlines remain explicitly unavailable instead of being invented.
- Added monthly structured-data monitoring at `scripts/atlas-calendar-check.mjs` and `.github/workflows/atlas-calendar-check.yml`. It uses bounded retries, writes a candidate report, and only creates an independent draft PR when changes are detected. Source failures leave the current calendar intact.
- LOCKED FOCUS now uses the registry for timezone and verified length/lap data, indicates next-session timetable availability, keeps stable event/circuit identifiers, and supports mobile collapse/expand.

Verification for this checkpoint:

- `node --test --experimental-strip-types src/lib/atlas/solar.test.ts` — passed (4 tests, including fixed `2026-07-19T16:09:00Z` Americas/Asia reference).
- `npx.cmd tsc --noEmit --incremental false` — passed.
- `npm.cmd run lint` — passed.
- `npm.cmd run build` — passed; `/atlas-v2` generated successfully.

Remaining manual work: verify albedo-only and grayscale debug states, high-resolution Europe promotion, and LOCKED FOCUS placement once in a real desktop and 390×844 Preview. The user-owned `.gitignore`, screenshots, logs, `output/`, and `.playwright-cli/` remain outside Atlas commits and must not be overwritten or deleted.

## Atlas V2 continuation — 2026-08-01 session and texture follow-up

- `src/lib/atlas/events-2026.ts` now exposes the Session timetable alongside each event and season-calendar entry. It maps the existing verified local 2026 calendar by stable circuit aliases (`madrid` and `sao-paulo` included) and preserves `isTimeConfirmed` instead of fabricating times.
- `season-atlas.tsx` uses the matching event id to show the next upcoming (or last completed) Session and its local time in LOCKED FOCUS. The existing timezone and circuit metric fields remain unchanged.
- The earth always renders the 2K albedo first. On non-compact hardware whose `maxTextureSize` is at least 8192, Europe focus asynchronously promotes the albedo to `earth-day-8192.png`; loader failure keeps the 2K texture in place. Mobile/coarse-pointer views never request the 8K asset.
- `atlas-globe.tsx` retains a single final Three.js tone-mapping/color-space output path; no manual built-in tone-mapping or transfer functions were added.

Validation after this follow-up:

- `npx.cmd tsc --noEmit --incremental false` — passed.
- `npm.cmd run lint` — passed.
- `npm.cmd run build` — passed; `/atlas-v2` generated successfully. The build emitted non-fatal OpenF1 network `ECONNRESET` logs from unrelated server data helpers; exit code remained 0.

Known limits remain explicit: no circuit outline is rendered when verified outline geometry is unavailable, and real-device visual confirmation of the 2K→8K promotion, albedo-only debug mode, and compact LOCKED FOCUS still belongs to manual Preview review.

The monthly calendar monitor was also tightened in the follow-up: it now fetches OpenF1 meetings and sessions with the same bounded retry policy, compares ordered rounds, locations, start/end dates, circuit names, and confirmed local Session times, and keeps the fallback behavior when either source is unavailable. Candidate changes remain report-only on an independent draft branch.

`scripts/atlas-calendar-overrides.json` is the explicit project-manual layer and currently contains no overrides. When populated after review, those values take precedence for comparison without silently changing the rendered season source; uncertain or rumored changes must remain out of the file.

Verified circuit traces are now available for all 22 active 2026 entries in `src/lib/atlas/circuit-outlines-2026.ts`. They are normalized centerline polylines derived from the public MIT-licensed `bacinger/f1-circuits` GeoJSON source; the registry preserves the source URL and `lastVerified` date, and LOCKED FOCUS renders the trace without inventing geometry when a future circuit is missing.

Latest checkpoint: `bdce88d2` on `codex/velocity-at-dawn-homepage`. Preview is Ready at `https://pitwallcn-3twjltyjj-s8k8ps26k6-uis-projects.vercel.app/atlas-v2`; the Preview includes the trace, session, progressive texture, solar/debug, registry, and calendar-monitor changes. TypeScript, ESLint, production build, and the four UTC solar tests pass. Real-device touch/visual verification remains manual and was not claimed here.

The latest material pass adds only a small day-texture luminance-gradient relief term (`uDayTexel`) for coastline/terrain readability. It does not add a fabricated normal map, change the albedo hue, or alter the shared UTC sun vector.

## Atlas V2 continuation — 2026-08-01 calendar monitor testability

The calendar monitor now keeps its network/output entry point behind a `main()` guard. `compareCalendars()` and `getCandidateChanges()` are exported pure functions, so change detection and source-failure fallback can be tested without contacting OpenF1 or writing to the user-owned `output/` directory. Manual overrides still take precedence for comparison only; a failed source returns no candidate changes and leaves the current calendar intact.

Added `scripts/atlas-calendar-check.test.mjs` with five offline tests covering:

- unchanged calendar;
- round, date, and confirmed Session-time changes;
- missing remote records and count changes;
- manual date override precedence;
- source failure fallback.

Validation for this continuation:

- `node --check scripts/atlas-calendar-check.mjs` — passed.
- `node --test scripts/atlas-calendar-check.test.mjs` — passed (5 tests).
- `node --test --experimental-strip-types src/lib/atlas/solar.test.ts` — passed (4 tests).
- `npx.cmd tsc --noEmit --incremental false` — passed.
- `npm.cmd run lint` — passed.
- `npm.cmd run build` — passed; `/atlas-v2` generated successfully.

Latest implementation checkpoint before this continuation: `d6f7e93c` (`fix: dispose promoted atlas texture on unmount`). This continuation is intentionally limited to the calendar monitor refactor/test and this handoff update. The user-owned dirty files listed in Section 13 remain untouched and are not part of the Atlas checkpoint.
