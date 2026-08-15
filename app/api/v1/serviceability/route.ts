import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { prisma } from "@/lib/db";
import { INITIAL_SERVICE_AREAS } from "@/lib/store";

export const dynamic = "force-dynamic";

export const GET = apiWrapper(async (_req: NextRequest) => {
  try {
    const areas = INITIAL_SERVICE_AREAS;

    // Group by state
    const statesMap: Record<string, { city: string; pincode: string }[]> = {};

    areas.forEach((area) => {
      if (!statesMap[area.state]) {
        statesMap[area.state] = [];
      }
      // Avoid duplicate cities under same state
      if (!statesMap[area.state].some((c) => c.city.toLowerCase() === area.city.toLowerCase())) {
        statesMap[area.state].push({ city: area.city, pincode: area.pincode });
      }
    });

    const states = Object.keys(statesMap).map((stateName) => ({
      name: stateName,
      cities: statesMap[stateName],
    }));

    return NextResponse.json({
      success: true,
      data: {
        states,
        rawAreas: areas,
      },
    });
  } catch (error) {
    // Store fallback
    const statesMap: Record<string, { city: string; pincode: string }[]> = {};
    INITIAL_SERVICE_AREAS.forEach((area) => {
      if (!statesMap[area.state]) {
        statesMap[area.state] = [];
      }
      if (!statesMap[area.state].some((c) => c.city.toLowerCase() === area.city.toLowerCase())) {
        statesMap[area.state].push({ city: area.city, pincode: area.pincode });
      }
    });
    const states = Object.keys(statesMap).map((stateName) => ({
      name: stateName,
      cities: statesMap[stateName],
    }));

    return NextResponse.json({
      success: true,
      data: {
        states,
        rawAreas: INITIAL_SERVICE_AREAS,
      },
    });
  }
});
