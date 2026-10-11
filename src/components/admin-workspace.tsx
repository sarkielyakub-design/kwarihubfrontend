"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminDashboard, CurrentUser } from "@/lib/types";

type Row = Record<string, unknown> & { uuid?: string };

type Section =
  | "dashboard"
  | "users"
  | "sellers"
  | "products"
  | "orders"
  | "payments"
  | "withdrawals"
  | "reviews";

type ModuleConfig = {
  title: string;
  description: string;
  columns: [string, string][];
  actions?: {
    label: string;
    suffix: string;
    tone?: "danger";
  }[];
};

const nav: { id: Section; label: string; icon: string }[] = [
  { id: "dashboard", label: "Overview", icon: "◫" },
  { id: "users", label: "Users", icon: "◎" },
  { id: "sellers", label: "Sellers", icon: "◇" },
  { id: "products", label: "Products", icon: "▧" },
  { id: "orders", label: "Orders", icon: "↗" },
  { id: "payments", label: "Payments", icon: "₦" },
  { id: "withdrawals", label: "Withdrawals", icon: "⇥" },
  { id: "reviews", label: "Reviews", icon: "☆" },
];

const modules: Record<
  Exclude<Section, "dashboard">,
  ModuleConfig
> = {
  users: {
    title: "Users",
    description: "Marketplace accounts returned by KwariHub.",
    columns: [
      ["first_name", "First name"],
      ["last_name", "Last name"],
      ["email", "Email"],
      ["phone", "Phone"],
      ["is_active", "Account"],
      ["is_verified", "Verified"],
    ],
    actions: [
      { label: "Activate", suffix: "activate" },
      { label: "Deactivate", suffix: "deactivate" },
      { label: "Delete", suffix: "delete", tone: "danger" },
    ],
  },

  sellers: {
    title: "Sellers",
    description: "Seller accounts and their verification status.",
    columns: [
      ["first_name", "First name"],
      ["last_name", "Last name"],
      ["email", "Email"],
      ["phone", "Phone"],
      ["is_verified", "Verified"],
      ["is_active", "Account"],
    ],
    actions: [
      { label: "Verify seller", suffix: "verify" },
      { label: "Suspend seller", suffix: "suspend" },
      { label: "Activate seller", suffix: "activate" },
    ],
  },

  products: {
    title: "Products",
    description: "Product catalogue and review decisions.",
    columns: [
      ["name", "Product"],
      ["sku", "SKU"],
      ["price", "Price"],
      ["quantity", "Quantity"],
      ["status", "Status"],
      ["is_active", "Approved"],
    ],
    actions: [
      { label: "Approve", suffix: "approve" },
      { label: "Reject", suffix: "reject" },
      { label: "Delete", suffix: "delete", tone: "danger" },
    ],
  },

  orders: {
    title: "Orders",
    description: "Marketplace orders and their current status.",
    columns: [
      ["order_number", "Order"],
      ["buyer_id", "Buyer ID"],
      ["subtotal", "Subtotal"],
      ["shipping_fee", "Shipping"],
      ["total", "Total"],
      ["status", "Status"],
    ],
    actions: [
      {
        label: "Cancel order",
        suffix: "cancel",
        tone: "danger",
      },
    ],
  },

  payments: {
    title: "Payments",
    description: "Payment records from the marketplace.",
    columns: [
      ["reference", "Reference"],
      ["provider", "Provider"],
      ["amount", "Amount"],
      ["currency", "Currency"],
      ["status", "Status"],
      ["paid_at", "Paid at"],
    ],
  },

  withdrawals: {
    title: "Withdrawals",
    description: "Withdrawal requests and processing status.",
    columns: [
      ["reference", "Reference"],
      ["user_id", "Seller ID"],
      ["amount", "Amount"],
      ["narration", "Narration"],
      ["status", "Status"],
      ["created_at", "Requested"],
    ],
    actions: [
      { label: "Approve", suffix: "approve" },
      { label: "Mark paid", suffix: "paid" },
      {
        label: "Reject",
        suffix: "reject",
        tone: "danger",
      },
    ],
  },

  reviews: {
    title: "Reviews",
    description: "Customer reviews and visibility controls.",
    columns: [
      ["rating", "Rating"],
      ["title", "Title"],
      ["comment", "Comment"],
      ["is_verified_purchase", "Verified purchase"],
      ["is_active", "Visible"],
    ],
    actions: [
      { label: "Hide", suffix: "hide" },
      { label: "Show", suffix: "show" },
      {
        label: "Delete",
        suffix: "delete",
        tone: "danger",
      },
    ],
  },
};

