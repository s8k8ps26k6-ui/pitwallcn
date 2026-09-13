/** Dense-street family: close facades, offset blind bend, restricted harbor aperture. */
export function MonacoEnvironment() {
  return <g data-venue-module="monaco" data-spatial-field="dense-street">
    <defs>
      <linearGradient id="rw-city-stone" x2="1" y2=".45"><stop stopColor="#20282c"/><stop offset=".7" stopColor="#4a4944"/><stop offset="1" stopColor="#282e2f"/></linearGradient>
      <linearGradient id="rw-city-side" x2=".2" y2="1"><stop stopColor="#363b3c"/><stop offset="1" stopColor="#0e181d"/></linearGradient>
    </defs>
    {/* Stepped hillside closes the sky; water is only visible through a narrow opening. */}
    <path d="M0 85 195 32 320 70 443 27 591 55 725 96 822 72 941 138 1054 189 1130 239V378H0Z" fill="#343c3c"/>
    <path d="M951 238 1200 231 1300 340 915 352Z" fill="#36484d"/>
    <path d="M1008 270h155m-177 19h190m-163 20h190" stroke="#849597" strokeOpacity=".2"/>
    <path d="M1062 301v-56m-12 57h30l-6 5h-19m43 5v-40m-12 41h37l-7 6h-23" stroke="#919a98" strokeOpacity=".3" fill="none"/>
    {[{x:420,y:54,w:105,h:227},{x:533,y:92,w:92,h:210},{x:627,y:25,w:88,h:279},{x:722,y:103,w:106,h:225},{x:836,y:157,w:79,h:193},{x:920,y:191,w:66,h:146}].map((b,i)=><g key={b.x}>
      <path d={`M${b.x} ${b.y}h${b.w}v${b.h}h-${b.w}Z`} fill={i%2 ? '#3b4140' : '#444642'}/>
      <path d={`M${b.x+b.w-17} ${b.y}h17v${b.h}h-17Z`} fill="#1d292e"/>
      {Array.from({length:Math.floor(b.h/29)},(_,j)=><path key={j} d={`M${b.x+7} ${b.y+17+j*29}h${b.w-30}`} stroke="#111d23" strokeWidth="12"/>)}
    </g>)}
    {/* Left near block projects deep into the image; balconies describe its perspective. */}
    <path d="M0 0H360L683 119V410L0 505Z" fill="url(#rw-city-stone)"/>
    <path d="M360 0 683 119V410L573 427V109Z" fill="url(#rw-city-side)"/>
    <path d="M0 94 360 100 573 175M0 162 360 153 573 217M0 233 360 211 573 264M0 309 360 272 573 315M0 389 360 337 573 366" stroke="#080f15" strokeWidth="23" fill="none"/>
    <path d="M0 111 360 113 573 186M0 180 360 168 573 228M0 251 360 226 573 275M0 327 360 287 573 326M0 408 360 351 573 378" stroke="#8d8a7e" strokeOpacity=".27" strokeWidth="3" fill="none"/>
    <path d="M65 0V486M184 0V468M303 0V450M405 74V442M491 111V433" stroke="#151f24" strokeWidth="11"/>
    {/* Street turns behind the left block. There is no central open horizon. */}
    <path d="M979 317 845 369Q723 410 796 446L1119 620H1440L1044 410Q933 367 1016 339Z" fill="url(#rw-road)"/>
    <path d="M979 317 845 369Q723 410 796 446L1119 620H1440L1044 410Q933 367 1016 339Z" fill="url(#rw-asphalt)"/>
    <path d="M979 317 845 369Q723 410 796 446L1119 620M1016 339Q933 367 1044 410L1440 599" fill="none" stroke="#a2aaa9" strokeOpacity=".5" strokeWidth="3"/>
    {/* Close right tower occludes the water and road, unlike a receding pit building. */}
    <path d="M1192 0H1440V538L1149 390Z" fill="url(#rw-city-stone)"/>
    <path d="M1192 0 1116 47 1089 359 1149 390Z" fill="#17232a"/>
    {Array.from({length:9},(_,i)=><g key={i}><path d={`M${1185-i*3} ${48+i*48} 1440 ${27+i*56}`} stroke="#111c23" strokeWidth="22"/><path d={`M${1185-i*3} ${63+i*48} 1440 ${42+i*56}`} stroke="#92938b" strokeOpacity=".25" strokeWidth="3"/></g>)}
    <path d="M0 478 573 410 682 393 774 408 770 443 0 554Z" fill="#152027"/>
    <path d="M0 491 573 423 682 406 773 420M0 512 573 444 677 427 772 438" fill="none" stroke="#809094" strokeOpacity=".35" strokeWidth="3"/>
    <path d="M979 323 845 375Q739 410 808 449L1103 608" stroke="#d76263" strokeOpacity="var(--rw-trajectory)" strokeWidth="2" fill="none"/>
    <path d="M836 436 1167 620" stroke="url(#rw-reflection)" opacity="var(--rw-reflection)" strokeWidth="65" fill="none" filter="url(#rw-soft)"/>
    <path d="M0 542 755 439 809 450 1105 620H0Z" fill="#091218" opacity=".65"/>
  </g>;
}
