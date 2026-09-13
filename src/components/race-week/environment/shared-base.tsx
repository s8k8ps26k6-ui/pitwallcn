/** Shared materials only. The venue family owns all spatial geometry. No venue landmarks belong in this module. */
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

  </g>;
}
