import { db } from "@/db";
import { sleep } from "@/db/Schemas/Sleep.schema";
import { summaries } from "@/db/Schemas/Summaries.schema";
import { tasks } from "@/db/Schemas/Tasks.schema";
import { users } from "@/db/Schemas/Users.schema";
import { getAuthUser } from "@/lib/get-auth-user";
import { ApiResponse } from "@/Utils/Apiresponse";
import { asyncHandler } from "@/Utils/asyncHandler";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = asyncHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {

  const requester = await getAuthUser(req);
  if (!requester) {
    return NextResponse.json(
      new ApiResponse(401, "Unauthorized.", false, null).toString(),
      { status: 401 }
    );
  }

  const secret = req.nextUrl.searchParams.get("secret");

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json(
      new ApiResponse(403, "Forbidden: Invalid Admin Secret.", false, null).toString(),
      { status: 403 }
    );
  }

  const { id } = await params;

  const userIdToDelete = parseInt(id);
  if (isNaN(userIdToDelete)) {
    return NextResponse.json(
      new ApiResponse(400, "Invalid User ID.", false, null).toString(),
      { status: 400 }
    );
  }

  await db.transaction(async (tx) => {
    await tx.delete(tasks).where(eq(tasks.user_id, userIdToDelete));
    await tx.delete(summaries).where(eq(summaries.user_id, userIdToDelete));
    await tx.delete(sleep).where(eq(sleep.user_id, userIdToDelete));
    await tx.delete(users).where(eq(users.id, userIdToDelete));
  });

  return NextResponse.json(
    new ApiResponse(
      200,
      `User ${userIdToDelete} deleted successfully.`,
      true,
      null
    ).toString(),
    { status: 200 }
  );
});