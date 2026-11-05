'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { snapSheet, type SheetStop } from '@/lib/atlas/prototype-state';

type Drag = {
  id: number;
  capture: HTMLElement;
  startY: number;
  origin: number;
  position: number;
  start: SheetStop;
  samples: { y: number; at: number }[];
};

/** Endpoint state belongs to React; finger tracking writes only the sheet transform. */
export function useRaceSheet(compact: boolean) {
  const sheetRef = useRef<HTMLElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const peekRef = useRef<HTMLSpanElement>(null);
  const stopRef = useRef<SheetStop>('collapsed');
  const dragRef = useRef<Drag | null>(null);
  const rangeRef = useRef(0);
  const frameRef = useRef(0);
  const suppressClickUntil = useRef(0);
  const [stop, setStop] = useState<SheetStop>('collapsed');

  const settle = useCallback((target: SheetStop) => {
    const sheet = sheetRef.current;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
    dragRef.current = null;
    stopRef.current = target;
    if (sheet) {
      sheet.removeAttribute('data-dragging');
      sheet.style.transform = `translate3d(0,${compact && target === 'collapsed' ? rangeRef.current : 0}px,0)`;
    }
    if (target === 'collapsed' && compact && bodyRef.current) {
      // Never leave focus inside content that is about to become inert.
      if (bodyRef.current.contains(document.activeElement)) zoneRef.current?.querySelector('button')?.focus({ preventScroll: true });
      bodyRef.current.scrollTop = 0;
    }
    setStop(target);
  }, [compact]);

  const toggle = useCallback((event?: { detail: number }) => {
    if (event?.detail !== 0 && performance.now() < suppressClickUntil.current) return;
    settle(stopRef.current === 'collapsed' ? 'expanded' : 'collapsed');
  }, [settle]);

  useEffect(() => {
    const sheet = sheetRef.current;
    const zone = zoneRef.current;
    const peek = peekRef.current;
    if (!sheet || !zone || !peek) return;
    const measure = () => {
      rangeRef.current = Math.max(0, sheet.offsetHeight - peek.offsetHeight);
      // Rotation/toolbars cancel any in-flight drag and retain one legal endpoint.
      settle(stopRef.current);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(sheet);
    observer.observe(peek);
    measure();
    if (!compact) return () => observer.disconnect();

    const queuePosition = (position: number) => {
      if (frameRef.current) return;
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = 0;
        sheet.style.transform = `translate3d(0,${dragRef.current?.position ?? position}px,0)`;
      });
    };
    const down = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0 || dragRef.current) return;
      const target = event.target as HTMLElement;
      suppressClickUntil.current = 0;
      if (target.closest('a, input, select, button:not([data-sheet-handle])')) return;
      // One layout read at acquisition, including the current position if re-grabbed mid-snap.
      const transform = getComputedStyle(sheet).transform;
      const origin = transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42;
      const capture = target.closest<HTMLElement>('[data-sheet-handle]') ?? zone;
      capture.setPointerCapture(event.pointerId);
      sheet.dataset.dragging = 'true';
      sheet.style.transform = `translate3d(0,${origin}px,0)`;
      dragRef.current = {
        id: event.pointerId, capture, startY: event.clientY, origin, position: origin,
        start: stopRef.current, samples: [{ y: event.clientY, at: performance.now() }],
      };
    };
    const move = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.id !== event.pointerId) return;
      const now = performance.now();
      drag.position = Math.max(0, Math.min(rangeRef.current, drag.origin + event.clientY - drag.startY));
      drag.samples = [...drag.samples.filter(sample => now - sample.at <= 80), { y: event.clientY, at: now }];
      queuePosition(drag.position);
      if (event.cancelable) event.preventDefault();
    };
    const finish = (event: PointerEvent, cancelled: boolean) => {
      const drag = dragRef.current;
      if (!drag || drag.id !== event.pointerId) return;
      const travel = event.clientY - drag.startY;
      const now = performance.now();
      const last = drag.samples.at(-1)!;
      const first = drag.samples[0];
      const velocity = now - last.at > 80 ? 0 : (last.y - first.y) / Math.max(1, last.at - first.at);
      const moved = Math.abs(travel) >= 6;
      if (cancelled || moved) suppressClickUntil.current = now + 400;
      const position = Math.max(0, Math.min(rangeRef.current, drag.origin + travel));
      settle(cancelled ? drag.start : moved ? snapSheet(drag.start, position, velocity, rangeRef.current) : drag.start);
      if (drag.capture.hasPointerCapture(event.pointerId)) drag.capture.releasePointerCapture(event.pointerId);
      // A true tap is handled once by the normal click/keyboard activation path.
    };
    const up = (event: PointerEvent) => finish(event, false);
    const cancel = (event: PointerEvent) => finish(event, true);
    const blockTouchScroll = (event: TouchEvent) => { if (event.cancelable) event.preventDefault(); };
    zone.addEventListener('pointerdown', down);
    zone.addEventListener('pointermove', move);
    zone.addEventListener('pointerup', up);
    zone.addEventListener('pointercancel', cancel);
    zone.addEventListener('lostpointercapture', cancel);
    // Nonpassive, limited to the explicit gesture header; content keeps native scrolling.
    zone.addEventListener('touchmove', blockTouchScroll, { passive: false });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      dragRef.current = null;
      zone.removeEventListener('pointerdown', down);
      zone.removeEventListener('pointermove', move);
      zone.removeEventListener('pointerup', up);
      zone.removeEventListener('pointercancel', cancel);
      zone.removeEventListener('lostpointercapture', cancel);
      zone.removeEventListener('touchmove', blockTouchScroll);
    };
  }, [compact, settle]);

  return { sheetRef, zoneRef, bodyRef, peekRef, stop, settle, toggle };
}

