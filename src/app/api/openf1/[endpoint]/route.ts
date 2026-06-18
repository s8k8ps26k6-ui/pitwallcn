import { NextRequest, NextResponse } from "next/server";
import {
  fetchOpenF1,
  OPENF1_REVALIDATE_SECONDS,
  OpenF1RequestError
} from "@/lib/openf1-client";
import {
  isOpenF1Endpoint,
  validateOpenF1SearchParams
} from "@/lib/openf1-validation";

export const revalidate = OPENF1_REVALIDATE_SECONDS;

type RouteContext = {
  params: {
    endpoint: string;
  };
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { endpoint } = params;

  if (!isOpenF1Endpoint(endpoint)) {
    return NextResponse.json(
      { error: "Unsupported OpenF1 endpoint" },
      { status: 404 }
    );
  }

  const validation = validateOpenF1SearchParams(endpoint, request.nextUrl.searchParams);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  try {
    const data = await fetchOpenF1<unknown>(`/${endpoint}`, validation.params);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": `public, s-maxage=${OPENF1_REVALIDATE_SECONDS}, stale-while-revalidate=60`
      }
    });
  } catch (error) {
    const message = error instanceof OpenF1RequestError
      ? "OpenF1 data is temporarily unavailable"
      : "Unable to load OpenF1 data";

    return NextResponse.json(
      { error: message },
      { status: 502 }
    );
  }
}
