import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendRequest, errorMessage } from "@/lib/backend";
import type { CurrentUser, TokenResponse } from "@/lib/types";

export async function GET() {
  const jar = await cookies();
  let access = jar.get("kwarihub_access")?.value;
  const refresh = jar.get("kwarihub_refresh")?.value;
  if (!access && !refresh) return NextResponse.json({ detail: "Not signed in." }, { status: 401 });

  try {
    let upstream = access
      ? await backendRequest("/auth/me", { headers: { Authorization: `Bearer ${access}` } })
      : new Response(null, { status: 401 });
    let refreshed: TokenResponse | undefined;
    if (upstream.status === 401 && refresh) {
      const refreshResponse = await backendRequest("/auth/refresh", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      if (refreshResponse.ok) {
        refreshed = (await refreshResponse.json()) as TokenResponse;
        access = refreshed.access_token;
        upstream = await backendRequest("/auth/me", { headers: { Authorization: `Bearer ${access}` } });
      }
    }

    if (!upstream.ok) return NextResponse.json({ detail: await errorMessage(upstream) }, { status: upstream.status });
    const response = NextResponse.json((await upstream.json()) as CurrentUser);
    if (refreshed) response.cookies.set("kwarihub_access", refreshed.access_token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 30 * 60,
    });
    return response;
  } catch {
    return NextResponse.json({ detail: "Could not reach the KwariHub API." }, { status: 502 });
  }
}
