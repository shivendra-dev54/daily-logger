import { ApiResponse } from "./Apiresponse";

export const asyncHandler =
  <Req extends Request>(
    controller: (req: Req) => Promise<Response>
  ) =>
    async (req: Req): Promise<Response> => {
      try {
        return await controller(req);
      } catch (err) {
        console.log(err);
        return Response.json(
          new ApiResponse(
            500,
            "Something went wrong",
            false,
            { error: err instanceof Error ? err.message : err as string }
          ).toString(),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    };