/** A route-owned lock: restore prior styles and scroll position when Atlas unmounts. */
export function useAtlasViewport(viewportRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const x = window.scrollX;
    const y = window.scrollY;
    const changes: [HTMLElement, string, string][] = [
      [html, 'overflow', 'hidden'], [html, 'overscroll-behavior', 'none'], [html, 'height', '100%'],
      [body, 'position', 'fixed'], [body, 'top', `${-y}px`], [body, 'left', `${-x}px`],
      [body, 'width', '100%'], [body, 'height', '100%'], [body, 'overflow', 'hidden'],
      [body, 'overscroll-behavior', 'none'],
    ];
    const saved = changes.map(([node, key]) => [node, key, node.style.getPropertyValue(key), node.style.getPropertyPriority(key)] as const);
    for (const [node, key, value] of changes) node.style.setProperty(key, value);
    let viewportFrame = 0;
    const sync = () => {
      if (viewportFrame) return;
      viewportFrame = requestAnimationFrame(() => {
        viewportFrame = 0;
        const viewport = window.visualViewport;
        const node = viewportRef.current;
        if (!node) return;
        node.style.setProperty('--atlas-viewport-height', `${viewport?.height ?? window.innerHeight}px`);
        node.style.setProperty('--atlas-viewport-width', `${viewport?.width ?? window.innerWidth}px`);
        node.style.setProperty('--atlas-viewport-top', `${viewport?.offsetTop ?? 0}px`);
        node.style.setProperty('--atlas-viewport-left', `${viewport?.offsetLeft ?? 0}px`);
      });
    };
    let lastY = 0;
    const touchStart = (event: TouchEvent) => { lastY = event.touches[0]?.clientY ?? 0; };
    const touchMove = (event: TouchEvent) => {
      const target = event.target as HTMLElement;
      const content = target.closest<HTMLElement>('[data-sheet-scroll]');
      const currentY = event.touches[0]?.clientY ?? lastY;
      const delta = currentY - lastY;
      lastY = currentY;
      // Canvas owns its rotation/pinch events. The fixed document cannot scroll underneath it.
      if (target.closest('[data-testid="globe-stage"]')) return;
      const canScroll = content && !content.inert && content.scrollHeight > content.clientHeight;
      const atTop = !content || content.scrollTop <= 0;
      const atBottom = !content || content.scrollTop + content.clientHeight >= content.scrollHeight - 1;
      if (!canScroll || (delta > 0 && atTop) || (delta < 0 && atBottom)) {
        if (event.cancelable) event.preventDefault();
      }
    };
    document.addEventListener('touchstart', touchStart, { passive: true, capture: true });
    document.addEventListener('touchmove', touchMove, { passive: false, capture: true });
    window.addEventListener('resize', sync);
    window.visualViewport?.addEventListener('resize', sync);
    window.visualViewport?.addEventListener('scroll', sync);
    sync();
    return () => {
      cancelAnimationFrame(viewportFrame);
      document.removeEventListener('touchstart', touchStart, true);
      document.removeEventListener('touchmove', touchMove, true);
      window.removeEventListener('resize', sync);
      window.visualViewport?.removeEventListener('resize', sync);
      window.visualViewport?.removeEventListener('scroll', sync);
      for (const [node, key, value, priority] of saved) {
        if (value) node.style.setProperty(key, value, priority);
        else node.style.removeProperty(key);
      }
      window.scrollTo(x, y);
    };
  }, [viewportRef]);
}
