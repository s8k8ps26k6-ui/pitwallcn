/** Unsurveyed, non-landmark silhouettes. Never borrow a named venue's architecture. */
export function FallbackEnvironment({ urban }: { urban: boolean }) {
  return <g data-venue-module={urban ? 'urban-fallback' : 'trackside-fallback'}>
    {urban ? <>
      <path d="M0 310V186h92v-48h70v99h80v-59h96v76h84v-36h89v96h360v-95h90v-94h76v62h100v-74h108v107h95v-42h100v158H0Z" fill="#222c32"/>
      <path d="M0 313V244h150v-28h112v50h124v-25h120v91h410v-64h169v-55h123v26h132v124H0Z" fill="#111c24"/>
      <path d="M973 306 1440 269V384L919 346Z" fill="url(#rw-facade)"/>
      <path d="M953 294 1398 242 1440 269 970 316Z" fill="url(#rw-roof)"/>
    </> : <>
      <path d="M0 282Q217 256 402 291Q601 314 816 291Q1133 254 1440 290V364H0Z" fill="#1a2528"/>
      <path d="M0 273 377 315 450 346 0 327Z" fill="#252e33"/>
      <path d="M1003 305 1440 279V374L950 343Z" fill="url(#rw-facade)"/>
      <path d="M989 298 1397 263 1440 279 1003 316Z" fill="url(#rw-roof)"/>
    </>}
    <path d="M0 338 609 354M919 348 1440 388" stroke="#707f88" strokeOpacity=".3" strokeWidth="3"/>
  </g>;
}
