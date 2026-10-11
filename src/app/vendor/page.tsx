"use client";

import { useEffect, useState } from "react";
import { Login } from "@/components/auth";
import { Portal } from "@/components/portal";
import { api, User } from "@/lib/api";
import { PageState } from "@/components/ui";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  async function loadUser() {
    try {
      const currentUser = await api<User>("/auth/me");
      setUser(currentUser);
    } catch {
      localStorage.removeItem("kwarihub_access_token");
      localStorage.removeItem("kwarihub_refresh_token");
      setUser(null);
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("kwarihub_access_token");

    if (!token) {
      setChecking(false);
      return;
    }

    void loadUser();
  }, []);

  function handleLogin() {
    setChecking(true);
    void loadUser();
  }

  async function handleLogout() {
    const refreshToken = localStorage.getItem("kwarihub_refresh_token");

    try {
      if (refreshToken) {
        await api("/auth/logout", {
          method: "POST",
          body: JSON.stringify({
            refresh_token: refreshToken,
          }),
        });
      }
    } catch {
      // Even if the server logout fails, clear the local session.
    } finally {
      localStorage.removeItem("kwarihub_access_token");
      localStorage.removeItem("kwarihub_refresh_token");
      setUser(null);
    }
  }

  if (checking) {
    return <PageState type="loading">Checking your seller session…</PageState>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <Portal user={user} onLogout={handleLogout} />;
}