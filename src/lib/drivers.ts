export type DriverProfile = {
  code: "VER" | "NOR" | "LEC";
  name: string;
  team: string;
  number: string;
  points: string;
  status: string;
  compound: string;
  laps: string;
  gap: string;
  accent: string;
  image: string;
};

export const drivers: DriverProfile[] = [
  {
    code: "VER",
    name: "Max Verstappen",
    team: "Red Bull Racing",
    number: "1",
    points: "168",
    status: "P1",
    compound: "MEDIUM",
    laps: "18",
    gap: "LEADER",
    accent: "border-blue-500/40 bg-blue-500/10 text-blue-300",
    image: "/images/driver-redbull.jpg"
  },
  {
    code: "NOR",
    name: "Lando Norris",
    team: "McLaren",
    number: "4",
    points: "142",
    status: "P2",
    compound: "HARD",
    laps: "16",
    gap: "+1.421",
    accent: "border-orange-400/40 bg-orange-400/10 text-orange-300",
    image: "/images/feature-ferrari.jpg"
  },
  {
    code: "LEC",
    name: "Charles Leclerc",
    team: "Ferrari",
    number: "16",
    points: "119",
    status: "P3",
    compound: "SOFT",
    laps: "14",
    gap: "+3.786",
    accent: "border-neonRed/40 bg-neonRed/10 text-neonRed",
    image: "/images/feature-ferrari.jpg"
  }
];

export function getDriverProfile(code: string) {
  return drivers.find((driver) => driver.code === code.toUpperCase()) ?? drivers[0];
}
