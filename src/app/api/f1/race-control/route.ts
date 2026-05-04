import { NextResponse } from "next/server";
import { getRaceControl } from "@/lib/f1-service";

export async function GET() {
  return NextResponse.json(await getRaceControl());
}
