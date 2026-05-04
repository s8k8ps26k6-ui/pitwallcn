import { NextResponse } from "next/server";
import { getStandings } from "@/lib/f1-service";

export async function GET() {
  return NextResponse.json(await getStandings());
}
