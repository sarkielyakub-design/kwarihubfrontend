export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://kwarihub-backend-production-ea77.up.railway.app/api/v1"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiOptions = RequestInit & {
  skipAuth?: boolean;
};

export async function api<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { skipAuth, ...requestOptions } = options;

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("kwarihub_access_token")
      : null;

  const headers = new Headers(requestOptions.headers);

  if (token && !skipAuth) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (
    requestOptions.body &&
    !(requestOptions.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...requestOptions,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "Unable to connect to KwariHub. Please check your internet connection.",
      0,
    );
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    const detail = data?.detail;

    let message = "Something went wrong. Please try again.";

    if (Array.isArray(detail)) {
      message = detail
        .map((item: { msg?: string }) => item?.msg)
        .filter(Boolean)
        .join(", ");
    } else if (typeof detail === "string") {
      message = detail;
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

export const money = (value: number | string | undefined | null) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export const dateTime = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";

export type User = {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  avatar?: string | null;
};

export type Product = {
  uuid: string;
  category_id: number;
  name: string;
  sku: string;
  description: string;
  price: number;
  discount_price?: number | null;
  quantity: number;
  unit: string;
  brand?: string | null;
  origin?: string | null;
  status: string;
  is_featured: boolean;
  is_active: boolean;
};

export type Variant = {
  uuid: string;
  color: string;
  size: string;
  material: string;
  sku: string;
  price: number;
  quantity: number;
  is_active: boolean;
};

export type ImageAsset = {
  uuid: string;
  image: string;
  is_primary: boolean;
  sort_order: number;
};

export type SellerOrder = {
  order_uuid: string;
  order_number: string;
  buyer_name: string;
  shipping_address: string;
  status: string;
  created_at: string;
  items: {
    uuid: string;
    product_name: string;
    variant_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
};