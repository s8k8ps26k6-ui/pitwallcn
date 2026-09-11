import styles from './race-week.module.css';

/** Locally authored massing, not a photographic asset or a surveyed circuit model. */
export function RaceEnvironment({ circuitId }: { circuitId: string }) {
  return <div className={styles.environment} aria-hidden="true">
    <svg viewBox="0 0 1440 620" preserveAspectRatio="xMidYMid slice" focusable="false">
      <defs>
        <linearGradient id="rw-sky" x2=".2" y2="1"><stop stopColor="#131b22"/><stop offset=".55" stopColor="#2b3034"/><stop offset="1" stopColor="#0a0e11"/></linearGradient>
        <radialGradient id="rw-haze"><stop stopColor="#9b9d99" stopOpacity=".22"/><stop offset="1" stopColor="#465058" stopOpacity="0"/></radialGradient>
        <linearGradient id="rw-facade" x2="0" y2="1"><stop stopColor="#303538"/><stop offset=".35" stopColor="#171c20"/><stop offset="1" stopColor="#090d10"/></linearGradient>
        <linearGradient id="rw-roof" x2=".3" y2="1"><stop stopColor="#31393e"/><stop offset="1" stopColor="#11181d"/></linearGradient>
        <linearGradient id="rw-road" x2="0" y2="1"><stop stopColor="#272d30"/><stop offset=".45" stopColor="#11181c"/><stop offset="1" stopColor="#080d10"/></linearGradient>
        <linearGradient id="rw-shadow"><stop stopColor="#04080b"/><stop offset="1" stopColor="#090d10" stopOpacity="0"/></linearGradient>
        <linearGradient id="rw-reflection" x2="0" y2="1"><stop stopColor="#d34d49" stopOpacity=".24"/><stop offset="1" stopColor="#9b303a" stopOpacity="0"/></linearGradient>
        <pattern id="rw-asphalt" width="110" height="13" patternUnits="userSpaceOnUse"><path d="M0 1H45M64 6H96M12 11H72" stroke="#b4bcbf" strokeOpacity=".035"/><path d="M4 4H70M79 9H110" stroke="#000" strokeOpacity=".16"/></pattern>
        <pattern id="rw-seats" width="12" height="6" patternUnits="userSpaceOnUse"><path d="M1 2H8" stroke="#899196" strokeOpacity=".17" strokeWidth="2"/></pattern>
        <clipPath id="rw-stand-clip"><path d="M0 188 518 292 553 333 0 293Z"/></clipPath>
        <filter id="rw-soft"><feGaussianBlur stdDeviation="9"/></filter>
      </defs>
      {/* Distant sky and terrain: light sits behind the buildings, not on the UI. */}
      <path fill="url(#rw-sky)" d="M0 0H1440V620H0Z"/>
      <ellipse cx="717" cy="238" rx="475" ry="227" fill="url(#rw-haze)"/>
      <path d="M420 297Q438 272 460 286Q470 275 488 286Q505 264 530 282Q550 268 570 283Q590 271 614 280Q636 259 661 276Q681 265 700 275Q719 261 738 274Q758 265 780 276Q803 266 824 280Q850 267 881 279Q910 268 959 290V359H420Z" fill="#10171a"/>
      {circuitId === 'japan' && <g transform="translate(571 220)">
        <ellipse rx="48" ry="79" fill="#161c21" opacity=".75"/>
        <path d="M-33 111 0 1 35 111M-25 110 0 26 27 110" stroke="#4c4546" strokeWidth="4" fill="none"/>
        <ellipse cx="5" rx="48" ry="79" fill="none" stroke="#30292e" strokeWidth="5"/>
        <ellipse rx="48" ry="79" fill="none" stroke="#b34c50" strokeWidth="2"/>
        <ellipse rx="42" ry="73" fill="none" stroke="#583338"/>
        {Array.from({ length: 28 }, (_, i) => {
          const a = i * Math.PI / 14, x = Math.cos(a) * 48, y = Math.sin(a) * 79;
          return <g key={i}><path d={`M0 0 ${x} ${y}`} stroke="#92454b" strokeOpacity=".6" strokeWidth=".7"/><path d={`M${x-2} ${y-3}h5v7h-5Z`} fill="#47272c" stroke="#ce625d" strokeWidth=".8"/><circle cx={x} cy={y-3} r="1.6" fill="#f08271"/></g>;
        })}<circle r="5" fill="#9f494e"/>
      </g>}
      {/* Grandstand: roof top, dark soffit, raked seating and a separate retaining wall. */}
      <path d="M0 84 353 185 522 274 0 153Z" fill="url(#rw-roof)"/>
      <path d="M0 153 522 274 515 284 0 174Z" fill="#080d11"/>
      <path d="M0 151 520 274" stroke="#60696c" strokeOpacity=".36"/>
      <path d="M0 188 518 292 553 333 0 293Z" fill="#1c2429"/>
      <path d="M0 188 518 292 553 333 0 293Z" fill="url(#rw-seats)"/>
      <g clipPath="url(#rw-stand-clip)">{Array.from({ length: 12 }, (_, i) => <path key={i} d={`M0 ${189+i*10} 568 ${301+i*3}`} stroke="#697177" strokeOpacity=".2"/>)}</g>
      {Array.from({ length: 17 }, (_, i) => {
        const t = i/17, x = 520*(1-Math.pow(1-t,1.6));
        return <g key={i}><path d={`M${x} ${165+x*.218}V${337-x*.027}`} stroke="#080d11" strokeWidth={6-4*t}/><path d={`M${x+3} ${170+x*.218}V${332-x*.027}`} stroke="#444d51" strokeOpacity=".25" strokeWidth="1"/></g>;
      })}
      <path d="M0 286 553 332 632 352 0 391Z" fill="url(#rw-facade)"/>
      <path d="M0 301 555 339" stroke="#b4494a" strokeWidth="2" strokeOpacity=".75"/>
      {/* Pit building: end face and receding floor planes give it volume. */}
      <path d="M908 221 1440 18V404L876 350Z" fill="url(#rw-facade)"/>
      <path d="M877 230 908 221 876 350 848 347Z" fill="#0b1116"/>
      <path d="M881 205 1390 0H1440V30L902 233 875 224Z" fill="url(#rw-roof)"/>
      <path d="M875 224 902 233 1440 30V47L904 243 875 234Z" fill="#080d11"/>
      <path d="M921 243 1440 79V104L916 263Z" fill="#090e12"/>
      <path d="M900 295 1440 201V223L895 311Z" fill="#080d11"/>
      {Array.from({ length: 24 }, (_, i) => {
        const t=i/24, x=908+532*t*t, w=6+33*t, y=252-160*t*t;
        return <g key={i}><path d={`M${x} ${y}l${w} ${-w*.31}v${8+12*t}l${-w} ${w*.31}Z`} fill={i%4===0 ? '#a3917b' : '#6d6258'} opacity={i%3===0 ? .65 : .26}/><path d={`M${x} ${304-96*t*t}l${w} ${-w*.17}v${9+10*t}l${-w} ${w*.17}Z`} fill="#b1a28a" opacity={i%4===1 ? .43 : .12}/><path d={`M${x} ${228-178*t*t}V${353+48*t*t}`} stroke="#090e12" strokeWidth={3+5*t}/><path d={`M${x+2} ${332+10*t*t}l${w} ${w*.06}v${20+31*t}l${-w} ${-w*.06}Z`} fill="#070c10"/></g>;
      })}
      <path d="M934 239 1404 89" stroke="#ae4849" strokeWidth="1.6"/>
      <path d="M899 283 1440 161M889 320 1440 261" stroke="#475055" strokeOpacity=".45" strokeWidth="2"/>
      {/* Track corridor converges beyond the bridge and opens into the timeline surface. */}
      <path d="M0 392 631 351 726 345 848 347 1440 405V620H0Z" fill="url(#rw-road)"/>
      <path d="M0 392 631 351 726 345 848 347 1440 405V620H0Z" fill="url(#rw-asphalt)"/>
      <path d="M0 433C330 412 770 391 750 365Q743 356 703 351M1440 463C1130 417 813 395 790 370Q780 354 742 350" fill="none" stroke="#8b9397" strokeOpacity=".4" strokeWidth="2"/>
      <path d="M0 445C386 416 778 392 755 366Q748 358 711 353" fill="none" stroke="#cd4a4c" strokeOpacity=".72" strokeWidth="2"/>
      <path d="M380 509C620 460 816 404 768 375" fill="none" stroke="url(#rw-reflection)" strokeWidth="45" filter="url(#rw-soft)"/>
      <path d="M0 401 624 355M1440 416 852 354" stroke="#131c22" strokeWidth="12"/>
      {Array.from({ length: 18 }, (_, i) => {
        const t=i/18, x=624*(1-Math.pow(1-t,1.9)), base=399-x*.07, height=73*(1-x/800);
        return <g key={i}><path d={`M${x} ${base}v${-height}`} stroke="#080d11" strokeWidth={3-t*2}/><path d={`M${x} ${base-height+7}l5 -4`} stroke="#697176" strokeOpacity=".4"/></g>;
      })}
      <path d="M0 339 623 329M0 358 623 338M0 377 623 346" stroke="#4e585e" strokeOpacity=".27"/>
      <path d="M577 327 879 315 879 326 577 338Z" fill="#161d22"/>
      <path d="M580 333 876 321" stroke="#a54045" strokeOpacity=".85" strokeWidth="2"/>
      <path d="M0 0H1440V620H0Z" fill="url(#rw-shadow)" opacity=".28"/>
    </svg>
  </div>;
}
