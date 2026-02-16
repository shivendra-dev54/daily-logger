import { db } from "@/db";
import { summaries } from "@/db/Schemas/Summaries.schema";
import { decrypt, encrypt } from "@/lib/encryption";
import { getAuthUser } from "@/lib/get-auth-user";
import { ApiResponse } from "@/Utils/Apiresponse";
import { asyncHandler } from "@/Utils/asyncHandler";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const POST = asyncHandler(async (request: NextRequest) => {
  const body = (await request.json()) as {
    summary: string;
    rating: string | number;
    date: string;
  };

  const { summary, rating, date } = body;

  if (!summary?.trim() || rating === undefined || !date) {
    return NextResponse.json(
      new ApiResponse(400, "All fields are mandatory.", false, null).toString(),
      { status: 400 }
    );
  }

  const parsedRating = Number(rating);
  if (isNaN(parsedRating)) {
    return NextResponse.json(
      new ApiResponse(400, "Rating must be a number.", false, null).toString(),
      { status: 400 }
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      new ApiResponse(400, "Date must be YYYY-MM-DD.", false, null).toString(),
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


  const formatted_date = new Date(date + "T00:00:00");

  const [existing_log] = await db
    .select()
    .from(summaries)
    .where(and(
      eq(summaries.user_id, user.id),
      eq(summaries.date, formatted_date.toDateString())
    ))

  if (existing_log) {
    return NextResponse.json(
      new ApiResponse(
        400,
        "Summary for this date already exists.",
        false,
        existing_log
      ).toString(),
      { status: 400 }
    );
  }

  await db.insert(summaries).values({
    summary: encrypt(summary.trim()),
    rating: parsedRating,
    user_id: user.id,
    date: formatted_date.toDateString(),
  });

  return NextResponse.json(
    new ApiResponse(201, "Summary created successfully.", true, null).toString(),
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

  const userLogs = await db
    .select()
    .from(summaries)
    .where(eq(summaries.user_id, user.id))
    .orderBy(desc(summaries.date));

  userLogs.map((log) => {
    log.summary = decrypt(log.summary)
  })

  return NextResponse.json(
    new ApiResponse(
      200,
      "Logs fetched successfully.",
      true,
      userLogs
    ).toString(),
    { status: 200 }
  );
});
