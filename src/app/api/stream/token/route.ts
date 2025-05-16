import { NextResponse } from "next/server";
import { StreamClient } from "@stream-io/node-sdk";

const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const STREAM_API_SECRET = process.env.NEXT_PUBLIC_STREAM_API_SECRET!;

const streamClient = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId)
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const token = streamClient.generateUserToken({
    user_id: userId,
    validity_in_seconds: 3600,
  });

  return NextResponse.json({ token });
}
