const configuredOrigin =
  process.env.KWARIHUB_API_URL ??
  "https://kwarihub-backend-production-ea77.up.railway.app";

export const backendBaseUrl =
  `${configuredOrigin.replace(/\/+$/, "")}/api/v1`;

/* =========================================================
   GENERIC BACKEND REQUEST
   ========================================================= */

export async function backendRequest(
  path: string,
  init: RequestInit = {},
) {
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  const url =
    `${backendBaseUrl}${normalizedPath}`;

  console.log(
    "[KwariHub] Backend request:",
    url,
  );

  return fetch(url, {
    ...init,

    cache: "no-store",

    headers: {
      Accept: "application/json",
      ...init.headers,
    },
  });
}

/* =========================================================
   ERROR HANDLER
   ========================================================= */

export async function errorMessage(
  response: Response,
) {
  try {
    const body = (await response.json()) as {
      detail?: unknown;
      message?: unknown;
    };

    if (typeof body.detail === "string") {
      return body.detail;
    }

    if (typeof body.message === "string") {
      return body.message;
    }
  } catch {
    // Ignore non-JSON responses.
  }

  return `KwariHub API request failed (${response.status}).`;
}

/* =========================================================
   ADMIN API
   ========================================================= */

/**
 * Admin dashboard summary.
 *
 * GET /api/v1/admin/dashboard
 */
export async function adminDashboard(
  init: RequestInit = {},
) {
  return backendRequest(
    "/admin/dashboard",
    {
      ...init,
      method: "GET",
    },
  );
}

/**
 * Admin analytics.
 *
 * GET /api/v1/admin/analytics
 */
export async function adminAnalytics(
  init: RequestInit = {},
) {
  return backendRequest(
    "/admin/analytics",
    {
      ...init,
      method: "GET",
    },
  );
}

/* =========================================================
   ADMIN RESOURCE HELPERS
   ========================================================= */

export type AdminResource =
  | "users"
  | "sellers"
  | "products"
  | "orders"
  | "payments"
  | "withdrawals"
  | "reviews";

/**
 * Get all records for an admin resource.
 *
 * Examples:
 *
 * GET /api/v1/admin/users
 * GET /api/v1/admin/sellers
 * GET /api/v1/admin/products
 * GET /api/v1/admin/orders
 * GET /api/v1/admin/payments
 * GET /api/v1/admin/withdrawals
 * GET /api/v1/admin/reviews
 */
export async function adminList(
  resource: AdminResource,
  init: RequestInit = {},
) {
  return backendRequest(
    `/admin/${resource}`,
    {
      ...init,
      method: "GET",
    },
  );
}

/**
 * Get one admin resource record.
 *
 * GET /api/v1/admin/{resource}/{uuid}
 */
export async function adminDetail(
  resource: AdminResource,
  uuid: string,
  init: RequestInit = {},
) {
  return backendRequest(
    `/admin/${resource}/${encodeURIComponent(uuid)}`,
    {
      ...init,
      method: "GET",
    },
  );
}

/**
 * Update/admin action.
 *
 * PATCH /api/v1/admin/{resource}/{uuid}/{action}
 */
export async function adminAction(
  resource: AdminResource,
  uuid: string,
  action: string,
  init: RequestInit = {},
) {
  return backendRequest(
    `/admin/${resource}/${encodeURIComponent(uuid)}/${action}`,
    {
      ...init,
      method: "PATCH",
    },
  );
}

/**
 * Delete an admin resource.
 *
 * DELETE /api/v1/admin/{resource}/{uuid}
 */
export async function adminDelete(
  resource: AdminResource,
  uuid: string,
  init: RequestInit = {},
) {
  return backendRequest(
    `/admin/${resource}/${encodeURIComponent(uuid)}`,
    {
      ...init,
      method: "DELETE",
    },
  );
}

/* =========================================================
   ADMIN USERS
   ========================================================= */

export async function adminUsers(
  init: RequestInit = {},
) {
  return adminList("users", init);
}

export async function adminUser(
  uuid: string,
  init: RequestInit = {},
) {
  return adminDetail(
    "users",
    uuid,
    init,
  );
}

export async function activateAdminUser(
  uuid: string,
) {
  return adminAction(
    "users",
    uuid,
    "activate",
  );
}

export async function deactivateAdminUser(
  uuid: string,
) {
  return adminAction(
    "users",
    uuid,
    "deactivate",
  );
}

