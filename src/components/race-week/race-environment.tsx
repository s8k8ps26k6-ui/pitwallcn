import styles from './race-week.module.css';

/** Original low-detail architectural massing. No photographic or third-party assets. */
export function RaceEnvironment({ circuitId }: { circuitId: string }) {
  const suzuka = circuitId === 'japan';
  return <div className={styles.environment} aria-hidden="true">
    <svg viewBox="0 0 1440 500" preserveAspectRatio="xMidYMid slice" focusable="false">
      <defs>
        <linearGradient id="rw-sky" x2=".7" y2="1"><stop stopColor="#1a2228"/><stop offset=".6" stopColor="#11171b"/><stop offset="1" stopColor="#080c0f"/></linearGradient>
        <linearGradient id="rw-road" x2="0" y2="1"><stop stopColor="#171e22"/><stop offset="1" stopColor="#0a0d10"/></linearGradient>
        <linearGradient id="rw-building" x2="1" y2=".5"><stop stopColor="#20272c"/><stop offset=".5" stopColor="#141a1e"/><stop offset="1" stopColor="#080c0f"/></linearGradient>
        <linearGradient id="rw-red" x2="0" y2="1"><stop stopColor="#f3424c" stopOpacity=".5"/><stop offset="1" stopColor="#f3424c" stopOpacity="0"/></linearGradient>
        <radialGradient id="rw-light"><stop stopColor="#91a1af" stopOpacity=".15"/><stop offset="1" stopColor="#91a1af" stopOpacity="0"/></radialGradient>
      </defs>
      <path fill="url(#rw-sky)" d="M0 0H1440V500H0Z"/>
      <ellipse cx="710" cy="170" rx="630" ry="300" fill="url(#rw-light)"/>
      <path fill="#101719" d="M0 280 80 260 142 265 210 244 260 260 320 238 366 249 406 229 450 246 500 242 556 255 610 237 670 250 726 234 760 250 820 234 880 253 945 235 1020 244 1100 230 1190 253 1300 235 1440 260V360H0Z"/>
      {suzuka && <g transform="translate(565 185)" opacity=".78">
        <path d="M-30 102 0 5 31 102M-20 102 0 20 20 102" fill="none" stroke="#414149" strokeWidth="4"/>
        <ellipse rx="46" ry="79" fill="#14191d" stroke="#9c3c44" strokeWidth="2"/>
        <ellipse rx="40" ry="72" fill="none" stroke="#713038"/>
        {Array.from({ length: 20 }, (_, i) => {
          const angle = i * Math.PI / 10;
          const x = Math.cos(angle) * 46;
          const y = Math.sin(angle) * 79;
          return <g key={i}><path d={`M0 0 ${x} ${y}`} stroke="#6b303a" strokeWidth=".65"/><rect x={x - 2} y={y - 2} width="4" height="4" rx="1" fill="#d8565d"/></g>;
        })}<circle r="5" fill="#8c343f"/>
      </g>}
      <path d="M0 92 355 204 538 283 0 305Z" fill="#0a1014"/>
      <path d="M0 102 355 211 530 283 0 256Z" fill="#1c252a"/>
      <path d="M0 128 355 228 530 286 0 273Z" fill="#0c1216"/>
      <path d="M0 162 480 280M0 177 470 282M0 192 470 289M0 208 430 281" stroke="#41474a" strokeWidth="1" opacity=".45"/>
      {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${i * 35} ${142 + i * 9}v${160 - i * 9}`} stroke="#222a2f" strokeWidth="3"/>)}
      <path d="M0 236 535 296" stroke="#a34249" strokeWidth="2"/>
      <path d="M935 194 1440 10V361L865 302Z" fill="url(#rw-building)"/>
      <path d="M944 172 1440 0V32L934 209Z" fill="#151c21"/>
      <path d="M980 188 1440 34M933 231 1440 105M914 266 1440 202" stroke="#2b3339" strokeWidth="5"/>
      <path d="M985 193 1396 58" stroke="#d04d55" strokeWidth="1.7" opacity=".65"/>
      {Array.from({ length: 19 }, (_, i) => {
        const x = 935 + i * 29;
        return <g key={i}><path d={`M${x} ${220 - i * 6.7}v${85 + i * 3}`} stroke="#080e12" strokeWidth="9"/><path d={`M${x + 3} ${229 - i * 5.5}l18 -4v7l-18 4Z`} fill="#c5b1a1" opacity={i % 3 === 0 ? '.25' : '.08'}/></g>;
      })}
      <path d="M0 338 625 295 877 299 1440 374V500H0Z" fill="url(#rw-road)"/>
      <path d="M0 405Q790 347 762 319Q751 310 693 304M1440 423Q827 347 804 320Q798 308 729 301" fill="none" stroke="#697279" strokeWidth="1" opacity=".4"/>
      <path d="M330 411Q796 354 758 322Q750 315 710 310" fill="none" stroke="#b84850" strokeWidth="2" opacity=".65"/>
      <path d="M440 457Q811 365 765 328" fill="none" stroke="url(#rw-red)" strokeWidth="12" opacity=".12"/>
      <path d="M532 281 930 267" stroke="#44494c" strokeWidth="5"/>
      <path d="M532 283 930 269" stroke="#a94148" strokeWidth="1.4" opacity=".75"/>
    </svg>
  </div>;
}
