
"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";

type AuthMode = "login" | "register";

type AuthResponse = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
};

export function Login({
  onLogin,
}: {
  onLogin: () => void;
}) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (busy) return;

    if (mode === "register") {
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      if (!firstName.trim() || !lastName.trim() || !username.trim()) {
        setError("Please complete your name and username.");
        return;
      }
    }

    setBusy(true);

    try {
      if (mode === "register") {
        await api("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            username: username.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            password,
          }),
        });

        setMessage(
          "Account created. Sign in to continue to your vendor application.",
        );
        setMode("login");
        setPassword("");
        setConfirmPassword("");
        return;
      }

      const result = await api<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (!result.access_token) {
        throw new Error("The server did not return an access token.");
      }

      localStorage.setItem(
        "kwarihub_access_token",
        result.access_token,
      );

      if (result.refresh_token) {
        localStorage.setItem(
          "kwarihub_refresh_token",
          result.refresh_token,
        );
      }

      onLogin();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Authentication failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand">
          <span className="brand-mark">K</span>
          <span>KWARIHUB</span>
        </div>

        <div className="auth-brand-copy">
          <p className="auth-eyebrow">SELLER PORTAL</p>
          <h1>
            Run your textile business with clarity.
          </h1>
          <p>
            Manage catalogues, orders and payouts from one
            focused workspace.
          </p>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-content">
          <p className="auth-eyebrow">
            SELLER PORTAL
          </p>

          <h2>
            {mode === "login"
              ? "Welcome back"
              : "Create your account"}
          </h2>

          <p className="auth-description">
            {mode === "login"
              ? "Sign in with your KwariHub account."
              : "Create an account, then submit your vendor application."}
          </p>

          <div className="auth-mode-switch">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
            >
              Sign in
            </button>

            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => {
                setMode("register");
                setError("");
                setMessage("");
              }}
            >
              Create account
            </button>
          </div>

          <form onSubmit={submit} className="auth-form">
            {mode === "register" && (
              <>
                <div className="auth-two-columns">
                  <label>
                    First name
                    <input
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(event) =>
                        setFirstName(event.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    Last name
                    <input
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(event) =>
                        setLastName(event.target.value)
                      }
                      required
                    />
                  </label>
                </div>

                <label>
                  Username
                  <input
                    autoComplete="username"
                    value={username}
                    onChange={(event) =>
                      setUsername(event.target.value)
                    }
                    required
                  />
                </label>

                <label>
                  Phone number
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    required
                  />
                </label>
              </>
            )}

            <label>
              Email
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                autoComplete={
                  mode === "login"
                    ? "current-password"
                    : "new-password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                minLength={mode === "register" ? 8 : undefined}
                required
              />
            </label>

            {mode === "register" && (
              <label>
                Confirm password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  minLength={8}
                  required
                />
              </label>
            )}

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            {message && (
              <p className="form-success" role="status">
                {message}
              </p>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={busy}
            >
              {busy
                ? "Please wait…"
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          <p className="auth-footnote">
            {mode === "login"
              ? "New to KwariHub? Choose Create account to register."
              : "After registration, sign in and complete your vendor application. Seller access requires approval."}
          </p>
        </div>
      </section>
    </main>
  );
}
