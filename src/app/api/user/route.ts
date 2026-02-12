import { db } from "@/db";
import { users } from "@/db/Schemas/Users.schema";
import { getAuthUser } from "@/lib/get-auth-user";
import { ApiResponse } from "@/Utils/Apiresponse";
import { asyncHandler } from "@/Utils/asyncHandler";
import { and, eq, ne, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = asyncHandler(async (request: NextRequest) => {

  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json(
      new ApiResponse(401, "Unauthorized.", false, null).toString(),
      { status: 401 }
    );
  }

  return NextResponse.json(
    new ApiResponse(
      200,
      "user fetched successfully.",
      true,
      user
    ).toString(),
    { status: 200 }
  );
});



// PATCH: Update User Profile
export const PATCH = asyncHandler(async (request: NextRequest) => {
  const user = await getAuthUser(request);

  if (!user) {
    return NextResponse.json(
      new ApiResponse(401, "Unauthorized", false, null).toString(),
      { status: 401 }
    );
  }

  const body = (await request.json()) as {
    full_name?: string;
    username?: string;
    email?: string;
  };

  const { full_name, username, email } = body;

  // 1. Validation: Ensure at least one field is provided
  if (!full_name && !username && !email) {
    return NextResponse.json(
      new ApiResponse(400, "At least one field is required to update.", false, null).toString(),
      { status: 400 }
    );
  }

  // 2. Validation: Empty strings check
  if ((full_name !== undefined && !full_name.trim()) ||
    (username !== undefined && !username.trim()) ||
    (email !== undefined && !email.trim())) {
    return NextResponse.json(
      new ApiResponse(400, "Fields cannot be empty.", false, null).toString(),
      { status: 400 }
    );
  }

  // 3. Conflict Check: Username or Email uniqueness
  // We check if any OTHER user (not the current one) has this username or email
  const conditions = [];
  if (username) conditions.push(eq(users.username, username));
  if (email) conditions.push(eq(users.email, email));

  if (conditions.length > 0) {
    const existingUsers = await db
      .select()
      .from(users)
      .where(and(
        ne(users.id, user.id), // Exclude current user
        or(...conditions)
      ));

    if (existingUsers.length > 0) {
      const conflict = existingUsers[0];
      const msg = conflict.username === username
        ? "Username is already taken."
        : "Email is already in use.";

      return NextResponse.json(
        new ApiResponse(409, msg, false, null).toString(),
        { status: 409 }
      );
    }
  }

  // 4. Update Operation
  const updateData = {
    full_name: full_name || user.full_name,
    email: email || user.email,
    username: username || user.username,
  };
  if (full_name) updateData.full_name = full_name.trim();
  if (username) updateData.username = username.trim();
  if (email) updateData.email = email.trim();

  await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, user.id));

  // 5. Fetch updated user to return
  const [updatedUser] = await db
    .select({
      id: users.id,
      username: users.username,
      full_name: users.full_name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, user.id));

  return NextResponse.json(
    new ApiResponse(200, "Profile updated successfully.", true, updatedUser).toString(),
    { status: 200 }
  );
});