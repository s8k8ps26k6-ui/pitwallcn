export type DriverProfile = {
  code: string;
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
  href: `/drivers/${string}`;
};

export const drivers: DriverProfile[] = [
  {
    code: "NOR",
    name: "Lando Norris",
    team: "McLaren",
    number: "1",
    points: "186",
    status: "P1",
    compound: "HARD",
    laps: "19",
    gap: "LEADER",
    accent: "border-orange-400/40 bg-orange-400/10 text-orange-300",
    image: "/images/feature-ferrari.jpg",
    href: "/drivers/NOR"
  },
  {
    code: "PIA",
    name: "Oscar Piastri",
    team: "McLaren",
    number: "81",
    points: "174",
    status: "P2",
    compound: "MEDIUM",
    laps: "18",
    gap: "+1.248",
    accent: "border-orange-400/40 bg-orange-400/10 text-orange-300",
    image: "/images/feature-ferrari.jpg",
    href: "/drivers/PIA"
  },
  {
    code: "VER",
    name: "Max Verstappen",
    team: "Red Bull Racing",
    number: "3",
    points: "168",
    status: "P3",
    compound: "MEDIUM",
    laps: "18",
    gap: "+2.106",
    accent: "border-blue-500/40 bg-blue-500/10 text-blue-300",
    image: "/images/driver-redbull.jpg",
    href: "/drivers/VER"
  },
  {
    code: "LEC",
    name: "Charles Leclerc",
    team: "Ferrari",
    number: "16",
    points: "151",
    status: "P4",
    compound: "SOFT",
    laps: "14",
    gap: "+3.786",
    accent: "border-neonRed/40 bg-neonRed/10 text-neonRed",
    image: "/images/feature-ferrari.jpg",
    href: "/drivers/LEC"
  },
  {
    code: "HAM",
    name: "Lewis Hamilton",
    team: "Ferrari",
    number: "44",
    points: "139",
    status: "P5",
    compound: "MEDIUM",
    laps: "17",
    gap: "+4.210",
    accent: "border-neonRed/40 bg-neonRed/10 text-neonRed",
    image: "/images/feature-ferrari.jpg",
    href: "/drivers/HAM"
  },
  {
    code: "RUS",
    name: "George Russell",
    team: "Mercedes",
    number: "63",
    points: "128",
    status: "P6",
    compound: "HARD",
    laps: "20",
    gap: "+5.032",
    accent: "border-cyan-300/40 bg-cyan-300/10 text-cyan-200",
    image: "/images/hero.jpg",
    href: "/drivers/RUS"
  },
  {
    code: "ANT",
    name: "Kimi Antonelli",
    team: "Mercedes",
    number: "12",
    points: "112",
    status: "P7",
    compound: "MEDIUM",
    laps: "16",
    gap: "+6.219",
    accent: "border-cyan-300/40 bg-cyan-300/10 text-cyan-200",
    image: "/images/hero.jpg",
    href: "/drivers/ANT"
  },
  {
    code: "SAI",
    name: "Carlos Sainz",
    team: "Williams",
    number: "55",
    points: "96",
    status: "P8",
    compound: "HARD",
    laps: "19",
    gap: "+7.004",
    accent: "border-sky-400/40 bg-sky-400/10 text-sky-300",
    image: "/images/hero.jpg",
    href: "/drivers/SAI"
  },
  {
    code: "ALB",
    name: "Alexander Albon",
    team: "Williams",
    number: "23",
    points: "84",
    status: "P9",
    compound: "MEDIUM",
    laps: "15",
    gap: "+8.380",
    accent: "border-sky-400/40 bg-sky-400/10 text-sky-300",
    image: "/images/hero.jpg",
    href: "/drivers/ALB"
  },
  {
    code: "ALO",
    name: "Fernando Alonso",
    team: "Aston Martin",
    number: "14",
    points: "77",
    status: "P10",
    compound: "HARD",
    laps: "21",
    gap: "+9.114",
    accent: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    image: "/images/hero.jpg",
    href: "/drivers/ALO"
  },
  {
    code: "STR",
    name: "Lance Stroll",
    team: "Aston Martin",
    number: "18",
    points: "64",
    status: "P11",
    compound: "MEDIUM",
    laps: "18",
    gap: "+10.302",
    accent: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    image: "/images/hero.jpg",
    href: "/drivers/STR"
  },
  {
    code: "GAS",
    name: "Pierre Gasly",
    team: "Alpine",
    number: "10",
    points: "58",
    status: "P12",
    compound: "SOFT",
    laps: "13",
    gap: "+11.032",
    accent: "border-pink-400/40 bg-pink-400/10 text-pink-300",
    image: "/images/hero.jpg",
    href: "/drivers/GAS"
  },
  {
    code: "COL",
    name: "Franco Colapinto",
    team: "Alpine",
    number: "43",
    points: "49",
    status: "P13",
    compound: "MEDIUM",
    laps: "17",
    gap: "+12.418",
    accent: "border-pink-400/40 bg-pink-400/10 text-pink-300",
    image: "/images/hero.jpg",
    href: "/drivers/COL"
  },
  {
    code: "OCO",
    name: "Esteban Ocon",
    team: "Haas F1 Team",
    number: "31",
    points: "42",
    status: "P14",
    compound: "HARD",
    laps: "20",
    gap: "+13.101",
    accent: "border-zinc-300/40 bg-zinc-300/10 text-zinc-200",
    image: "/images/hero.jpg",
    href: "/drivers/OCO"
  },
  {
    code: "BEA",
    name: "Oliver Bearman",
    team: "Haas F1 Team",
    number: "87",
    points: "35",
    status: "P15",
    compound: "MEDIUM",
    laps: "16",
    gap: "+14.560",
    accent: "border-zinc-300/40 bg-zinc-300/10 text-zinc-200",
    image: "/images/hero.jpg",
    href: "/drivers/BEA"
  },
  {
    code: "LAW",
    name: "Liam Lawson",
    team: "Racing Bulls",
    number: "30",
    points: "30",
    status: "P16",
    compound: "SOFT",
    laps: "12",
    gap: "+15.018",
    accent: "border-indigo-400/40 bg-indigo-400/10 text-indigo-300",
    image: "/images/hero.jpg",
    href: "/drivers/LAW"
  },
  {
    code: "LIN",
    name: "Arvid Lindblad",
    team: "Racing Bulls",
    number: "41",
    points: "26",
    status: "P17",
    compound: "MEDIUM",
    laps: "15",
    gap: "+16.731",
    accent: "border-indigo-400/40 bg-indigo-400/10 text-indigo-300",
    image: "/images/hero.jpg",
    href: "/drivers/LIN"
  },
  {
    code: "HUL",
    name: "Nico Hülkenberg",
    team: "Audi",
    number: "27",
    points: "22",
    status: "P18",
    compound: "HARD",
    laps: "22",
    gap: "+17.448",
    accent: "border-lime-400/40 bg-lime-400/10 text-lime-300",
    image: "/images/hero.jpg",
    href: "/drivers/HUL"
  },
  {
    code: "BOR",
    name: "Gabriel Bortoleto",
    team: "Audi",
    number: "5",
    points: "18",
    status: "P19",
    compound: "MEDIUM",
    laps: "17",
    gap: "+18.902",
    accent: "border-lime-400/40 bg-lime-400/10 text-lime-300",
    image: "/images/hero.jpg",
    href: "/drivers/BOR"
  },
  {
    code: "PER",
    name: "Sergio Perez",
    team: "Cadillac",
    number: "11",
    points: "15",
    status: "P20",
    compound: "HARD",
    laps: "20",
    gap: "+19.554",
    accent: "border-violet-400/40 bg-violet-400/10 text-violet-300",
    image: "/images/hero.jpg",
    href: "/drivers/PER"
  },
  {
    code: "BOT",
    name: "Valtteri Bottas",
    team: "Cadillac",
    number: "77",
    points: "11",
    status: "P21",
    compound: "MEDIUM",
    laps: "18",
    gap: "+20.118",
    accent: "border-violet-400/40 bg-violet-400/10 text-violet-300",
    image: "/images/hero.jpg",
    href: "/drivers/BOT"
  },
  {
    code: "HAD",
    name: "Isack Hadjar",
    team: "Red Bull Racing",
    number: "6",
    points: "8",
    status: "P22",
    compound: "SOFT",
    laps: "11",
    gap: "+21.421",
    accent: "border-blue-500/40 bg-blue-500/10 text-blue-300",
    image: "/images/driver-redbull.jpg",
    href: "/drivers/HAD"
  }
];

export function getDriverProfile(code: string) {
  return drivers.find((driver) => driver.code === code.toUpperCase()) ?? drivers[0];
}
