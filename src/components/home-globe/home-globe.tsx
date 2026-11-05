'use client';

import { Component, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { AtlasGlobe, EUROPE_ENTRY_ID, type AtlasViewMode } from '../atlas-v2/atlas-globe';
import { getSeason2026, getSeasonRaceSelection2026 } from '@/lib/atlas/season-2026';
import { getSeasonCalendarEntries2026 } from '@/lib/atlas/events-2026';
import { getCircuitForRace } from '@/lib/atlas/circuit-registry';
import { ATLAS_RENDER_DEFAULTS } from '@/lib/atlas/render-settings';
import { getSessionLabel } from '@/lib/atlas/race-detail';
import { sessionScheduleState } from '@/lib/atlas/prototype-state';
import styles from './home-globe.module.css';
import './tokens.css';
import { getHomepageSessionSummary } from '@/lib/atlas/homepage-state';
import type { Route } from 'next';
import { useAtlasViewport, useRaceSheet } from '../atlas-prototype/use-race-sheet';

class GlobeBoundary extends Component<{children: ReactNode; fallback: ReactNode}, {failed: boolean}> {
  state = {failed:false};
  static getDerivedStateFromError() { return {failed:true}; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
const formatTime = (iso: string, zone: string) => new Intl.DateTimeFormat('zh-CN', {month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12:false, timeZone:zone}).format(new Date(iso));

export function GlobeHomepage({viewport}: {viewport?: {width:number; height:number}} = {}) {
  const [now, setNow] = useState<Date | null>(null);
  const [compact, setCompact] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [measure, setMeasure] = useState(false);
  const [webgl, setWebgl] = useState<'checking' | 'supported' | 'blocked'>('checking');
  const [contextLost, setContextLost] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [beijingTime, setBeijingTime] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mode, setMode] = useState<AtlasViewMode>('global');
  const [navigation, setNavigation] = useState(0);
  const [focusVersion, setFocusVersion] = useState(1);
  const rootRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { sheetRef, zoneRef, bodyRef, peekRef, stop, settle, toggle } = useRaceSheet(compact);
  useAtlasViewport(viewportRef);
  useEffect(() => {
    if (stop !== 'expanded') return;
    setMenuOpen(false);
    if (compact && !sheetRef.current?.contains(document.activeElement)) zoneRef.current?.querySelector('button')?.focus({preventScroll:true});
  }, [stop, compact, sheetRef, zoneRef]);
  useEffect(() => {
    const refresh = () => setNow(new Date());
    const sync = () => { setCompact((rootRef.current?.getBoundingClientRect().width ?? window.innerWidth) <= 800); setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches); };
    const visibility = () => { setVisible(document.visibilityState === 'visible'); refresh(); };
    setMeasure(new URLSearchParams(window.location.search).get('measure') === '1');
    const probe = document.createElement('canvas');
    let supported = false;
    try {
      const context = probe.getContext('webgl2');
      supported = Boolean(context);
      context?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch { supported = false; }
    setWebgl(supported ? 'supported' : 'blocked');
    refresh(); sync(); visibility();
    const resizeObserver = new ResizeObserver(sync);
    if (rootRef.current) resizeObserver.observe(rootRef.current);
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener('resize', sync); document.addEventListener('visibilitychange', visibility); window.addEventListener('focus', refresh);
    return () => { resizeObserver.disconnect(); clearInterval(timer); window.removeEventListener('resize', sync); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('focus', refresh); };
  }, []);
  // Opt-in real browser measurements. These are DOM/navigation timings, never GPU FPS.
  useEffect(() => {
    const root = rootRef.current;
    if (!now || !measure || !root || root.dataset.homeShellMetrics) return;
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    root.dataset.homeShellMetrics = JSON.stringify({
      shellCommitObservedMs: performance.now(),
      responseEndMs: navigation?.responseEnd ?? null,
      domInteractiveMs: navigation?.domInteractive ?? null,
      viewportWidth: root.clientWidth, viewportHeight: root.clientHeight,
      deviceDpr: window.devicePixelRatio,
      serverMode: process.env.NODE_ENV,
    });
    const frame = requestAnimationFrame(() => { root.dataset.homeShellNextRafMs = String(performance.now()); });
    return () => cancelAnimationFrame(frame);
  }, [now, measure]);
  // Only the mounted scene receives context listeners; the preflight context is released.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let canvas: HTMLCanvasElement | null = null;
    const lost = (event: Event) => { event.preventDefault(); setContextLost(true); };
    const restored = () => setContextLost(false);
    const attach = () => {
      const next = root.querySelector('canvas');
      if (!next || next === canvas) return;
      canvas?.removeEventListener('webglcontextlost', lost); canvas?.removeEventListener('webglcontextrestored', restored);
      canvas = next; canvas.addEventListener('webglcontextlost', lost); canvas.addEventListener('webglcontextrestored', restored);
    };
    const observer = new MutationObserver(attach); observer.observe(root, {childList:true, subtree:true}); attach();
    return () => { observer.disconnect(); canvas?.removeEventListener('webglcontextlost', lost); canvas?.removeEventListener('webglcontextrestored', restored); };
  }, []);
  const clock = now ?? new Date(0);
  const races = useMemo(() => getSeason2026(now ?? new Date(0)), [now]);
  const automatic = useMemo(() => getSeasonRaceSelection2026(now ?? new Date(0)), [now]);
  const race = races.find(r => r.id === selectedId) ?? automatic.race;
  const entry = getSeasonCalendarEntries2026(races).find(e => e.eventId === race.eventId)!;
  const circuit = getCircuitForRace(race, races);
  const elapsed = entry.sessions.filter(s => sessionScheduleState(s, clock.getTime()) === 'elapsed').length;
  const hasConfirmedTimes = entry.sessions.some(s => s.isTimeConfirmed && Number.isFinite(Date.parse(s.startTime)));
  const sessionSummary = getHomepageSessionSummary(entry.sessions, clock.getTime());
  const nextSession = sessionSummary.next?.session;
  const displayZone = beijingTime ? 'Asia/Shanghai' : circuit?.timeZone ?? 'UTC';
  const phase = selectedId ? race.status === 'completed' ? '历史赛事' : '赛站档案' : automatic.phase === 'current' ? '当前比赛周' : automatic.phase === 'next' ? '下一站' : '休赛期 · 最近一站';
  const onReady = useCallback(() => setReady(true), []);
  const select = useCallback((id: string) => {
    if (id === EUROPE_ENTRY_ID) { setMode('europe-focus'); setNavigation(v=>v+1); return; }
    setSelectedId(id); setMode('station-focus'); setNavigation(v=>v+1); setPanelOpen(true); setMenuOpen(false);
  }, []);
  const navigate = (nextMode: AtlasViewMode) => { setMode(nextMode); setNavigation(v=>v+1); };
  const reset = () => { setSelectedId(null); setMode('global'); setNavigation(v=>v+1); setFocusVersion(v=>v+1); };
  const openCurrent = () => { reset(); setPanelOpen(true); setMenuOpen(false); if (compact) settle('expanded'); };
  const fallback = <div className={styles.fallback} role="status">地球渲染不可用<span>可继续选择赛事并查看赛历。请尝试重新加载或启用 WebGL。</span></div>;
  return <div ref={viewportRef} className={styles.viewport} style={viewport ? {width:viewport.width, height:viewport.height, right:'auto', bottom:'auto'} : undefined}><main ref={rootRef} className={`lapmetry-globe-home ${styles.root}`} data-sheet={stop} data-panel={panelOpen ? "open" : "closed"} data-selected-event={race.id} data-home-ready={now ? "true" : "false"} data-webgl={webgl} data-view={mode} aria-label="LAPMETRY 全球赛事首页原型">
    <div className={styles.globe} data-testid="globe-stage" inert={compact && stop==='expanded'} role="region" aria-label="交互式全球赛事地球" aria-describedby="home-globe-help">
      <span id="home-globe-help" className={styles.srOnly}>拖动旋转地球，双指或滚轮缩放。也可以通过导航菜单直接选择赛事。</span>
      {webgl === 'blocked' && fallback}
      {now && webgl === 'supported' && <GlobeBoundary fallback={fallback}><AtlasGlobe races={races} hoveredTargetId={hoveredId} hoveredRace={races.find(r=>r.id===hoveredId) ?? null} selectedRace={selectedId ? race : null} currentRace={automatic.race} autoFocusRace={automatic.race} autoFocusVersion={focusVersion} viewMode={mode} navigationVersion={navigation} reducedMotion={reduced} compact={compact} active={visible && !contextLost && !(compact && stop === 'expanded')} renderSettings={ATLAS_RENDER_DEFAULTS} onHoverTarget={setHoveredId} onSelectTarget={select} onSceneReady={onReady} diagnostics={measure} fitGlobe performanceMode /></GlobeBoundary>}
    </div>
    <header className={styles.header} inert={compact && stop==='expanded'}>
      <Link href="/home-next" className={styles.brand}>LAPMETRY<span>GLOBAL RACE OPERATIONS</span></Link>
      <h1>全球赛事 <span>2026 / FORMULA 1</span></h1>
      <nav className={styles.primaryNav} aria-label="首页主导航"><Link href="/schedule">赛历</Link><Link href="/live">Live</Link><Link href="/results">比赛结果</Link></nav>
      <button id="home-menu-button" className={styles.menuButton} aria-expanded={menuOpen} aria-controls="home-navigation" onClick={()=>setMenuOpen(v=>!v)}>导航 {menuOpen?'−':'＋'}</button>
    </header>
    {menuOpen && <nav id="home-navigation" className={styles.menu} data-sheet-scroll aria-label="全部功能" onKeyDown={event=>{if(event.key==='Escape'){setMenuOpen(false);document.getElementById('home-menu-button')?.focus({preventScroll:true});}}}>
      <div className={styles.menuLinks}><Link href="/schedule">赛历</Link><Link href="/live">Live</Link><Link href="/results">比赛结果</Link><Link href="/race-control">赛会控制</Link><Link href="/lap-analysis">圈速分析</Link><Link href="/standings">积分榜</Link><Link href="/weather">天气</Link><Link href="/atlas-v2">Atlas</Link><Link href="/">旧版首页</Link></div>
      <label>直接选择赛事<select aria-label="导航选择赛事" value={race.id} onChange={event=>select(event.target.value)}>{races.map(r=><option key={r.id} value={r.id}>{String(r.round).padStart(2,'0')} · {r.name}</option>)}</select></label>
    </nav>}
    <div className={styles.location}>{now ? <><span>{race.country.toUpperCase()} / {race.region.replace('_',' ')}</span><p>{race.city}</p><small>{Math.abs(race.latitude).toFixed(3)}° {race.latitude>=0?'N':'S'} &nbsp; {Math.abs(race.longitude).toFixed(3)}° {race.longitude>=0?'E':'W'}</small></> : <span>正在读取赛历</span>}</div>
    <nav className={styles.controls} inert={compact && stop==='expanded'} aria-label="地球视角"><button aria-pressed={mode==='global'} onClick={()=>navigate('global')}>全球</button><button aria-pressed={mode==='europe-focus'} onClick={()=>navigate('europe-focus')}>欧洲</button><button onClick={openCurrent}>当前比赛周 ↗</button></nav>
    <button className={styles.panelToggle} aria-controls="home-race-panel" aria-expanded={panelOpen} onClick={()=>setPanelOpen(v=>!v)}>{panelOpen?'收起赛事面板 →':'← 打开赛事面板'}</button>
    {((webgl !== 'blocked' && !ready) || contextLost) && <div className={styles.loading} role="status">{contextLost ? '图形上下文中断 · 等待恢复' : '正在准备地球影像'}</div>}
    <aside id="home-race-panel" ref={sheetRef} inert={!compact && !panelOpen} className={styles.sheet} data-testid="race-sheet" data-stop={stop} aria-label="比赛周控制面板">
      <span ref={peekRef} className={styles.peekMeasure} aria-hidden="true" />
      <div ref={zoneRef} className={styles.gestureZone} data-testid="sheet-gesture-zone">
      <button data-sheet-handle className={styles.handle} aria-label="拖动或切换比赛周面板" aria-controls="home-race-week-content" aria-expanded={stop==='expanded'} onClick={toggle} onKeyDown={event=>{if(event.key==='ArrowUp'){event.preventDefault();settle('expanded');} if(event.key==='ArrowDown' || event.key==='Escape'){event.preventDefault();settle('collapsed');}}}><span/></button>
      <div className={styles.summary}>
        <div className={styles.eyebrow}><span>{now ? phase : '正在读取赛历'}</span><span>ROUND {now ? String(race.round).padStart(2,'0') : '—'} / {races.length}</span></div>
        <div className={styles.titleRow}><div><h2>{now ? race.city.toUpperCase() : 'ATLAS'}</h2><p>{now ? race.name : 'Season explorer'}</p></div><button className={styles.expand} aria-label={stop==='expanded' ? '收起面板' : '展开面板'} aria-expanded={stop==='expanded'} aria-controls="home-race-week-content" onClick={toggle}>{stop==='expanded'?'↓':'↑'}</button></div>
        <p className={styles.sessionHint}>{nextSession ? `下一节 · ${getSessionLabel(nextSession, entry.sessions.indexOf(nextSession), race.isSprint)} · ${formatTime(nextSession.startTime,displayZone)}` : !hasConfirmedTimes ? 'Session 时间待确认 · 暂无实时状态' : '计划时间已过 · 实际状态未接入'}</p>
      <p className={styles.gestureHint}>{stop === 'expanded' ? '下拉顶部收起 ↓' : '向上拖动查看比赛周 ↑'}</p>
      </div>
      </div>
      <div ref={bodyRef} id="home-race-week-content" data-sheet-scroll className={styles.sheetBody} inert={compact && stop==='collapsed'}>
        <div className={styles.sectionHeading}><h3>Session 时间线</h3><button className={styles.timeZone} onClick={()=>setBeijingTime(v=>!v)}>{beijingTime?'北京时间 ⇄':'赛道当地 ⇄'}</button></div>
        <div className={styles.progress}><span style={{width:`${entry.sessions.length ? elapsed/entry.sessions.length*100 : 0}%`}}/></div>
        <p className={styles.note}>当前 Session 状态：未接入实时数据{hasConfirmedTimes ? ` · 已过计划开始时间 ${elapsed}/${entry.sessions.length}` : ' · 时间待确认'}</p>
        <ol className={styles.timeline}>{entry.sessions.map((session,index)=>{
          const state = sessionScheduleState(session,clock.getTime());
          return <li key={session.name} data-status={state}><span className={styles.sequence}>{String(index+1).padStart(2,'0')}</span><div><strong>{getSessionLabel(session, index, race.isSprint)}</strong><span>{state==='unconfirmed'?'时间待确认':state==='elapsed'?'计划时间已过':'即将开始'}</span></div><time dateTime={state==='unconfirmed'?undefined:session.startTime}>{state==='unconfirmed'?'待公布':formatTime(session.startTime,displayZone)}</time></li>;
        })}</ol>
        {!entry.sessions.length && <p className={styles.note}>本站 Session 时间尚未接通。</p>}
        <Link className={styles.raceLink} href={`/races/2026/${race.eventId}` as Route}>打开赛事详情 <span>↗</span></Link>
        <div className={styles.sectionHeading}><h3>赛道资料</h3><span>{race.isSprint?'SPRINT WEEKEND':'GRAND PRIX'}</span></div>
        <div className={styles.circuit}>{circuit?.outline && <svg viewBox="0 0 100 100" aria-label={race.circuitName} role="img"><polyline points={circuit.outline.map(([x,y])=>`${x*100},${(1-y)*100}`).join(' ')}/></svg>}<div><p>{race.circuitName}</p><dl><div><dt>长度</dt><dd>{circuit?.lengthKm ?? '—'} <small>KM</small></dd></div><div><dt>正赛</dt><dd>{circuit?.laps ?? '—'} <small>LAPS</small></dd></div></dl></div></div>
        <div className={styles.sectionHeading}><h3>赛事动态</h3><span>数据可用性</span></div><p className={styles.note}>天气、实时圈数与赛会消息尚未接入本原型。此处仅展示仓库赛历，不推断实时状态。</p>
        <label className={styles.selectLabel}>选择赛事<select aria-label="选择赛事" value={race.id} onChange={event=>select(event.target.value)}>{races.map(r=><option key={r.id} value={r.id}>{String(r.round).padStart(2,'0')} · {r.name}</option>)}</select></label>
        <nav className={styles.dataLinks} aria-label="赛事数据入口"><Link href={`/races/2026/${race.eventId}` as Route}>赛站档案 ↗</Link><Link href="/live">Live ↗</Link><Link href="/results">比赛结果 ↗</Link></nav>
        <p className={styles.source}>来源：本地 2026 赛历 / 赛道注册表<br/>{race.startDate} — {race.endDate} · {circuit?.timeZone}<br/>时间选择沿用既有 UTC 比赛周边界；赛历未在线核验。</p>
      </div>
    </aside>
    <footer className={styles.footer}><span>{now ? String(race.round).padStart(2,'0') : '—'} / {races.length} &nbsp; {mode==='global'?'GLOBAL':mode==='europe-focus'?'EUROPE':'CIRCUIT FOCUS'}</span><span>EARTH IMAGERY / NASA · LAPMETRY 3.0 PROTOTYPE</span></footer>
  </main></div>;
}
