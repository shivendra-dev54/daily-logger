import { db } from "@/db";
import { ITasks, tasks } from "@/db/Schemas/Tasks.schema";
import { getAuthUser } from "@/lib/get-auth-user";
import { ApiResponse } from "@/Utils/Apiresponse";
import { asyncHandler } from "@/Utils/asyncHandler";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = asyncHandler(
  async (_: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const taskId = Number(id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        new ApiResponse(400, "Invalid task id", false, null).toString(),
        { status: 400 }
      );
    }

    const user = await getAuthUser(_);
    if (!user) {
      return NextResponse.json(
        new ApiResponse(401, "Unauthorized", false, null).toString(),
        { status: 401 }
      );
    }

    const [task] = await db
      .select()
      .from(tasks)
      .where(and(
        eq(tasks.id, taskId),
        eq(tasks.user_id, user.id)
      ))
      .limit(1);

    if (!task) {
      return NextResponse.json(
        new ApiResponse(404, "Task not found", false, null).toString(),
        { status: 404 }
      );
    }

    return NextResponse.json(
      new ApiResponse(200, "Task fetched", true, task).toString(),
      { status: 200 }
    );
  }
);


interface IUpdateTaskBody {
  title?: string;
  body?: string;
  due_date?: string;
  status?: "P" | "C" | "I";
}

export const PATCH = asyncHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const taskId = Number(id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        new ApiResponse(400, "Invalid task id", false, null).toString(),
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

    const updates: IUpdateTaskBody = await request.json();

    if (!Object.keys(updates).length) {
      return NextResponse.json(
        new ApiResponse(400, "No fields to update", false, null).toString(),
        { status: 400 }
      );
    }

    const [existingTask] = await db
      .select()
      .from(tasks)
      .where(and(
        eq(tasks.id, taskId),
        eq(tasks.user_id, user.id)
      ))
      .limit(1);

    if (!existingTask) {
      return NextResponse.json(
        new ApiResponse(404, "Task not found", false, null).toString(),
        { status: 404 }
      );
    }

    const updateData: Partial<ITasks> = {
      title: "",
      body: "",
      status: "",
      due_date: new Date()
    };

    if (updates.title !== undefined) {
      updateData.title = updates.title;
    }

    if (updates.body !== undefined) {
      updateData.body = updates.body;
    }

    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }

    if (updates.due_date !== undefined) {
      const dueDate = new Date(updates.due_date);

      // Validate the date
      if (isNaN(dueDate.getTime())) {
        return NextResponse.json(
          new ApiResponse(400, "Invalid date format.", false, null).toString(),
          { status: 400 }
        );
      }

      updateData.due_date = dueDate;
    }

    await db
      .update(tasks)
      .set(updateData)
      .where(and(
        eq(tasks.id, taskId),
        eq(tasks.user_id, user.id)
      ));

    return NextResponse.json(
      new ApiResponse(
        200,
        "Task updated successfully.",
        true,
        null
      ).toString(),
      { status: 200 }
    );
  }
);


export const DELETE = asyncHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const taskId = Number(id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        new ApiResponse(400, "Invalid task id", false, null).toString(),
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

    // First check if task exists
    const [existingTask] = await db
      .select()
      .from(tasks)
      .where(and(
        eq(tasks.id, taskId),
        eq(tasks.user_id, user.id)
      ))
      .limit(1);

    if (!existingTask) {
      return NextResponse.json(
        new ApiResponse(404, "Task not found", false, null).toString(),
        { status: 404 }
      );
    }

    await db
      .delete(tasks)
      .where(and(
        eq(tasks.id, taskId),
        eq(tasks.user_id, user.id)
      ));

    return NextResponse.json(
      new ApiResponse(
        200,
        "Task deleted successfully.",
        true,
        null
      ).toString(),
      { status: 200 }
    );
  }
);