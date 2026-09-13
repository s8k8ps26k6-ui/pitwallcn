export function PermanentTrackField() {
  return <g data-spatial-field="permanent-landmark">
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
