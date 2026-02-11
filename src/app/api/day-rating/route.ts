import { db } from "@/db";
import { summaries } from "@/db/Schemas/Summaries.schema";
import { getAuthUser } from "@/lib/get-auth-user";
import { ApiResponse } from "@/Utils/Apiresponse";
import { asyncHandler } from "@/Utils/asyncHandler";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = asyncHandler(async (request: NextRequest) => {
  const user = await getAuthUser(request);

  if (!user) {
    return NextResponse.json(
      new ApiResponse(401, "Unauthorized", false, null).toString(),
      { status: 401 }
    );
  }

  const userRatings = await db
    .select({
      date: summaries.date,
      rating: summaries.rating
    })
    .from(summaries)
    .where(eq(summaries.user_id, user.id));

  return NextResponse.json(
    new ApiResponse(
      200,
      "Ratings fetched successfully.",
      true,
      userRatings
    ).toString(),
    { status: 200 }
  );
});