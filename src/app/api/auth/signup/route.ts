import { db } from "@/db";
import { users } from "@/db/Schemas/Users.schema";
import { ApiResponse } from "@/Utils/Apiresponse";
import { asyncHandler } from "@/Utils/asyncHandler";
import { hashPassword } from "@/Utils/hashPassword";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export interface ISignUpBody {
  full_name: string;
  username: string;
  email: string;
  password: string;
}

export interface IUserSchema {
  id?: number,
  username: string,
  full_name: string,
  email: string,
  password: string,
  refresh_token: string | null
}

export const POST = asyncHandler(async (request: NextRequest) => {
  const {
    full_name,
    username,
    email,
    password
  }: ISignUpBody = await request.json();

  if (!username?.trim() || !email?.trim() || !password?.trim() || !full_name?.trim()) {
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

  const existingEmail = await db
    .select({
      username: users.username,
      email: users.email,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingEmail.length > 0) {
    return NextResponse.json(
      new ApiResponse(
        400,
        "Account with this email already exists.",
        false,
        null
      ).toString(),
      { status: 400 }
    );
  }

  const existingUsername = await db
    .select({
      username: users.username,
      email: users.email,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existingUsername.length > 0) {
    return NextResponse.json(
      new ApiResponse(
        400,
        "Account with this username already exists.",
        false,
        null
      ).toString(),
      { status: 400 }
    );
  }

  const hashedPassword = await hashPassword(password);

  const user: IUserSchema = {
    full_name,
    username,
    email,
    password: hashedPassword,
    refresh_token: null
  }

  await db
    .insert(users)
    .values(user);

  return NextResponse.json(
    new ApiResponse(
      201,
      "Registered new user successfully.",
      true,
      { username, email }
    ).toString(),
    { status: 201 }
  );
}
);