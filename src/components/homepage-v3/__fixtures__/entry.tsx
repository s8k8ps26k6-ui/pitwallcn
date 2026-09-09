import { createRoot } from "react-dom/client";
import { HomepageV3 } from "../homepage-v3";
import { getSeasonRaces } from "@/lib/atlas/race-detail";

// Browser-only test entry, never imported by app/page or the production selector.
const settings = document.body.dataset;
const races = getSeasonRaces(new Date("2026-09-09T12:00:00Z"));
const index = races.findIndex(race => race.race.id === settings.event);
const selected = races[Math.max(0, index)];
const race = structuredClone(selected);
if (settings.edge === "empty" && race.circuit) race.circuit.outline = [];
if (settings.edge === "long") race.race.name = "A Very Long International Motorsport Championship Grand Prix";
if (settings.edge === "missing" && race.circuit) { race.circuit.lengthKm = undefined; race.circuit.laps = undefined; }
document.documentElement.style.fontSize = settings.enlarge === "true" ? "32px" : "16px";
createRoot(document.getElementById("root")!).render(<HomepageV3 race={race} phase="next" raceRail={races.slice(Math.max(0,index-1),index+2)} seasonCount={races.length}/>);
