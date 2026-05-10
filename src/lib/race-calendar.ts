import type { RaceWeekend, ScheduleSession } from "@/lib/types";

type CalendarRaceInput = {
  id: string;
  raceName: string;
  country: string;
  location: string;
  circuitName: string;
  timeZone: string;
  startDate: string;
  endDate: string;
  raceStart: string;
  sprint?: boolean;
  confirmedSessions?: ScheduleSession[];
};

function tbdSession(name: string, iso: string): ScheduleSession {
  return { name, startTime: iso, isTimeConfirmed: false };
}

function buildSessions(race: CalendarRaceInput): ScheduleSession[] {
  if (race.confirmedSessions?.length) return race.confirmedSessions;

  const start = new Date(race.startDate);
  const end = new Date(race.endDate);
  const saturday = new Date(end);
  saturday.setUTCDate(end.getUTCDate() - 1);

  if (race.sprint) {
    return [
      tbdSession("第一次自由练习赛", race.startDate),
      tbdSession("冲刺排位赛", race.startDate),
      tbdSession("冲刺赛", saturday.toISOString()),
      tbdSession("排位赛", saturday.toISOString()),
      tbdSession("正赛", race.raceStart)
    ];
  }

  return [
    tbdSession("第一次自由练习赛", race.startDate),
    tbdSession("第二次自由练习赛", race.startDate),
    tbdSession("第三次自由练习赛", saturday.toISOString()),
    tbdSession("排位赛", saturday.toISOString()),
    tbdSession("正赛", race.raceStart)
  ];
}

function race(input: CalendarRaceInput): RaceWeekend {
  return {
    id: input.id,
    raceName: input.raceName,
    country: input.country,
    location: input.location,
    circuitName: input.circuitName,
    timeZone: input.timeZone,
    startDate: input.startDate,
    endDate: input.endDate,
    countdownTarget: input.raceStart,
    sessions: buildSessions(input)
  };
}

