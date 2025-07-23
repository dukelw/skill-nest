import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { access_token, refresh_token } = body;

  const response = NextResponse.json({ message: "Set cookie success" });

  response.cookies.set("token", access_token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  response.cookies.set("refresh_token", refresh_token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return response;
}
