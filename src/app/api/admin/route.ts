import { db } from "@/db";
import { users } from "@/db/Schemas/Users.schema";
import { getAuthUser } from "@/lib/get-auth-user";
import { ApiResponse } from "@/Utils/Apiresponse";
import { asyncHandler } from "@/Utils/asyncHandler";
import { NextRequest, NextResponse } from "next/server";

export interface ISignInBody {
  email: string;
  password: string;
}

export const POST = asyncHandler(async (req: NextRequest) => {

  const { secret } = await req.json();

  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      new ApiResponse(401, "Unauthorized.", false, null).toString(),
      { status: 401 }
    );
  }

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json(
      new ApiResponse(
        201,
        "Not an admin.",
        true,
        null
      ).toString(),
      { status: 201 }
    );
  }

  const users_from_db = await db
    .select()
    .from(users);

  return NextResponse.json(
    new ApiResponse(
      201,
      "Logged in successfully.",
      true,
      users_from_db
    ).toString(),
    { status: 201 }
  );
}
);