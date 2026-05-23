import { NextResponse } from "next/server";
import { getOpenF1LiveTiming } from "@/lib/live-timing-service";

export async function GET() {
  return NextResponse.json(await getOpenF1LiveTiming());
}
