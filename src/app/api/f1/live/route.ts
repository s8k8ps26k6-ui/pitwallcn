import { NextResponse } from "next/server";
import { getLiveTiming } from "@/lib/f1-service";

export async function GET() {
  return NextResponse.json(await getLiveTiming());
}
