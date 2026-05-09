# Pitwall CN

Pitwall CN 是一个面向中文 F1 车迷的非官方数据看板原型，主打移动端优先的暗黑赛事 App 体验。

当前版本使用 Mock 数据展示产品结构，重点放在界面、信息架构和交互流程上；后续可以逐步接入真实 F1 数据源。

线上预览：

```text
https://pitwallcn-57ny.vercel.app
```

## 项目定位

Pitwall CN 不是一个普通资讯站，而是一个偏 “pit wall / race control / telemetry dashboard” 风格的 F1 数据产品原型。

核心目标：

- 给中文车迷提供更直观的比赛数据入口
- 用 App 化卡片 UI 展示赛程、实时计时、赛控、车手、积分与圈速分析
- 先用 Mock 数据打磨体验，再逐步接入真实 API
- 作为个人前端与产品设计作品展示

## 当前功能

### 首页主控台

- 暗黑 F1 dashboard 风格首页
- 下一站比赛卡片
- 自动倒计时组件
- 六个核心模块入口
- 移动端优先排版

### 赛程页 `/schedule`

- 下一站大奖赛信息
- 比赛周末倒计时
- FP1 / 冲刺排位 / 冲刺赛 / 排位赛 / 正赛时间安排
- 支持本地时间与赛道时间切换

### 实时计时 `/live`

- 模拟 live timing 数据
- 车手排名、gap、last lap、best lap
- 10 秒自动刷新 UI
- 移动端卡片式 timing tower
- 桌面端完整表格

### 赛会控制 `/race-control`

- FIA Race Control 风格消息流
- FLAG / SAFETY CAR / INCIDENT / NOTICE 标签
- 消息时间线
- 赛控状态卡片

### 车手数据 `/drivers`

- 车手选择页
- 支持搜索车手代码、姓名、车队和车号
- 支持车队筛选
- 车手详情页 `/drivers/[driverCode]`
- 当前使用文字版车手数据框架，后续可接入统一风格动漫车手头像

### 积分榜 `/standings`

- 车手积分榜
- 车队积分榜
- 积分进度条
- 点击车手可进入对应详情页

### 圈速分析 `/lap-analysis`

- 单场比赛圈速对比
- S1 / S2 / S3 分段对比
- stint 与胎况模拟数据
- 后续适合接入真实 session feed

## 技术栈

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Recharts
- Vercel 部署

## 本地运行

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

构建生产版本：

```bash
npm run build
```

启动生产服务器：

```bash
npm run start
```

代码检查：

```bash
npm run lint
```

## 当前数据说明

当前版本主要使用 Mock 数据，包括：

- 赛程信息
- 比赛倒计时目标
- 实时计时数据
- 赛会控制消息
- 车手积分和车队积分
- 圈速和分段数据

这些数据用于展示页面结构和产品体验，不代表真实比赛结果。

## 后续计划

优先级建议：

1. 稳定当前 v1 UI 和移动端体验
2. 补充统一风格车手头像素材
3. 建立本地赛历数据表，自动识别下一站比赛
4. 接入真实 F1 数据源
5. 增加比赛详情页，例如 `/schedule/canada-2026`
6. 增加收藏、分享、PWA 或移动端底部导航

## 真实 API 接入方向

后续可以将页面继续保留为前端展示层，通过内部 API 路由统一获取数据：

```text
/api/f1/live
/api/f1/race-control
/api/f1/standings
/api/f1/schedule
```

这样可以把 API key、缓存、错误兜底都放在服务端处理，避免客户端直接暴露数据源。

## 项目状态

当前版本：v1 数据主控台原型

状态：

- UI 主体完成
- 主要页面完成
- 移动端体验基本成型
- 数据仍为 Mock
- 适合继续作为个人作品和后续真实数据接入基础

## 免责声明

Pitwall CN 是非官方项目，与 Formula 1、FIA、各车队或车手无官方关联。页面中的数据、赛程和排名目前主要为 Mock 展示用途。
