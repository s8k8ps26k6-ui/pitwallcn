/** Parkland and an open, low pit-straight complex; deliberately simplified, not a survey. */
export function MonzaEnvironment() {
  return <g data-venue-module="monza">
    <path d="M0 166Q40 113 84 151Q124 87 163 147Q210 116 244 171Q283 129 314 177Q352 152 389 203Q431 174 475 228Q530 198 570 251Q624 227 670 279L726 330H0Z" fill="#17231f"/>
    <path d="M0 208Q45 153 95 193Q135 141 177 200Q233 165 278 220Q334 184 374 240Q425 213 471 267Q522 239 574 290L634 355H0Z" fill="#0b1513"/>
    {Array.from({ length: 15 }, (_, i) => {
      const x = i * 41, y = 190 + i * 8;
      return <path key={i} d={`M${x} 365V${y}m0 44 -17 -23m17 12 14 -28`} stroke="#34423a" strokeOpacity=".45" strokeWidth={5-i*.2} fill="none"/>;
    })}
    <path d="M805 282Q890 207 959 256Q1018 187 1080 229Q1160 159 1218 208Q1344 141 1440 204V367H805Z" fill="#192622"/>
    <path d="M908 299 1440 241V382L888 346Z" fill="url(#rw-facade)"/>
    <path d="M870 289 1371 213 1440 231 904 312Z" fill="url(#rw-roof)"/>
    <path d="M904 312 1440 231V243L904 320Z" fill="#080e10"/>
    {Array.from({ length: 16 }, (_, i) => {
      const x=912+i*34, y=323-i*2.5;
      return <g key={i}><path d={`M${x} ${y}l25 -2v${23+i*.8}l-25 -1Z`} fill="#080e10"/><path d={`M${x} ${y-7}l25 -3`} stroke="#929993" strokeOpacity=".35" strokeWidth="4"/></g>;
    })}
    <path d="M0 314 483 342 592 358 0 363Z" fill="#2c3636"/>
    <path d="M0 326 487 349M0 337 536 354" stroke="#9ba6a0" strokeOpacity=".22"/>
    <path d="M758 290h27v55h-27Z" fill="#151d1d"/><path d="M753 287h37v8h-37Z" fill="#3b4340"/>
  </g>;
}
