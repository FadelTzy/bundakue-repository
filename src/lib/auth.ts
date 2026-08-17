import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const COOKIE_NAME = "bundakue_kb_session";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 hari

export type Session =
  | { role: "ADMIN"; username: string }
  | { role: "USER"; divisionId: string; divisionName: string };

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET belum diatur atau terlalu pendek. Atur di environment variable (.env / Vercel)."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(session: Session) {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_DURATION)
    .sign(getSecretKey());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export async function destroySession() {
  cookies().delete(COOKIE_NAME);
}

export async function verifySession(token?: string): Promise<Session | null> {
  try {
    const jwt = token ?? cookies().get(COOKIE_NAME)?.value;
    if (!jwt) return null;
    const { payload } = await jwtVerify(jwt, getSecretKey());
    if (payload.role === "ADMIN" && typeof payload.username === "string") {
      return { role: "ADMIN", username: payload.username };
    }
    if (
      payload.role === "USER" &&
      typeof payload.divisionId === "string" &&
      typeof payload.divisionName === "string"
    ) {
      return { role: "USER", divisionId: payload.divisionId, divisionName: payload.divisionName };
    }
    return null;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;

export function checkCredentials(username: string, password: string) {
  const validUser = process.env.ADMIN_USERNAME;
  const validPass = process.env.ADMIN_PASSWORD;
  if (!validUser || !validPass) {
    throw new Error(
      "ADMIN_USERNAME / ADMIN_PASSWORD belum diatur di environment variable."
    );
  }
  return username === validUser && password === validPass;
}

const PIN_PATTERN = /^\d{6}$/;

export function isValidPin(pin: string) {
  return PIN_PATTERN.test(pin);
}

export function hashPin(pin: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPin(pin: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(pin, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}
