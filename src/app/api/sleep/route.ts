import { db } from "@/db";
import { sleep } from "@/db/Schemas/Sleep.schema";
import { getAuthUser } from "@/lib/get-auth-user";
import { ApiResponse } from "@/Utils/Apiresponse";
import { asyncHandler } from "@/Utils/asyncHandler";
import { eq, and, or, lt, gt, lte, gte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

interface ICreateSleepBody {
  start_time: string;
  end_time: string;
}

export const POST = asyncHandler(async (request: NextRequest) => {
  const { start_time, end_time }: ICreateSleepBody = await request.json();

  if (!start_time || !end_time) {
    return NextResponse.json(
      new ApiResponse(400, "All fields are mandatory.", false, null).toString(),
      { status: 400 }
    );
  }

  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json(
      new ApiResponse(401, "Unauthorized.", false, null).toString(),
      { status: 401 }
    );
  }

  const startDate = new Date(start_time);
  const endDate = new Date(end_time);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return NextResponse.json(
      new ApiResponse(400, "Invalid date format.", false, null).toString(),
      { status: 400 }
    );
  }

  if (endDate <= startDate) {
    return NextResponse.json(
      new ApiResponse(400, "End time must be after start time.", false, null).toString(),
      { status: 400 }
    );
  }

  const startTimeUTC = new Date(startDate.toISOString().slice(0, 19).replace('T', ' '));
  const endTimeUTC = new Date(endDate.toISOString().slice(0, 19).replace('T', ' '));

  const overlappingSleep = await db
    .select()
    .from(sleep)
    .where(
      and(
        eq(sleep.user_id, user.id),
        or(
          and(lte(sleep.start_time, startTimeUTC), gt(sleep.end_time, startTimeUTC)),
          and(lt(sleep.start_time, endTimeUTC), gte(sleep.end_time, endTimeUTC)),
          and(gte(sleep.start_time, startTimeUTC), lte(sleep.end_time, endTimeUTC))
        )
      )
    )
    .limit(1);

  if (overlappingSleep.length > 0) {
    return NextResponse.json(
      new ApiResponse(400, "Sleep time overlaps with existing record.", false, null).toString(),
      { status: 400 }
    );
  }

  await db.insert(sleep).values({
    user_id: user.id,
    start_time: startTimeUTC,
    end_time: endTimeUTC,
  });

  return NextResponse.json(
    new ApiResponse(201, "Sleep record created successfully.", true, null).toString(),
    { status: 201 }
  );
});

export const GET = asyncHandler(async (request: NextRequest) => {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json(
      new ApiResponse(401, "Unauthorized", false, null).toString(),
      { status: 401 }
    );
  }

  const userSleeps = await db
    .select()
    .from(sleep)
    .where(eq(sleep.user_id, user.id));

  return NextResponse.json(
    new ApiResponse(200, "Sleep records fetched successfully.", true, userSleeps).toString(),
    { status: 200 }
  );
});