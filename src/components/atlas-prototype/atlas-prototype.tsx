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
import styles from './atlas-prototype.module.css';
import { useAtlasViewport, useRaceSheet } from './use-race-sheet';

class GlobeBoundary extends Component<{children: ReactNode; fallback: ReactNode}, {failed: boolean}> {
  state = {failed:false};
  static getDerivedStateFromError() { return {failed:true}; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
const formatTime = (iso: string, zone: string) => new Intl.DateTimeFormat('zh-CN', {month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12:false, timeZone:zone}).format(new Date(iso));

export function AtlasPrototype({viewport}: {viewport?: {width:number; height:number}} = {}) {
  const [now, setNow] = useState<Date | null>(null);
  const [compact, setCompact] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [measure, setMeasure] = useState(false);
  const [webgl, setWebgl] = useState<'checking' | 'supported' | 'blocked'>('checking');
  const [contextLost, setContextLost] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mode, setMode] = useState<AtlasViewMode>('global');
  const [navigation, setNavigation] = useState(0);
  const [focusVersion, setFocusVersion] = useState(1);
  const rootRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { sheetRef, zoneRef, bodyRef, peekRef, stop, settle, toggle } = useRaceSheet(compact);
  useAtlasViewport(viewportRef);
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
  const nextSession = entry.sessions.find(s => sessionScheduleState(s, clock.getTime()) === 'upcoming');
  const phase = selectedId ? '赛事浏览' : automatic.phase === 'current' ? '当前比赛周' : automatic.phase === 'next' ? '下一站' : '休赛期 · 最近一站';
  const onReady = useCallback(() => setReady(true), []);
  const select = useCallback((id: string) => {
    if (id === EUROPE_ENTRY_ID) { setMode('europe-focus'); setNavigation(v=>v+1); return; }
    setSelectedId(id); setMode('station-focus'); setNavigation(v=>v+1);
  }, []);
  const navigate = (nextMode: AtlasViewMode) => { setMode(nextMode); setNavigation(v=>v+1); };
  const reset = () => { setSelectedId(null); setMode('global'); setNavigation(v=>v+1); setFocusVersion(v=>v+1); };
  const fallback = <div className={styles.fallback} role="status">地球渲染不可用<span>可继续选择赛事并查看赛历。请尝试重新加载或启用 WebGL。</span></div>;
  return <div ref={viewportRef} className={styles.viewport} style={viewport ? {width:viewport.width, height:viewport.height, right:'auto', bottom:'auto'} : undefined}><main ref={rootRef} className={styles.root} data-sheet={stop} aria-label="Atlas 2.0 比赛周原型">
    <div className={styles.globe} data-testid="globe-stage">
      {webgl === 'blocked' && fallback}
      {now && webgl === 'supported' && <GlobeBoundary fallback={fallback}><AtlasGlobe races={races} hoveredTargetId={hoveredId} hoveredRace={races.find(r=>r.id===hoveredId) ?? null} selectedRace={selectedId ? race : null} currentRace={automatic.race} autoFocusRace={automatic.race} autoFocusVersion={focusVersion} viewMode={mode} navigationVersion={navigation} reducedMotion={reduced} compact={compact} active={visible && !contextLost && !(compact && stop === 'expanded')} renderSettings={ATLAS_RENDER_DEFAULTS} onHoverTarget={setHoveredId} onSelectTarget={select} onSceneReady={onReady} diagnostics={measure} fitGlobe /></GlobeBoundary>}
    </div>
    <header className={styles.header}><Link href="/" className={styles.brand}>LAPMETRY<span>ATLAS / 2026</span></Link><span className={styles.prototype}>EXPERIMENT 02</span><Link href="/atlas-v2">返回 Atlas ↗</Link></header>
    <div className={styles.caption}><span>SEASON EXPLORER</span><h1>每一站，<br/>同一个世界。</h1><p>旋转地球 · 轻触赛事节点</p></div>
    <nav className={styles.controls} aria-label="地球视角"><button aria-pressed={mode==='global'} onClick={()=>navigate('global')}>全球</button><button aria-pressed={mode==='europe-focus'} onClick={()=>navigate('europe-focus')}>欧洲赛季</button><button onClick={reset}>当前赛程 ↗</button></nav>
    {((webgl !== 'blocked' && !ready) || contextLost) && <div className={styles.loading} role="status">{contextLost ? '图形上下文中断 · 等待恢复' : '正在准备地球影像'}</div>}
    <aside ref={sheetRef} className={styles.sheet} data-testid="race-sheet" data-stop={stop} aria-label="比赛周信息">
      <span ref={peekRef} className={styles.peekMeasure} aria-hidden="true" />
      <div ref={zoneRef} className={styles.gestureZone} data-testid="sheet-gesture-zone">
      <button data-sheet-handle className={styles.handle} aria-label="拖动或切换比赛周面板" aria-controls="atlas-race-week-content" aria-expanded={stop==='expanded'} onClick={toggle} onKeyDown={event=>{if(event.key==='ArrowUp'){event.preventDefault();settle('expanded');} if(event.key==='ArrowDown' || event.key==='Escape'){event.preventDefault();settle('collapsed');}}}><span/></button>
      <div className={styles.summary}>
        <div className={styles.eyebrow}><span>{now ? phase : '正在读取赛历'}</span><span>ROUND {String(race.round).padStart(2,'0')} / {races.length}</span></div>
        <div className={styles.titleRow}><div><h2>{now ? race.city.toUpperCase() : 'ATLAS'}</h2><p>{now ? race.name : 'Season explorer'}</p></div><button className={styles.expand} aria-label={stop==='expanded' ? '收起面板' : '展开面板'} aria-expanded={stop==='expanded'} aria-controls="atlas-race-week-content" onClick={toggle}>{stop==='expanded'?'↓':'↑'}</button></div>
        <p className={styles.sessionHint}>{nextSession ? `下一节 · ${getSessionLabel(nextSession, entry.sessions.indexOf(nextSession), race.isSprint)} · ${formatTime(nextSession.startTime,circuit?.timeZone ?? 'UTC')}` : !hasConfirmedTimes ? 'Session 时间待确认 · 暂无实时状态' : '赛程时段已过 · 实际结果待数据源确认'}</p>
      </div>
      </div>
      <div ref={bodyRef} id="atlas-race-week-content" data-sheet-scroll className={styles.sheetBody} inert={compact && stop==='collapsed'}>
        <div className={styles.sectionHeading}><h3>比赛周 / 时间线</h3><span>赛道当地时间</span></div>
        <div className={styles.progress}><span style={{width:`${entry.sessions.length ? elapsed/entry.sessions.length*100 : 0}%`}}/></div>
        <p className={styles.note}>已过计划开始时间 {elapsed}/{entry.sessions.length} · 不代表实际比赛进度</p>
        <ol className={styles.timeline}>{entry.sessions.map((session,index)=>{
          const state = sessionScheduleState(session,clock.getTime());
          return <li key={session.name} data-status={state}><span className={styles.sequence}>{String(index+1).padStart(2,'0')}</span><div><strong>{getSessionLabel(session, index, race.isSprint)}</strong><span>{state==='unconfirmed'?'时间待确认':state==='elapsed'?'计划时间已过':'即将开始'}</span></div><time dateTime={state==='unconfirmed'?undefined:session.startTime}>{state==='unconfirmed'?'待公布':formatTime(session.startTime,circuit?.timeZone ?? 'UTC')}</time></li>;
        })}</ol>
        {!entry.sessions.length && <p className={styles.note}>本站 Session 时间尚未接通。</p>}
        <div className={styles.sectionHeading}><h3>赛道资料</h3><span>{race.isSprint?'SPRINT WEEKEND':'GRAND PRIX'}</span></div>
        <div className={styles.circuit}>{circuit?.outline && <svg viewBox="0 0 100 100" aria-label={race.circuitName} role="img"><polyline points={circuit.outline.map(([x,y])=>`${x*100},${(1-y)*100}`).join(' ')}/></svg>}<div><p>{race.circuitName}</p><dl><div><dt>长度</dt><dd>{circuit?.lengthKm ?? '—'} <small>KM</small></dd></div><div><dt>正赛</dt><dd>{circuit?.laps ?? '—'} <small>LAPS</small></dd></div></dl></div></div>
        <div className={styles.sectionHeading}><h3>赛事动态</h3><span>数据可用性</span></div><p className={styles.note}>天气、实时圈数与赛会消息尚未接入本原型。此处仅展示仓库赛历，不推断实时状态。</p>
        <label className={styles.selectLabel}>选择赛事<select aria-label="选择赛事" value={race.id} onChange={event=>select(event.target.value)}>{races.map(r=><option key={r.id} value={r.id}>{String(r.round).padStart(2,'0')} · {r.name}</option>)}</select></label>
        <p className={styles.source}>来源：本地 2026 赛历 / 赛道注册表<br/>{race.startDate} — {race.endDate} · {circuit?.timeZone}<br/>时间选择沿用既有 UTC 比赛周边界；赛历未在线核验。</p>
      </div>
    </aside>
    <footer className={styles.footer}><span>{races.length} ROUNDS · ONE PLANET</span><span>NASA EARTH IMAGERY / WEBGL</span></footer>
  </main></div>;
}
