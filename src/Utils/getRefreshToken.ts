import { IUserSchema } from "@/db/Schemas/Users.schema";
import * as jose from "jose";

export const getRefreshToken = async (user: IUserSchema) => {
  const refresh_secret = new TextEncoder().encode(process.env.REFRESH_SECRET);
  const refresh_token = await new jose.SignJWT({
    id: user.id,
    username: user.username,
    email: user.email
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(refresh_secret);
  return refresh_token;
}

