import { SignJWT, jwtVerify } from "jose";
import { isDev } from "./env";

export const refreshTokenDurationInMs = 60 * 60 * 24 * 30 * 1000;

export const createAccessToken = (user: { id: string; email: string }) => {
  const iat = Math.floor(Date.now() / 1000);
  const exp = isDev() ? iat + 60 * 60 * 24 * 1 : iat + 60 * 15;

  return new SignJWT({ payload: { id: user.id, email: user.email } })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET));
};

export const validateAccessToken = async (jwt: string) => {
  const { payload } = await jwtVerify(
    jwt,
    new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET)
  );

  return payload.payload as any;
};

export const createRefreshToken = (user: { id: string; email: string }) => {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + refreshTokenDurationInMs / 1000;

  return new SignJWT({ payload: { id: user.id, email: user.email } })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET));
};

export const validateRefreshToken = async (jwt: string) => {
  const { payload } = await jwtVerify(
    jwt,
    new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET)
  );

  return payload.payload as any;
};
