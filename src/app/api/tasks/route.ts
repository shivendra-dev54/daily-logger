import { db } from "@/db";
import { ITasks, tasks } from "@/db/Schemas/Tasks.schema";
import { getAuthUser } from "@/lib/get-auth-user";
import { ApiResponse } from "@/Utils/Apiresponse";
import { asyncHandler } from "@/Utils/asyncHandler";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

interface ICreateTaskBody {
  title: string;
  body: string;
  due_date: string; // Change this to string since it comes from JSON
}

export const POST = asyncHandler(async (request: NextRequest) => {
  const {
    title,
    body,
    due_date
  }: ICreateTaskBody = await request.json();

  if (!title?.trim() || !body?.trim() || !due_date) {
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

  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json(
      new ApiResponse(
        401,
        "Unauthorized.",
        false,
        null
      ).toString(),
      { status: 401 }
    );
  }

  // Convert string to Date object
  const dueDate = new Date(due_date);
  
  // Validate the date
  if (isNaN(dueDate.getTime())) {
    return NextResponse.json(
      new ApiResponse(
        400,
        "Invalid date format.",
        false,
        null
      ).toString(),
      { status: 400 }
    );
  }

  const task: ITasks = {
    title,
    body,
    user_id: user.id,
    status: "P",
    due_date: dueDate
  }

  await db
    .insert(tasks)
    .values(task);

  return NextResponse.json(
    new ApiResponse(
      201,
      "Task created successfully.",
      true,
      task
    ).toString(),
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

  const userTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.user_id, user.id));

  return NextResponse.json(
    new ApiResponse(
      200,
      "Tasks fetched successfully.",
      true,
      userTasks
    ).toString(),
    { status: 200 }
  );
});