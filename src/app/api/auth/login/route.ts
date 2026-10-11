import { NextResponse } from "next/server";
import { backendRequest, errorMessage } from "@/lib/backend";
import type { TokenResponse } from "@/lib/types";

export async function POST(request: Request) {
  let credentials: { email?: string; password?: string };
  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json({ detail: "Enter your email and password." }, { status: 400 });
  }

  if (!credentials.email || !credentials.password) {
    return NextResponse.json({ detail: "Enter your email and password." }, { status: 400 });
  }

  try {
    const upstream = await backendRequest("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!upstream.ok) {
      return NextResponse.json({ detail: await errorMessage(upstream) }, { status: upstream.status });
    }

    const tokens = (await upstream.json()) as TokenResponse;
    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.json({ detail: "The authentication response is missing tokens." }, { status: 502 });
    }

    const response = NextResponse.json({ success: true });
    const secure = process.env.NODE_ENV === "production";
    response.cookies.set("kwarihub_access", tokens.access_token, {
      httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 30 * 60,
    });
    response.cookies.set("kwarihub_refresh", tokens.refresh_token, {
      httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  } catch {
    return NextResponse.json({ detail: "Could not reach the KwariHub API. Check the API URL and server." }, { status: 502 });
  }
}
