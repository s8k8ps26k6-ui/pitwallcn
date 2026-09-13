/** Shared material and spatial field. No venue landmarks belong in this module. */
export function EnvironmentDefinitions() {
  return <>
      <defs>
        <linearGradient id="rw-sky" x2=".2" y2="1"><stop stopColor="var(--rw-sky-top, #131b22)"/><stop offset=".55" stopColor="var(--rw-sky-horizon, #2b3034)"/><stop offset="1" stopColor="#0a0e11"/></linearGradient>
        <radialGradient id="rw-haze"><stop stopColor="#9b9d99" stopOpacity=".22"/><stop offset="1" stopColor="#465058" stopOpacity="0"/></radialGradient>
        <linearGradient id="rw-facade" x2="0" y2="1"><stop stopColor="#303538"/><stop offset=".35" stopColor="#171c20"/><stop offset="1" stopColor="#090d10"/></linearGradient>
        <linearGradient id="rw-roof" x2=".3" y2="1"><stop stopColor="#31393e"/><stop offset="1" stopColor="#11181d"/></linearGradient>
        <linearGradient id="rw-road" x2="0" y2="1"><stop stopColor="#272d30"/><stop offset=".45" stopColor="#11181c"/><stop offset="1" stopColor="#080d10"/></linearGradient>
        <linearGradient id="rw-shadow"><stop stopColor="#04080b"/><stop offset="1" stopColor="#090d10" stopOpacity="0"/></linearGradient>
        <linearGradient id="rw-reflection" x2="0" y2="1"><stop stopColor="#d34d49" stopOpacity=".24"/><stop offset="1" stopColor="#9b303a" stopOpacity="0"/></linearGradient>
        <pattern id="rw-asphalt" width="110" height="13" patternUnits="userSpaceOnUse"><path d="M0 1H45M64 6H96M12 11H72" stroke="#b4bcbf" strokeOpacity=".035"/><path d="M4 4H70M79 9H110" stroke="#000" strokeOpacity=".16"/></pattern>
        <filter id="rw-soft"><feGaussianBlur stdDeviation="9"/></filter>
      </defs>
  </>;
}
export function EnvironmentSky() {
  return <g data-environment-layer="base-sky">
      <path fill="url(#rw-sky)" d="M0 0H1440V620H0Z"/>
      <ellipse cx="717" cy="238" rx="475" ry="227" fill="url(#rw-haze)"/>
  </g>;
}
export function EnvironmentSurface() {
  return <g data-environment-layer="base-surface">
      <path d="M0 392 631 351 726 345 848 347 1440 405V620H0Z" fill="url(#rw-road)"/>
      <path d="M0 392 631 351 726 345 848 347 1440 405V620H0Z" fill="url(#rw-asphalt)"/>
      <path d="M0 433C330 412 770 391 750 365Q743 356 703 351M1440 463C1130 417 813 395 790 370Q780 354 742 350" fill="none" stroke="#8b9397" strokeOpacity=".4" strokeWidth="2"/>
      <path d="M0 445C386 416 778 392 755 366Q748 358 711 353" fill="none" stroke="#cd4a4c" strokeOpacity="var(--rw-trajectory, .5)" strokeWidth="2"/>
      <path d="M380 509C620 460 816 404 768 375" fill="none" stroke="url(#rw-reflection)" strokeWidth="45" filter="url(#rw-soft)" opacity="var(--rw-reflection, .2)"/>
      <path d="M0 401 624 355M1440 416 852 354" stroke="#131c22" strokeWidth="12"/>
      {Array.from({ length: 18 }, (_, i) => {
        const t=i/18, x=624*(1-Math.pow(1-t,1.9)), base=399-x*.07, height=73*(1-x/800);
        return <g key={i}><path d={`M${x} ${base}v${-height}`} stroke="#080d11" strokeWidth={3-t*2}/><path d={`M${x} ${base-height+7}l5 -4`} stroke="#697176" strokeOpacity=".4"/></g>;
      })}
      <path d="M0 339 623 329M0 358 623 338M0 377 623 346" stroke="#4e585e" strokeOpacity=".27"/>
  </g>;
}

