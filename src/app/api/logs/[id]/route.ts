import { db } from "@/db";
import { summaries } from "@/db/Schemas/Summaries.schema";
import { decrypt, encrypt } from "@/lib/encryption";
import { getAuthUser } from "@/lib/get-auth-user";
import { ApiResponse } from "@/Utils/Apiresponse";
import { asyncHandler } from "@/Utils/asyncHandler";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = asyncHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const logId = Number(id);

    if (isNaN(logId)) {
      return NextResponse.json(
        new ApiResponse(400, "Invalid log id", false, null).toString(),
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

    const [log] = await db
      .select()
      .from(summaries)
      .where(and(eq(summaries.id, logId), eq(summaries.user_id, user.id)))
      .limit(1);

    if (!log) {
      return NextResponse.json(
        new ApiResponse(404, "Log not found", false, null).toString(),
        { status: 404 }
      );
    }

    return NextResponse.json(
      new ApiResponse(200, "Log fetched", true, {
        ...log,
        summary: decrypt(log.summary),
      }).toString(),
      { status: 200 }
    );
  }
);


export const PATCH = asyncHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    const logId = Number(id);

    if (isNaN(logId)) {
      return NextResponse.json(
        new ApiResponse(400, "Invalid log id.", false, null).toString(),
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

    const [existingLog] = await db
      .select()
      .from(summaries)
      .where(
        and(
          eq(summaries.id, logId),
          eq(summaries.user_id, user.id)
        )
      )
      .limit(1);

    if (!existingLog) {
      return NextResponse.json(
        new ApiResponse(404, "Log not found.", false, null).toString(),
        { status: 404 }
      );
    }

    const body = (await request.json()) as {
      summary?: string;
      rating?: string | number;
    };

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        new ApiResponse(400, "No fields provided for update.", false, null).toString(),
        { status: 400 }
      );
    }

    const updateData: {
      summary?: string;
      rating?: number;
    } = {};

    if (body.summary !== undefined) {
      const trimmed = body.summary.trim();

      if (!trimmed) {
        return NextResponse.json(
          new ApiResponse(400, "Summary cannot be empty.", false, null).toString(),
          { status: 400 }
        );
      }

      updateData.summary = encrypt(trimmed);
    }

    if (body.rating !== undefined) {
      const parsedRating = Number(body.rating);

      if (isNaN(parsedRating)) {
        return NextResponse.json(
          new ApiResponse(400, "Rating must be a valid number.", false, null).toString(),
          { status: 400 }
        );
      }

      updateData.rating = parsedRating;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        new ApiResponse(400, "Nothing valid to update.", false, null).toString(),
        { status: 400 }
      );
    }

    await db
      .update(summaries)
      .set(updateData)
      .where(
        and(
          eq(summaries.id, logId),
          eq(summaries.user_id, user.id)
        )
      );

    return NextResponse.json(
      new ApiResponse(200, "Log updated successfully.", true, null).toString(),
      { status: 200 }
    );
  }
);




export const DELETE = asyncHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const logId = Number(id);

    if (isNaN(logId)) {
      return NextResponse.json(
        new ApiResponse(400, "Invalid log id", false, null).toString(),
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

    const result = await db
      .delete(summaries)
      .where(and(eq(summaries.id, logId), eq(summaries.user_id, user.id)))
      .returning();

    if (!result[0]) {
      return NextResponse.json(
        new ApiResponse(404, "Log not found", false, null).toString(),
        { status: 404 }
      );
    }

    return NextResponse.json(
      new ApiResponse(200, "Log deleted successfully.", true, null).toString(),
      { status: 200 }
    );
  }
);