export const officialRaceCalendar2026: RaceWeekend[] = [
  race({
    id: "2026-australia",
    raceName: "澳大利亚大奖赛",
    country: "澳大利亚",
    location: "墨尔本",
    circuitName: "阿尔伯特公园赛道",
    timeZone: "Australia/Melbourne",
    startDate: "2026-03-06T12:00:00Z",
    endDate: "2026-03-08T12:00:00Z",
    raceStart: "2026-03-08T04:00:00Z"
  }),
  race({
    id: "2026-china",
    raceName: "中国大奖赛",
    country: "中国",
    location: "上海",
    circuitName: "上海国际赛车场",
    timeZone: "Asia/Shanghai",
    startDate: "2026-03-13T12:00:00Z",
    endDate: "2026-03-15T12:00:00Z",
    raceStart: "2026-03-15T07:00:00Z",
    sprint: true
  }),
  race({
    id: "2026-japan",
    raceName: "日本大奖赛",
    country: "日本",
    location: "铃鹿",
    circuitName: "铃鹿赛道",
    timeZone: "Asia/Tokyo",
    startDate: "2026-03-27T12:00:00Z",
    endDate: "2026-03-29T12:00:00Z",
    raceStart: "2026-03-29T05:00:00Z"
  }),
  race({
    id: "2026-miami",
    raceName: "迈阿密大奖赛",
    country: "美国",
    location: "迈阿密",
    circuitName: "迈阿密国际赛车场",
    timeZone: "America/New_York",
    startDate: "2026-05-01T12:00:00Z",
    endDate: "2026-05-03T12:00:00Z",
    raceStart: "2026-05-03T20:00:00Z",
    sprint: true
  }),
  race({
    id: "2026-canada",
    raceName: "加拿大大奖赛",
    country: "加拿大",
    location: "蒙特利尔",
    circuitName: "吉尔斯·维伦纽夫赛道",
    timeZone: "America/Toronto",
    startDate: "2026-05-22T16:30:00Z",
    endDate: "2026-05-24T22:00:00Z",
    raceStart: "2026-05-24T20:00:00Z",
    sprint: true,
    confirmedSessions: [
      { name: "第一次自由练习赛", startTime: "2026-05-22T16:30:00Z", isTimeConfirmed: true },
      { name: "冲刺排位赛", startTime: "2026-05-22T20:30:00Z", isTimeConfirmed: true },
      { name: "冲刺赛", startTime: "2026-05-23T16:00:00Z", isTimeConfirmed: true },
      { name: "排位赛", startTime: "2026-05-23T20:00:00Z", isTimeConfirmed: true },
      { name: "正赛", startTime: "2026-05-24T20:00:00Z", isTimeConfirmed: true }
    ]
  }),
  race({
    id: "2026-monaco",
    raceName: "摩纳哥大奖赛",
    country: "摩纳哥",
    location: "蒙特卡洛",
    circuitName: "摩纳哥赛道",
    timeZone: "Europe/Monaco",
    startDate: "2026-06-05T12:00:00Z",
    endDate: "2026-06-07T12:00:00Z",
    raceStart: "2026-06-07T13:00:00Z"
  }),
  race({
    id: "2026-barcelona-catalunya",
    raceName: "巴塞罗那-加泰罗尼亚大奖赛",
    country: "西班牙",
    location: "巴塞罗那-加泰罗尼亚",
    circuitName: "巴塞罗那-加泰罗尼亚赛道",
    timeZone: "Europe/Madrid",
    startDate: "2026-06-12T12:00:00Z",
    endDate: "2026-06-14T12:00:00Z",
    raceStart: "2026-06-14T13:00:00Z"
  }),
  race({
    id: "2026-austria",
    raceName: "奥地利大奖赛",
    country: "奥地利",
    location: "施皮尔贝格",
    circuitName: "红牛环赛道",
    timeZone: "Europe/Vienna",
    startDate: "2026-06-26T12:00:00Z",
    endDate: "2026-06-28T12:00:00Z",
    raceStart: "2026-06-28T13:00:00Z"
  }),
  race({
    id: "2026-great-britain",
    raceName: "英国大奖赛",
    country: "英国",
    location: "银石",
    circuitName: "银石赛道",
    timeZone: "Europe/London",
    startDate: "2026-07-03T12:00:00Z",
    endDate: "2026-07-05T12:00:00Z",
    raceStart: "2026-07-05T14:00:00Z",
    sprint: true
  }),
  race({
    id: "2026-belgium",
    raceName: "比利时大奖赛",
    country: "比利时",
    location: "斯帕-弗朗科尔尚",
    circuitName: "斯帕-弗朗科尔尚赛道",
    timeZone: "Europe/Brussels",
    startDate: "2026-07-17T12:00:00Z",
    endDate: "2026-07-19T12:00:00Z",
    raceStart: "2026-07-19T13:00:00Z"
  }),
  race({
    id: "2026-hungary",
    raceName: "匈牙利大奖赛",
    country: "匈牙利",
    location: "布达佩斯",
    circuitName: "亨格罗宁赛道",
    timeZone: "Europe/Budapest",
    startDate: "2026-07-24T12:00:00Z",
    endDate: "2026-07-26T12:00:00Z",
    raceStart: "2026-07-26T13:00:00Z"
  }),
  race({
    id: "2026-netherlands",
    raceName: "荷兰大奖赛",
    country: "荷兰",
    location: "赞德福特",
    circuitName: "赞德福特赛道",
    timeZone: "Europe/Amsterdam",
    startDate: "2026-08-21T12:00:00Z",
    endDate: "2026-08-23T12:00:00Z",
    raceStart: "2026-08-23T13:00:00Z",
    sprint: true
  }),
  race({
    id: "2026-italy",
    raceName: "意大利大奖赛",
    country: "意大利",
    location: "蒙扎",
    circuitName: "蒙扎国家赛车场",
    timeZone: "Europe/Rome",
    startDate: "2026-09-04T12:00:00Z",
    endDate: "2026-09-06T12:00:00Z",
    raceStart: "2026-09-06T13:00:00Z"
  }),
  race({
    id: "2026-spain-madrid",
    raceName: "西班牙大奖赛",
    country: "西班牙",
    location: "马德里",
    circuitName: "马德里赛道",
    timeZone: "Europe/Madrid",
    startDate: "2026-09-11T12:00:00Z",
    endDate: "2026-09-13T12:00:00Z",
    raceStart: "2026-09-13T13:00:00Z"
  }),
  race({
    id: "2026-azerbaijan",
    raceName: "阿塞拜疆大奖赛",
    country: "阿塞拜疆",
    location: "巴库",
    circuitName: "巴库城市赛道",
    timeZone: "Asia/Baku",
    startDate: "2026-09-24T12:00:00Z",
    endDate: "2026-09-26T12:00:00Z",
    raceStart: "2026-09-26T11:00:00Z"
  }),
  race({
    id: "2026-singapore",
    raceName: "新加坡大奖赛",
    country: "新加坡",
    location: "新加坡",
    circuitName: "滨海湾街道赛道",
    timeZone: "Asia/Singapore",
    startDate: "2026-10-09T12:00:00Z",
    endDate: "2026-10-11T12:00:00Z",
    raceStart: "2026-10-11T12:00:00Z",
    sprint: true
  }),
  race({
    id: "2026-united-states",
    raceName: "美国大奖赛",
    country: "美国",
    location: "奥斯汀",
    circuitName: "美洲赛道",
    timeZone: "America/Chicago",
    startDate: "2026-10-23T12:00:00Z",
    endDate: "2026-10-25T12:00:00Z",
    raceStart: "2026-10-25T19:00:00Z"
  }),
  race({
    id: "2026-mexico",
    raceName: "墨西哥城大奖赛",
    country: "墨西哥",
    location: "墨西哥城",
    circuitName: "罗德里格斯兄弟赛道",
    timeZone: "America/Mexico_City",
    startDate: "2026-10-30T12:00:00Z",
    endDate: "2026-11-01T12:00:00Z",
    raceStart: "2026-11-01T20:00:00Z"
  }),
  race({
    id: "2026-brazil",
    raceName: "圣保罗大奖赛",
    country: "巴西",
    location: "圣保罗",
    circuitName: "若泽·卡洛斯·帕斯赛道",
    timeZone: "America/Sao_Paulo",
    startDate: "2026-11-06T12:00:00Z",
    endDate: "2026-11-08T12:00:00Z",
    raceStart: "2026-11-08T17:00:00Z"
  }),
  race({
    id: "2026-las-vegas",
    raceName: "拉斯维加斯大奖赛",
    country: "美国",
    location: "拉斯维加斯",
    circuitName: "拉斯维加斯街道赛道",
    timeZone: "America/Los_Angeles",
    startDate: "2026-11-19T12:00:00Z",
    endDate: "2026-11-21T12:00:00Z",
    raceStart: "2026-11-22T04:00:00Z"
  }),
  race({
    id: "2026-qatar",
    raceName: "卡塔尔大奖赛",
    country: "卡塔尔",
    location: "卢赛尔",
    circuitName: "卢赛尔国际赛道",
    timeZone: "Asia/Qatar",
    startDate: "2026-11-27T12:00:00Z",
    endDate: "2026-11-29T12:00:00Z",
    raceStart: "2026-11-29T16:00:00Z"
  }),
  race({
    id: "2026-abu-dhabi",
    raceName: "阿布扎比大奖赛",
    country: "阿联酋",
    location: "阿布扎比",
    circuitName: "亚斯码头赛道",
    timeZone: "Asia/Dubai",
    startDate: "2026-12-04T12:00:00Z",
    endDate: "2026-12-06T12:00:00Z",
    raceStart: "2026-12-06T13:00:00Z"
  })
];

export function findNextRaceFromCalendar(now = new Date(), calendar = officialRaceCalendar2026) {
  const sorted = [...calendar].sort((a, b) => new Date(a.countdownTarget).getTime() - new Date(b.countdownTarget).getTime());
  return sorted.find((item) => new Date(item.countdownTarget).getTime() >= now.getTime()) ?? sorted[0];
}
