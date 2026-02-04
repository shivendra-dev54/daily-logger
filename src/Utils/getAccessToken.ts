import { IUserSchema } from "@/app/api/auth/signup/route";
import * as jose from "jose";

export const getAccessToken = async (user: IUserSchema) => {
  const access_secret = new TextEncoder().encode(process.env.ACCESS_SECRET);
  const access_token = await new jose.SignJWT({
    id: user.id,
    username: user.username,
    email: user.email
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(access_secret);
  return access_token;
}

