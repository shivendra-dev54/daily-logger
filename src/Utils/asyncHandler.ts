import { NextRequest, NextResponse } from "next/server";

type AppRouteHandler<T> = (
  req: NextRequest,
  ctx: { params: Promise<T> }
) => Promise<Response>;

export const asyncHandler =
  <T>(fn: AppRouteHandler<T>) =>
  async (req: NextRequest, ctx: { params: Promise<T> }) => {
    try {
      return await fn(req, ctx);
    } catch (error) {
      console.error("API Error:", error);
      return NextResponse.json(
        {
          statusCode: 500,
          message: error instanceof Error ? error?.message : "Internal Server Error",
          status: false,
          data: null,
        },
        { status: 500 }
      );
    }
  };