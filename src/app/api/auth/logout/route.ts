import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/Utils/Apiresponse";
import { asyncHandler } from "@/Utils/asyncHandler";
import { db } from "@/db";
import { users } from "@/db/Schemas/Users.schema";
import { eq } from "drizzle-orm";

export const POST = asyncHandler(async (request: NextRequest) => {
  const refresh_token_old = request.cookies.get("refresh_token")?.value;

  if (!refresh_token_old?.trim()) {
    return NextResponse.json(
      new ApiResponse(
        400,
        "Refresh token not found.",
        false,
        null
      ).toString(),
      { status: 400 }
    );
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.refresh_token, refresh_token_old))
    .limit(1);

  if (existingUser.length === 0) {
    return NextResponse.json(
      new ApiResponse(
        401,
        "Refresh token does not match database.",
        false,
        null
      ).toString(),
      { status: 401 }
    );
  }

  const user = existingUser[0];

  await db
    .update(users)
    .set({
      refresh_token: null,
    })
    .where(eq(users.id, user.id));


  const response = NextResponse.json(
    new ApiResponse(
      201,
      "Logged out successfully.",
      true,
      null
    ).toString(),
    { status: 201 }
  );

  const isProd = process.env.NODE_ENV === "production";

  response.cookies.set({
    name: "access_token",
    value: "",
    httpOnly: true,
    path: "/",
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 0,
  });

  response.cookies.set({
    name: "refresh_token",
    value: "",
    httpOnly: true,
    path: "/",
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 0,
  });

  return response;
});