export async function deleteAdminUser(
  uuid: string,
) {
  return adminDelete(
    "users",
    uuid,
  );
}

/* =========================================================
   ADMIN SELLERS
   ========================================================= */

export async function adminSellers(
  init: RequestInit = {},
) {
  return adminList(
    "sellers",
    init,
  );
}

export async function adminSeller(
  uuid: string,
  init: RequestInit = {},
) {
  return adminDetail(
    "sellers",
    uuid,
    init,
  );
}

export async function verifyAdminSeller(
  uuid: string,
) {
  return adminAction(
    "sellers",
    uuid,
    "verify",
  );
}

export async function suspendAdminSeller(
  uuid: string,
) {
  return adminAction(
    "sellers",
    uuid,
    "suspend",
  );
}

export async function activateAdminSeller(
  uuid: string,
) {
  return adminAction(
    "sellers",
    uuid,
    "activate",
  );
}

/* =========================================================
   ADMIN PRODUCTS
   ========================================================= */

export async function adminProducts(
  init: RequestInit = {},
) {
  return adminList(
    "products",
    init,
  );
}

export async function adminProduct(
  uuid: string,
  init: RequestInit = {},
) {
  return adminDetail(
    "products",
    uuid,
    init,
  );
}

export async function approveAdminProduct(
  uuid: string,
) {
  return adminAction(
    "products",
    uuid,
    "approve",
  );
}

export async function rejectAdminProduct(
  uuid: string,
) {
  return adminAction(
    "products",
    uuid,
    "reject",
  );
}

export async function deleteAdminProduct(
  uuid: string,
) {
  return adminDelete(
    "products",
    uuid,
  );
}

/* =========================================================
   ADMIN ORDERS
   ========================================================= */

export async function adminOrders(
  init: RequestInit = {},
) {
  return adminList(
    "orders",
    init,
  );
}

export async function adminOrder(
  uuid: string,
  init: RequestInit = {},
) {
  return adminDetail(
    "orders",
    uuid,
    init,
  );
}

export async function cancelAdminOrder(
  uuid: string,
) {
  return adminAction(
    "orders",
    uuid,
    "cancel",
  );
}

/* =========================================================
   ADMIN PAYMENTS
   ========================================================= */

export async function adminPayments(
  init: RequestInit = {},
) {
  return adminList(
    "payments",
    init,
  );
}

export async function adminPayment(
  uuid: string,
  init: RequestInit = {},
) {
  return adminDetail(
    "payments",
    uuid,
    init,
  );
}

/* =========================================================
   ADMIN WITHDRAWALS
   ========================================================= */

export async function adminWithdrawals(
  init: RequestInit = {},
) {
  return adminList(
    "withdrawals",
    init,
  );
}

export async function adminWithdrawal(
  uuid: string,
  init: RequestInit = {},
) {
  return adminDetail(
    "withdrawals",
    uuid,
    init,
  );
}

export async function approveAdminWithdrawal(
  uuid: string,
) {
  return adminAction(
    "withdrawals",
    uuid,
    "approve",
  );
}

export async function payAdminWithdrawal(
  uuid: string,
) {
  return adminAction(
    "withdrawals",
    uuid,
    "paid",
  );
}

export async function rejectAdminWithdrawal(
  uuid: string,
  reason: string,
) {
  const query =
    `?reason=${encodeURIComponent(reason)}`;

  return backendRequest(
    `/admin/withdrawals/${encodeURIComponent(
      uuid,
    )}/reject${query}`,
    {
      method: "PATCH",
    },
  );
}

/* =========================================================
   ADMIN REVIEWS
   ========================================================= */

export async function adminReviews(
  init: RequestInit = {},
) {
  return adminList(
    "reviews",
    init,
  );
}

export async function adminReview(
  uuid: string,
  init: RequestInit = {},
) {
  return adminDetail(
    "reviews",
    uuid,
    init,
  );
}

export async function hideAdminReview(
  uuid: string,
) {
  return adminAction(
    "reviews",
    uuid,
    "hide",
  );
}

export async function showAdminReview(
  uuid: string,
) {
  return adminAction(
    "reviews",
    uuid,
    "show",
  );
}

export async function deleteAdminReview(
  uuid: string,
) {
  return adminDelete(
    "reviews",
    uuid,
  );
}