import { db } from "@/db";
import { sleep } from "@/db/Schemas/Sleep.schema";
import { getAuthUser } from "@/lib/get-auth-user";
import { ApiResponse } from "@/Utils/Apiresponse";
import { asyncHandler } from "@/Utils/asyncHandler";
import { eq, and, or, lt, gt, lte, gte, ne } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = asyncHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const sleepId = Number(id);

    if (isNaN(sleepId)) {
      return NextResponse.json(
        new ApiResponse(400, "Invalid sleep id", false, null).toString(),
        { status: 400 }
      );
    }

    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        new ApiResponse(401, "Unauthorized", false, null).toString(),
        { status: 401 }
      );
    }

    const [sleepRecord] = await db
      .select()
      .from(sleep)
      .where(and(eq(sleep.id, sleepId), eq(sleep.user_id, user.id)))
      .limit(1);

    if (!sleepRecord) {
      return NextResponse.json(
        new ApiResponse(404, "Sleep record not found", false, null).toString(),
        { status: 404 }
      );
    }

    return NextResponse.json(
      new ApiResponse(200, "Sleep record fetched", true, sleepRecord).toString(),
      { status: 200 }
    );
  }
);

interface IUpdateSleepBody {
  start_time?: string;
  end_time?: string;
}

export const PATCH = asyncHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const sleepId = Number(id);

    if (isNaN(sleepId)) {
      return NextResponse.json(
        new ApiResponse(400, "Invalid sleep id", false, null).toString(),
        { status: 400 }
      );
    }

    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        new ApiResponse(401, "Unauthorized", false, null).toString(),
        { status: 401 }
      );
    }

    const updates: IUpdateSleepBody = await request.json();

    if (!Object.keys(updates).length) {
      return NextResponse.json(
        new ApiResponse(400, "No fields to update", false, null).toString(),
        { status: 400 }
      );
    }

    const [existingSleep] = await db
      .select()
      .from(sleep)
      .where(and(eq(sleep.id, sleepId), eq(sleep.user_id, user.id)))
      .limit(1);

    if (!existingSleep) {
      return NextResponse.json(
        new ApiResponse(404, "Sleep record not found", false, null).toString(),
        { status: 404 }
      );
    }

    const updateData = {
      start_time: existingSleep.start_time,
      end_time: existingSleep.end_time
    };

    let finalStartTime = existingSleep.start_time;
    let finalEndTime = existingSleep.end_time;

    if (updates.start_time !== undefined) {
      const startDate = new Date(updates.start_time);
      if (isNaN(startDate.getTime())) {
        return NextResponse.json(
          new ApiResponse(400, "Invalid start time format.", false, null).toString(),
          { status: 400 }
        );
      }
      const startTimeUTC = new Date(startDate.toISOString().slice(0, 19).replace('T', ' '));
      updateData.start_time = startTimeUTC;
      finalStartTime = startTimeUTC;
    }

    if (updates.end_time !== undefined) {
      const endDate = new Date(updates.end_time);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          new ApiResponse(400, "Invalid end time format.", false, null).toString(),
          { status: 400 }
        );
      }
      const endTimeUTC = new Date(endDate.toISOString().slice(0, 19).replace('T', ' '));
      updateData.end_time = endTimeUTC;
      finalEndTime = endTimeUTC;
    }

    if (new Date(finalEndTime) <= new Date(finalStartTime)) {
      return NextResponse.json(
        new ApiResponse(400, "End time must be after start time.", false, null).toString(),
        { status: 400 }
      );
    }

    const overlappingSleep = await db
      .select()
      .from(sleep)
      .where(
        and(
          eq(sleep.user_id, user.id),
          ne(sleep.id, sleepId),
          or(
            and(lte(sleep.start_time, finalStartTime), gt(sleep.end_time, finalStartTime)),
            and(lt(sleep.start_time, finalEndTime), gte(sleep.end_time, finalEndTime)),
            and(gte(sleep.start_time, finalStartTime), lte(sleep.end_time, finalEndTime))
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

    await db
      .update(sleep)
      .set(updateData)
      .where(and(eq(sleep.id, sleepId), eq(sleep.user_id, user.id)));

    return NextResponse.json(
      new ApiResponse(200, "Sleep record updated successfully.", true, null).toString(),
      { status: 200 }
    );
  }
);

export const DELETE = asyncHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const sleepId = Number(id);

    if (isNaN(sleepId)) {
      return NextResponse.json(
        new ApiResponse(400, "Invalid sleep id", false, null).toString(),
        { status: 400 }
      );
    }

    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        new ApiResponse(401, "Unauthorized", false, null).toString(),
        { status: 401 }
      );
    }

    const [existingSleep] = await db
      .select()
      .from(sleep)
      .where(and(eq(sleep.id, sleepId), eq(sleep.user_id, user.id)))
      .limit(1);

    if (!existingSleep) {
      return NextResponse.json(
        new ApiResponse(404, "Sleep record not found", false, null).toString(),
        { status: 404 }
      );
    }

    await db
      .delete(sleep)
      .where(and(eq(sleep.id, sleepId), eq(sleep.user_id, user.id)));

    return NextResponse.json(
      new ApiResponse(200, "Sleep record deleted successfully.", true, null).toString(),
      { status: 200 }
    );
  }
);