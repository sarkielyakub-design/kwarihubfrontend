import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { backendRequest, errorMessage } from "@/lib/backend";
import type { TokenResponse } from "@/lib/types";

type Context = { params: Promise<{ path: string[] }> };
const sensitiveKey = /(password|token|secret|webhook_payload|account_number)/i;

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).filter(([key]) => !sensitiveKey.test(key)).map(([key, item]) => [key, redact(item)]));
  }
  return value;
}

async function proxy(request: NextRequest, context: Context, method: "GET" | "PATCH" | "DELETE") {
  const { path } = await context.params;
  const jar = await cookies();
  let access = jar.get("kwarihub_access")?.value;
  const refresh = jar.get("kwarihub_refresh")?.value;
  if (!access && !refresh) return NextResponse.json({ detail: "Not signed in." }, { status: 401 });

  const target = `/admin/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const body = method === "GET" ? undefined : await request.text();
  const send = (token: string) => backendRequest(target, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": request.headers.get("content-type") ?? "application/json" } : {}),
    },
    body: body || undefined,
  });

  try {
    let upstream = access ? await send(access) : new Response(null, { status: 401 });
    let refreshed: TokenResponse | undefined;
    if (upstream.status === 401 && refresh) {
      const refreshResponse = await backendRequest("/auth/refresh", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      if (refreshResponse.ok) {
        refreshed = (await refreshResponse.json()) as TokenResponse;
        access = refreshed.access_token;
        upstream = await send(access);
      }
    }
    if (!upstream.ok) return NextResponse.json({ detail: await errorMessage(upstream) }, { status: upstream.status });
    const response = NextResponse.json(redact(await upstream.json()));
    if (refreshed) response.cookies.set("kwarihub_access", refreshed.access_token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 30 * 60,
    });
    return response;
  } catch {
    return NextResponse.json({ detail: "Could not reach the KwariHub API." }, { status: 502 });
  }
}

export const GET = (request: NextRequest, context: Context) => proxy(request, context, "GET");
export const PATCH = (request: NextRequest, context: Context) => proxy(request, context, "PATCH");
export const DELETE = (request: NextRequest, context: Context) => proxy(request, context, "DELETE");
