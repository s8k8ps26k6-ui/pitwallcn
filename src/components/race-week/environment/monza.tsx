/** Park-natural family: shallow skyline, continuous canopy, oblique long straight. */
export function MonzaEnvironment() {
  return <g data-venue-module="monza" data-spatial-field="park-natural">
    <defs>
      <linearGradient id="rw-canopy" x2=".1" y2="1"><stop stopColor="#35433c"/><stop offset=".48" stopColor="#1c2b25"/><stop offset="1" stopColor="#0a1513"/></linearGradient>
      <linearGradient id="rw-park-ground" x2="1" y2=".6"><stop stopColor="#111e19"/><stop offset="1" stopColor="#29352e"/></linearGradient>
      <linearGradient id="rw-park-distance"><stop stopColor="#546058" stopOpacity="0"/><stop offset=".85" stopColor="#708077" stopOpacity=".18"/><stop offset="1" stopColor="#47534d" stopOpacity=".03"/></linearGradient>
      <filter id="rw-canopy-edge" x="-5%" y="-10%" width="110%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".026 .07" numOctaves="3" seed="19" result="canopy"/><feDisplacementMap in="SourceGraphic" in2="canopy" scale="23" xChannelSelector="R" yChannelSelector="G"/></filter>
    </defs>
    <g filter="url(#rw-canopy-edge)">
    {/* A broad far tree wall: no repeating individual tree symbols. */}
    <path d="M0 174 70 160 132 171 198 145 264 159 311 140 375 154 438 130 492 142 554 127 621 141 699 121 760 141 831 130 890 145 952 133 1030 150 1090 141 1173 169 1240 151 1310 165 1371 146 1440 164V360H0Z" fill="#35423c" opacity=".7"/>
    <path d="M0 202Q150 157 298 193T559 183Q689 153 798 177T1046 181Q1188 166 1440 193V365H0Z" fill="#24372d"/>
    {/* The near canopy is a single enclosing landscape volume, not icon trees. */}
    <path d="M0 90 46 97 82 82 119 108 163 102 209 120 259 111 292 140 335 132 382 150 430 144 469 172 515 166 563 184 604 176 663 205 713 196 756 218 811 208 863 232 920 225 961 249 1017 239 1070 263 1132 250 1186 270 1276 256 1360 279 1440 270V361L0 476Z" fill="url(#rw-canopy)"/>
    <path d="M0 178Q111 144 238 195T468 223Q544 205 645 251T831 274Q943 252 1090 299L0 439Z" fill="#15261e" opacity=".72"/>
    <path d="M0 263Q108 216 236 262T454 285Q559 267 676 311L0 455Z" fill="#0d1c16" opacity=".65"/>
    <path d="M0 314 146 297 259 316 381 303 515 328 683 320 818 345 0 455Z" fill="#0b1713"/>
    <path d="M0 137Q39 112 69 137T151 139Q173 115 204 149T289 158Q327 142 352 180T443 191Q479 168 505 209T600 228Q637 204 678 244T771 259Q805 236 853 278T951 294L1027 323 0 408Z" fill="#1a2a22" opacity=".6"/>
    <path d="M0 231Q59 188 123 242T243 261Q292 220 355 278T495 299Q548 270 623 316L778 351 0 443Z" fill="#0d1e16" opacity=".6"/>
    </g>
    <path d="M21 318v62m12-70v68m27-86v83m12-71v69m23-81v77m13-54v51m31-57v49m12-70v70m25-66v66m14-60v54m27-58v60m12-49v48m32-60v57m12-54v50m27-47v43m13-43v40m30-39v33m12-37v33m25-33v32m13-35v30m29-32v31m12-36v30m26-31v24m12-24v21m28-29v24m13-22v21m24-24v23" stroke="#768278" strokeOpacity=".13" strokeWidth="2" fill="none"/>
    <path d="M0 383 217 352 428 346 626 328 824 310 1113 291 1440 289V620H0Z" fill="url(#rw-park-ground)"/>
    {/* Off-centre distance: the straight cuts across the park, not between two buildings. */}
    <path d="M1440 282 1156 300 844 346 0 499V620L921 389 1257 318 1440 303Z" fill="url(#rw-road)"/>
    <path d="M1440 282 1156 300 844 346 0 499V620L921 389 1257 318 1440 303Z" fill="url(#rw-asphalt)"/>
    <path d="M0 489 842 340 1156 296 1440 280M0 611 921 395 1257 322 1440 307" stroke="#9aa69c" strokeOpacity=".42" strokeWidth="2" fill="none"/>
    <path d="M0 505 855 351 1180 302 1440 286" stroke="#df6964" strokeOpacity="var(--rw-trajectory)" strokeWidth="2" fill="none"/>
    <path d="M0 542 960 365 1300 304" stroke="url(#rw-reflection)" opacity="var(--rw-reflection)" strokeWidth="48" fill="none" filter="url(#rw-soft)"/>
    <path d="M0 461 828 329 1134 293" stroke="#66776b" strokeOpacity=".25" strokeWidth="5" fill="none"/>
    <path d="M0 453 827 325 1134 291" stroke="#0c1713" strokeWidth="7" fill="none"/>
    {/* Distant low race infrastructure occupies a small fraction of the scene. */}
    <path d="M1110 246 1386 230 1440 239V280L1105 282Z" fill="#18251f"/>
    <path d="M1095 242 1382 224 1440 233V242L1104 254Z" fill="#465049"/>
    <path d="M1123 261 1440 247" stroke="#879087" strokeOpacity=".3" strokeWidth="6"/>
    <path d="M1155 260V278M1214 257V275M1273 253V274M1333 250V272M1393 247V270" stroke="#0c1612" strokeWidth="7"/>
    <path d="M0 355Q715 316 1440 247V321L0 409Z" fill="url(#rw-park-distance)"/>
    <path d="M0 572Q315 506 599 475L936 433 1440 404V620H0Z" fill="#08110d" opacity=".36"/>
  </g>;
}
