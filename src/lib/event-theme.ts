export type EventTheme = {
  accent: string;
  accentRgb: string;
  support: string;
};

const DEFAULT_EVENT_THEME: EventTheme = {
  accent: "#d7b56d",
  accentRgb: "215 181 109",
  support: "#4d8ba9",
};

const EVENT_THEMES: Partial<Record<string, EventTheme>> = {
  netherlands: { accent: "#d9a35a", accentRgb: "217 163 90", support: "#28749c" },
  belgium: { accent: "#d6a566", accentRgb: "214 165 102", support: "#55758a" },
  hungary: { accent: "#cc866d", accentRgb: "204 134 109", support: "#65769c" },
  italy: { accent: "#b8c77a", accentRgb: "184 199 122", support: "#477f78" },
  singapore: { accent: "#ce816d", accentRgb: "206 129 109", support: "#3c87a1" },
  japan: { accent: "#cf8c83", accentRgb: "207 140 131", support: "#5475a1" },
  australia: { accent: "#d3b16c", accentRgb: "211 177 108", support: "#3d87a9" },
};

export function getEventTheme(eventId: string): EventTheme {
  return EVENT_THEMES[eventId] ?? DEFAULT_EVENT_THEME;
}
