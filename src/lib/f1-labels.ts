export function parseSessionKey(value?: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatSessionTime(iso: string) {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "时间未知";

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai"
  }).format(parsed);
}

export function translateSessionName(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes("sprint qualifying") || normalized.includes("sprint shootout")) return "冲刺排位赛";
  if (normalized.includes("sprint")) return "冲刺赛";
  if (normalized.includes("qualifying")) return "排位赛";
  if (normalized === "race" || normalized.includes("race")) return "正赛";
  if (normalized.includes("practice 1") || normalized.includes("free practice 1")) return "第一次自由练习赛";
  if (normalized.includes("practice 2") || normalized.includes("free practice 2")) return "第二次自由练习赛";
  if (normalized.includes("practice 3") || normalized.includes("free practice 3")) return "第三次自由练习赛";
  if (normalized.includes("practice")) return "自由练习赛";
  return name;
}

export function translateMeetingName(name: string) {
  const replacements: Array<[RegExp, string]> = [
    [/Australian Grand Prix/i, "澳大利亚大奖赛"],
    [/Chinese Grand Prix/i, "中国大奖赛"],
    [/Japanese Grand Prix/i, "日本大奖赛"],
    [/Miami Grand Prix/i, "迈阿密大奖赛"],
    [/Canadian Grand Prix/i, "加拿大大奖赛"],
    [/Monaco Grand Prix/i, "摩纳哥大奖赛"],
    [/Spanish Grand Prix/i, "西班牙大奖赛"],
    [/Austrian Grand Prix/i, "奥地利大奖赛"],
    [/British Grand Prix/i, "英国大奖赛"],
    [/Belgian Grand Prix/i, "比利时大奖赛"],
    [/Hungarian Grand Prix/i, "匈牙利大奖赛"],
    [/Dutch Grand Prix/i, "荷兰大奖赛"],
    [/Italian Grand Prix/i, "意大利大奖赛"],
    [/Azerbaijan Grand Prix/i, "阿塞拜疆大奖赛"],
    [/Singapore Grand Prix/i, "新加坡大奖赛"],
    [/United States Grand Prix/i, "美国大奖赛"],
    [/Mexico City Grand Prix/i, "墨西哥城大奖赛"],
    [/(São|Sao) Paulo Grand Prix/i, "圣保罗大奖赛"],
    [/Las Vegas Grand Prix/i, "拉斯维加斯大奖赛"],
    [/Qatar Grand Prix/i, "卡塔尔大奖赛"],
    [/Abu Dhabi Grand Prix/i, "阿布扎比大奖赛"]
  ];

  return replacements.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), name);
}

export function sourceLabel(source: string) {
  if (source === "openf1") return "OPENF1 · DATA AVAILABLE";
  if (source.includes("error")) return "OPENF1 · UNAVAILABLE";
  if (source.includes("empty")) return "OPENF1 · NO RECORDS";
  if (source.includes("waiting")) return "OPENF1 · WAITING";
  return source.toUpperCase();
}