const stats: {
  key: keyof AdminDashboard;
  label: string;
  icon: string;
  color: string;
}[] = [
  {
    key: "total_users",
    label: "Total users",
    icon: "◎",
    color: "sage",
  },
  {
    key: "total_sellers",
    label: "Total sellers",
    icon: "◇",
    color: "lavender",
  },
  {
    key: "total_products",
    label: "Total products",
    icon: "▧",
    color: "peach",
  },
  {
    key: "total_categories",
    label: "Categories",
    icon: "▦",
    color: "blue",
  },
  {
    key: "total_orders",
    label: "Total orders",
    icon: "↗",
    color: "lavender",
  },
  {
    key: "total_payments",
    label: "Total payments",
    icon: "₦",
    color: "sage",
  },
  {
    key: "total_withdrawals",
    label: "Withdrawals",
    icon: "⇥",
    color: "blue",
  },
  {
    key: "total_reviews",
    label: "Reviews",
    icon: "☆",
    color: "peach",
  },
];

function number(value: unknown) {
  return new Intl.NumberFormat("en-NG").format(
    Number(value ?? 0),
  );
}

function pretty(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function display(value: unknown, key = "") {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  if (typeof value === "boolean") {
    if (key === "is_active") {
      return value ? "Active" : "Inactive";
    }

    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    return Array.isArray(value)
      ? `${value.length} items`
      : "Details available";
  }

  if (key.endsWith("_at") && typeof value === "string") {
    const date = new Date(value);

    if (!Number.isNaN(date.valueOf())) {
      return new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    }
  }

  if (
    [
      "price",
      "total",
      "subtotal",
      "shipping_fee",
      "amount",
    ].includes(key)
  ) {
    return `₦${number(value)}`;
  }

  return String(value);
}

export function AdminWorkspace({
  section: sectionProp,
}: {
  section: string;
}) {
  const section = nav.some(
    (item) => item.id === sectionProp,
  )
    ? (sectionProp as Section)
    : "dashboard";

  const [user, setUser] =
    useState<CurrentUser | null>(null);

  const [dashboard, setDashboard] =
    useState<AdminDashboard | null>(null);

  const [analytics, setAnalytics] =
    useState<Record<string, unknown> | null>(null);

  const [rows, setRows] = useState<Row[]>([]);

  const [detail, setDetail] =
    useState<Row | null>(null);

  const [query, setQuery] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);

  const [actionBusy, setActionBusy] =
    useState("");

  const [signingOut, setSigningOut] =
    useState(false);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const router = useRouter();

  const config =
    section !== "dashboard"
      ? modules[section]
      : null;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const meResponse = await fetch(
        "/api/auth/me",
        {
          cache: "no-store",
        },
      );

      if (meResponse.status === 401) {
        router.replace("/admin/login");
        return;
      }

      if (!meResponse.ok) {
        const body = await meResponse.json();

        throw new Error(
          body.detail ??
            "Could not verify your session.",
        );
      }

      setUser(await meResponse.json());

      if (section === "dashboard") {
        const [
          summaryResponse,
          analyticsResponse,
        ] = await Promise.all([
          fetch("/api/admin/dashboard", {
            cache: "no-store",
          }),
          fetch("/api/admin/analytics", {
            cache: "no-store",
          }),
        ]);

        if (
          summaryResponse.status === 401 ||
          analyticsResponse.status === 401
        ) {
          router.replace("/admin/login");
          return;
        }

        if (!summaryResponse.ok) {
          const body =
            await summaryResponse.json();

          throw new Error(
            body.detail ??
              "Could not load dashboard.",
          );
        }

        setDashboard(
          await summaryResponse.json(),
        );

        if (analyticsResponse.ok) {
          setAnalytics(
            await analyticsResponse.json(),
          );
        }
      } else {
        const response = await fetch(
          `/api/admin/${section}`,
          {
            cache: "no-store",
          },
        );

        if (response.status === 401) {
          router.replace("/admin/login");
          return;
        }

        if (!response.ok) {
          const body =
            await response.json();

          throw new Error(
            body.detail ??
              `Could not load ${section}.`,
          );
        }

        const body: unknown =
          await response.json();

        if (!Array.isArray(body)) {
          throw new Error(
            "The backend returned an unexpected list format.",
          );
        }

        setRows(body as Row[]);
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not load this page.",
      );
    } finally {
      setLoading(false);
    }
  }, [router, section]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setMenuOpen(false);
    setQuery("");
    setDetail(null);
  }, [section]);

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const filteredRows = rows.filter(
    (row) =>
      !query ||
      Object.entries(row).some(
        ([key, value]) =>
          !/(password|token|secret|webhook_payload|account_number)/i.test(
            key,
          ) &&
          String(value ?? "")
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
  );

  async function openDetails(row: Row) {
    if (!row.uuid) {
      setDetail(row);
      return;
    }

    setActionBusy(`detail:${row.uuid}`);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/${section}/${encodeURIComponent(
          row.uuid,
        )}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        const body = await response.json();

        throw new Error(
          body.detail ??
            "Could not load record details.",
        );
      }

      setDetail(await response.json());
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not load record details.",
      );
    } finally {
      setActionBusy("");
    }
  }

  async function runAction(
    row: Row,
    suffix: string,
  ) {
    if (!row.uuid) return;

    let reason = "";

    if (
      suffix === "reject" &&
      section === "withdrawals"
    ) {
      const answer = window.prompt(
        "Reason for rejecting this withdrawal:",
      );

      if (answer === null) return;

      reason = answer.trim();

      if (!reason) {
        setError(
          "Enter a rejection reason.",
        );
        return;
      }
    } else if (
      [
        "delete",
        "cancel",
        "suspend",
        "reject",
        "deactivate",
      ].includes(suffix)
    ) {
      const label =
        modules[
          section as Exclude<
            Section,
            "dashboard"
          >
        ].actions?.find(
          (action) =>
            action.suffix === suffix,
        )?.label ?? suffix;

      if (
        !window.confirm(
          `${label} this record?`,
        )
      ) {
        return;
      }
    }

    setActionBusy(
      `${row.uuid}:${suffix}`,
    );

    setError("");

    try {
      const method =
        suffix === "delete"
          ? "DELETE"
          : "PATCH";

      const actionPath =
        suffix === "delete"
          ? ""
          : `/${suffix}`;

      const url =
        `/api/admin/${section}/${encodeURIComponent(
          row.uuid,
        )}${actionPath}${
          reason
            ? `?reason=${encodeURIComponent(
                reason,
              )}`
            : ""
        }`;

      const response = await fetch(url, {
        method,
      });

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        const body =
          await response.json();

        throw new Error(
          body.detail ??
            `Could not ${suffix} this record.`,
        );
      }

      await load();

      if (detail?.uuid === row.uuid) {
        setDetail(null);
      }
    } catch (reasonValue) {
      setError(
        reasonValue instanceof Error
          ? reasonValue.message
          : "The requested action failed.",
      );
    } finally {
      setActionBusy("");
    }
  }

  async function logout() {
    setSigningOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${
        user.last_name?.[0] ?? ""
      }`.toUpperCase()
    : "KH";

  const closeMobileMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div className="admin-shell">
      {/* MOBILE OVERLAY */}
      <button
        type="button"
        className={`sidebar-overlay ${
          menuOpen ? "visible" : ""
        }`}
        onClick={closeMobileMenu}
        aria-label="Close navigation"
        aria-hidden={!menuOpen}
      />

      {/* SIDEBAR */}
      <aside
        className={`sidebar ${
          menuOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-header">
          <a
            className="brand-lockup sidebar-brand"
            href="/admin/dashboard"
            onClick={closeMobileMenu}
          >
            <span className="brand-mark">
              K
            </span>

            <span className="brand-name">
              Kwari
              <span className="brand-light">
                Hub
              </span>
            </span>
          </a>

          <button
            type="button"
            className="mobile-sidebar-close"
            onClick={closeMobileMenu}
            aria-label="Close navigation"
          >
            ×
          </button>
        </div>

        <div className="sidebar-scroll">
          <p className="nav-caption">
            MARKETPLACE
          </p>

          <nav className="admin-nav">
            {nav.map((item) => (
              <a
                key={item.id}
                className={`nav-item ${
                  section === item.id
                    ? "active"
                    : ""
                }`}
                href={
                  item.id === "dashboard"
                    ? "/admin/dashboard"
                    : `/admin/${item.id}`
                }
                onClick={closeMobileMenu}
              >
                <span className="nav-icon">
                  {item.icon}
                </span>

                <span className="nav-label">
                  {item.label}
                </span>

                {item.id === "dashboard" && (
                  <span className="nav-count">
                    01
                  </span>
                )}
              </a>
            ))}
          </nav>
        </div>

        <div className="sidebar-lower">
          <div className="sidebar-note">
            <span className="status-dot" />
            <span>
              Connected workspace
            </span>
          </div>

          <div className="profile-row">
            <div className="avatar">
              {initials}
            </div>

            <div className="profile-copy">
              <strong>
                {user
                  ? `${user.first_name} ${user.last_name}`
                  : "KwariHub account"}
              </strong>

              <span>
                {user?.email ?? "Signed in"}
              </span>
            </div>

            <button
              className="signout-icon"
              title="Sign out"
              type="button"
              onClick={logout}
              disabled={signingOut}
            >
              ↗
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="main-area">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-menu-button"
              onClick={() =>
                setMenuOpen(true)
              }
              aria-label="Open navigation"
            >
              <span />
              <span />
              <span />
            </button>

            <div className="breadcrumb">
              <span>Marketplace</span>
              <b>/</b>
              <strong>
                {section === "dashboard"
                  ? "Overview"
                  : config?.title}
              </strong>
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-user">
              <div className="topbar-avatar">
                {initials}
              </div>

              <div className="topbar-user-copy">
                <strong>
                  {user
                    ? `${user.first_name} ${user.last_name}`
                    : "KwariHub"}
                </strong>
                <span>Administrator</span>
              </div>
            </div>

            <button
              className="signout-button"
              type="button"
              onClick={logout}
              disabled={signingOut}
            >
              {signingOut
                ? "Signing out…"
                : "Sign out"}
              <span>↗</span>
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <section className="dashboard-content">
          {section === "dashboard" ? (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">
                    KWARIHUB OVERVIEW
                  </p>

                  <h1>
                    Good day
                    {user
                      ? `, ${user.first_name}`
                      : ""}
                    <span className="wave">
                      ✳
                    </span>
                  </h1>

                  <p className="muted">
                    A live snapshot of your
                    textile marketplace.
                  </p>
                </div>

                <button
                  className="refresh-button"
                  type="button"
                  onClick={() =>
                    void load()
                  }
                  disabled={loading}
                >
                  <span
                    className={
                      loading ? "spin" : ""
                    }
                  >
                    ↻
                  </span>

                  Refresh
                </button>
              </div>

              {error && (
                <ErrorBanner
                  error={error}
                  retry={() => void load()}
                />
              )}

              <div className="section-title">
                <h2>
                  Marketplace summary
                </h2>

                <span>
                  Live data from KwariHub
                </span>
              </div>

              <div className="metric-grid">
                {stats.map((stat) => (
                  <article
                    className="metric-card"
                    key={stat.key}
                  >
                    <div className="metric-top">
                      <span>
                        {stat.label}
                      </span>

                      <span
                        className={`metric-icon ${stat.color}`}
                      >
                        {stat.icon}
                      </span>
                    </div>

                    <strong>
                      {loading ? (
                        <i className="skeleton" />
                      ) : dashboard ? (
                        number(
                          dashboard[
                            stat.key
                          ],
                        )
                      ) : (
                        "—"
                      )}
                    </strong>

                    <small>
                      All time
                    </small>
                  </article>
                ))}
              </div>

              <div className="lower-grid">
                <article className="revenue-card">
                  <div className="card-title">
                    <div>
                      <p className="eyebrow">
                        PAYMENTS
                      </p>

                      <h2>
                        Total revenue
                      </h2>
                    </div>

                    <span className="metric-icon sage">
                      ₦
                    </span>
                  </div>

                  <div className="revenue-value">
                    {loading ? (
                      <i className="skeleton revenue-skeleton" />
                    ) : dashboard ? (
                      `₦${number(
                        dashboard.total_revenue,
                      )}`
                    ) : (
                      "—"
                    )}
                  </div>

                  <p className="muted">
                    Successful payments
                    recorded by KwariHub
                  </p>

                  <div className="revenue-rule">
                    <span />
                  </div>

                  <p className="revenue-foot">
                    <span className="status-dot" />
                    Marketplace total
                  </p>
                </article>

                <article className="attention-card">
                  <div className="card-title">
                    <div>
                      <p className="eyebrow">
                        NEEDS ATTENTION
                      </p>

                      <h2>
                        Pending activity
                      </h2>
                    </div>

                    <span className="attention-arrow">
                      ↗
                    </span>
                  </div>

                  <a
                    className="attention-row"
                    href="/admin/products"
                  >
                    <div className="attention-symbol peach">
                      ▧
                    </div>

                    <div className="attention-label">
                      <strong>
                        Products
                      </strong>

                      <span>
                        Awaiting review
                      </span>
                    </div>

                    <b>
                      {loading
                        ? "—"
                        : dashboard
                          ? number(
                              dashboard.pending_products,
                            )
                          : "—"}
                    </b>
                  </a>

                  <a
                    className="attention-row"
                    href="/admin/withdrawals"
                  >
                    <div className="attention-symbol lavender">
                      ⇥
                    </div>

                    <div className="attention-label">
                      <strong>
                        Withdrawals
                      </strong>

                      <span>
                        Awaiting action
                      </span>
                    </div>

                    <b>
                      {loading
                        ? "—"
                        : dashboard
                          ? number(
                              dashboard.pending_withdrawals,
                            )
                          : "—"}
                    </b>
                  </a>

                  <div className="analytics-strip">
                    <div>
                      <span>
                        Pending orders
                      </span>

                      <strong>
                        {analytics
                          ? number(
                              analytics.total_pending_orders,
                            )
                          : "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Completed orders
                      </span>

                      <strong>
                        {analytics
                          ? number(
                              analytics.total_completed_orders,
                            )
                          : "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Revenue
                      </span>

                      <strong>
                        {analytics
                          ? `₦${number(
                              analytics.total_revenue,
                            )}`
                          : "—"}
                      </strong>
                    </div>
                  </div>
                </article>
              </div>

              <footer className="dashboard-footer">
                <span>
                  KwariHub Admin
                </span>

                <span>
                  Figures reflect the latest
                  API response
                </span>
              </footer>
            </>
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">
                    MARKETPLACE MANAGEMENT
                  </p>

                  <h1>
                    {config?.title}
                  </h1>

                  <p className="muted">
                    {config?.description}
                  </p>
                </div>

                <button
                  className="refresh-button"
                  type="button"
                  onClick={() =>
                    void load()
                  }
                  disabled={loading}
                >
                  <span
                    className={
                      loading ? "spin" : ""
                    }
                  >
                    ↻
                  </span>

                  Refresh
                </button>
              </div>

              {error && (
                <ErrorBanner
                  error={error}
                  retry={() => void load()}
                />
              )}

              <div className="table-toolbar">
                <div className="section-title">
                  <h2>
                    All{" "}
                    {config?.title.toLowerCase()}
                  </h2>

                  <span>
                    {loading
                      ? "Loading…"
                      : `${filteredRows.length} records`}
                  </span>
                </div>

                <label className="search-box">
                  <span>⌕</span>

                  <input
                    value={query}
                    onChange={(event) =>
                      setQuery(
                        event.target.value,
                      )
                    }
                    placeholder={`Search ${config?.title.toLowerCase()}…`}
                    aria-label={`Search ${config?.title}`}
                  />
                </label>
              </div>

              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      {config?.columns.map(
                        ([key, label]) => (
                          <th key={key}>
                            {label}
                          </th>
                        ),
                      )}

                      <th className="actions-heading">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={
                            (config?.columns
                              .length ?? 0) + 1
                          }
                          className="table-state"
                        >
                          <i className="skeleton" />
                          Loading records…
                        </td>
                      </tr>
                    ) : filteredRows.length ===
                      0 ? (
                      <tr>
                        <td
                          colSpan={
                            (config?.columns
                              .length ?? 0) + 1
                          }
                          className="table-state"
                        >
                          {error
                            ? "Records could not be loaded."
                            : query
                              ? "No matching records."
                              : "No records returned by the backend."}
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map(
                        (row, index) => (
                          <tr
                            key={
                              row.uuid ??
                              index
                            }
                          >
                            {config?.columns.map(
                              ([key]) => (
                                <td key={key}>
                                  {key ===
                                    "is_active" ||
                                  key ===
                                    "is_verified" ? (
                                    <span
                                      className={`state-pill ${
                                        row[key]
                                          ? "state-on"
                                          : "state-off"
                                      }`}
                                    >
                                      {display(
                                        row[key],
                                        key,
                                      )}
                                    </span>
                                  ) : (
                                    <span
                                      className={
                                        key ===
                                          "comment" ||
                                        key ===
                                          "narration"
                                          ? "cell-truncate"
                                          : ""
                                      }
                                      title={String(
                                        row[key] ??
                                          "",
                                      )}
                                    >
                                      {display(
                                        row[key],
                                        key,
                                      )}
                                    </span>
                                  )}
                                </td>
                              ),
                            )}

                            <td>
                              <div className="row-actions">
                                <button
                                  className="view-action"
                                  type="button"
                                  onClick={() =>
                                    void openDetails(
                                      row,
                                    )
                                  }
                                  disabled={
                                    actionBusy ===
                                    `detail:${row.uuid}`
                                  }
                                >
                                  {actionBusy ===
                                  `detail:${row.uuid}`
                                    ? "…"
                                    : "View"}
                                </button>

                                {config?.actions
                                  ?.filter(
                                    (action) =>
                                      actionVisible(
                                        section,
                                        action.suffix,
                                        row,
                                      ),
                                  )
                                  .map(
                                    (action) => (
                                      <button
                                        key={
                                          action.suffix
                                        }
                                        type="button"
                                        className={`row-action ${
                                          action.tone ===
                                          "danger"
                                            ? "danger"
                                            : ""
                                        }`}
                                        disabled={
                                          actionBusy ===
                                          `${row.uuid}:${action.suffix}`
                                        }
                                        onClick={() =>
                                          void runAction(
                                            row,
                                            action.suffix,
                                          )
                                        }
                                      >
                                        {actionBusy ===
                                        `${row.uuid}:${action.suffix}`
                                          ? "…"
                                          : action.label}
                                      </button>
                                    ),
                                  )}
                              </div>
                            </td>
                          </tr>
                        ),
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <p className="table-footnote">
                Search filters the records
                currently returned by the
                backend.
              </p>

              <footer className="dashboard-footer">
                <span>
                  KwariHub Admin
                </span>

                <span>
                  Actions use the backend’s
                  existing admin routes
                </span>
              </footer>
            </>
          )}
        </section>
      </main>

      {/* DETAIL PANEL */}
      {detail && (
        <div
          className="detail-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setDetail(null);
            }
          }}
        >
          <section
            className="detail-panel"
            role="dialog"
            aria-modal="true"
            aria-label={`${config?.title} details`}
          >
            <div className="detail-head">
              <div>
                <p className="eyebrow">
                  RECORD DETAILS
                </p>

                <h2>
                  {config?.title.slice(
                    0,
                    -1,
                  ) || "Record"}
                </h2>
              </div>

              <button
                type="button"
                className="detail-close"
                onClick={() =>
                  setDetail(null)
                }
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            <div className="detail-fields">
              {Object.entries(detail)
                .filter(
                  ([key]) =>
                    !/(password|token|secret|webhook_payload|account_number)/i.test(
                      key,
                    ),
                )
                .map(([key, value]) => (
                  <div
                    className="detail-field"
                    key={key}
                  >
                    <span>
                      {pretty(key)}
                    </span>

                    <strong>
                      {display(
                        value,
                        key,
                      )}
                    </strong>
                  </div>
                ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function actionVisible(
  section: Section,
  suffix: string,
  row: Row,
) {
  if (
    section === "users" &&
    suffix === "activate"
  ) {
    return row.is_active === false;
  }

  if (
    section === "users" &&
    suffix === "deactivate"
  ) {
    return row.is_active === true;
  }

  if (
    section === "sellers" &&
    suffix === "activate"
  ) {
    return row.is_active === false;
  }

  if (
    section === "sellers" &&
    suffix === "suspend"
  ) {
    return row.is_active === true;
  }

  if (
    section === "sellers" &&
    suffix === "verify"
  ) {
    return row.is_verified === false;
  }

  if (
    section === "products" &&
    suffix === "approve"
  ) {
    return row.is_active === false;
  }

  if (
    section === "products" &&
    suffix === "reject"
  ) {
    return row.is_active === true;
  }

  if (
    section === "reviews" &&
    suffix === "hide"
  ) {
    return row.is_active === true;
  }

  if (
    section === "reviews" &&
    suffix === "show"
  ) {
    return row.is_active === false;
  }

  if (
    section === "orders" &&
    suffix === "cancel"
  ) {
    return (
      String(row.status ?? "").toUpperCase() !==
      "CANCELLED"
    );
  }

  if (
    section === "withdrawals" &&
    suffix === "approve"
  ) {
    return (
      String(row.status ?? "").toUpperCase() ===
      "PENDING"
    );
  }

  if (
    section === "withdrawals" &&
    suffix === "reject"
  ) {
    return (
      String(row.status ?? "").toUpperCase() ===
      "PENDING"
    );
  }

  if (
    section === "withdrawals" &&
    suffix === "paid"
  ) {
    return (
      String(row.status ?? "").toUpperCase() ===
      "APPROVED"
    );
  }

  return true;
}

function ErrorBanner({
  error,
  retry,
}: {
  error: string;
  retry: () => void;
}) {
  return (
    <div
      className="error-banner"
      role="alert"
    >
      <span>{error}</span>

      <button
        type="button"
        onClick={retry}
      >
        Try again
      </button>
    </div>
  );
}