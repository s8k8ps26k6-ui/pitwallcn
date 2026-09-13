/** Dense street-circuit massing and a harbor opening, not a permanent paddock template. */
export function MonacoEnvironment() {
  return <g data-venue-module="monaco">
    <path d="M0 260Q245 89 485 176Q686 169 801 303V360H0Z" fill="#252b2b"/>
    <path d="M595 307Q770 285 1014 313L1085 356H584Z" fill="#26373c"/>
    <path d="M640 321H969M682 331H1018M613 342H1054" stroke="#70848a" strokeOpacity=".22"/>
    {[697,746,811,884,939].map((x,i)=><g key={x}><path d={`M${x} 329v-${27+i%2*13}`} stroke="#7e8b8d" strokeOpacity=".45"/><path d={`M${x-10} 329h25l-5 4h-15Z`} fill="#6a7879" opacity=".35"/></g>)}
    {Array.from({ length: 9 }, (_, i) => {
      const x=i*66, top=72+i*19, w=72-i*3;
      return <g key={i}><path d={`M${x} ${top}h${w}v${291-top}l-8 32h-${w-8}Z`} fill={i%2 ? '#242c30' : '#303538'}/><path d={`M${x+w-10} ${top}h10v${324-top}h-10Z`} fill="#0e161b"/>{Array.from({length:5},(_,j)=><path key={j} d={`M${x+8} ${top+18+j*35}h${w-24}`} stroke="#0b1217" strokeWidth="13"/>)}</g>;
    })}
    <path d="M1031 181 1440 41V400L979 346Z" fill="#242d33"/>
    <path d="M1008 173 1423 23 1440 41 1031 191Z" fill="#424a4e"/>
    {Array.from({length:7},(_,i)=><g key={i}><path d={`M${1012-i*4} ${207+i*24} 1440 ${85+i*42}`} stroke="#0c141b" strokeWidth="14"/><path d={`M${1008-i*4} ${215+i*24} 1440 ${97+i*42}`} stroke="#697276" strokeOpacity=".22" strokeWidth="2"/></g>)}
    <path d="M0 315 588 347 611 365 0 403Z" fill="#171f24"/>
    <path d="M0 335 600 356M991 346 1440 401" stroke="#869094" strokeOpacity=".4" strokeWidth="3"/>
  </g>;
}
