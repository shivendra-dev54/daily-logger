import { db } from "@/db";
import { IUserSchema, users } from "@/db/Schemas/Users.schema";
import { ApiResponse } from "@/Utils/Apiresponse";
import { asyncHandler } from "@/Utils/asyncHandler";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getRefreshToken } from "@/Utils/getRefreshToken";
import { getAccessToken } from "@/Utils/getAccessToken";
import { verifyPassword } from "@/Utils/verifyPassword";

export interface ISignInBody {
  email: string;
  password: string;
}

export const POST = asyncHandler(async (request: NextRequest) => {
  const {
    email,
    password
  }: ISignInBody = await request.json();

  if (!email?.trim() || !password?.trim()) {
    return NextResponse.json(
      new ApiResponse(
        400,
        "All fields are mandatory.",
        false,
        null
      ).toString(),
      { status: 400 }
    );
  }

  const existingEmailUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!existingEmailUser[0]) {
    return NextResponse.json(
      new ApiResponse(
        400,
        "Account with this email doesn't exists.",
        false,
        null
      ).toString(),
      { status: 400 }
    );
  }

  const isPasswordValid = await verifyPassword(
    existingEmailUser[0].password,
    password
  );

  if (!isPasswordValid) {
    return NextResponse.json(
      new ApiResponse(
        400,
        "Invalid email or password.",
        false,
        null
      ).toString(),
      { status: 400 }
    );
  }

  const access_token = await getAccessToken(existingEmailUser[0]);
  const refresh_token = await getRefreshToken(existingEmailUser[0]);

  const user: IUserSchema = {
    ...existingEmailUser[0],
    refresh_token: refresh_token
  }

  await db
    .update(users)
    .set({
      refresh_token,
    })
    .where(eq(users.id, user.id as number));

  const response = NextResponse.json(
    new ApiResponse(
      201,
      "Logged in successfully.",
      true,
      {
        full_name: existingEmailUser[0].full_name,
        username: existingEmailUser[0].username,
        email: existingEmailUser[0].email,
      }
    ).toString(),
    { status: 201 }
  );

  const isProd = process.env.NODE_ENV === "production";

  response.cookies.set({
    name: "access_token",
    value: access_token,
    httpOnly: true,
    path: "/",
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 60 * 60,
  });

  response.cookies.set({
    name: "refresh_token",
    value: refresh_token,
    httpOnly: true,
    path: "/",
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;

}
);