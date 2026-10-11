import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/backend";

export async function POST() {
  const jar = await cookies();
  const refresh = jar.get("kwarihub_refresh")?.value;
  if (refresh) {
    try {
      await backendRequest("/auth/logout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      });
    } catch {
      // Clear the local session even if the backend is unavailable.
    }
  }
  const response = NextResponse.json({ success: true });
  response.cookies.delete("kwarihub_access");
  response.cookies.delete("kwarihub_refresh");
  return response;
}
