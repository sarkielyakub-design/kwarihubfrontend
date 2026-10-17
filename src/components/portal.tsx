
"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  api,
  dateTime,
  money,
  Product,
  SellerOrder,
  User,
  Variant,
  ImageAsset,
  vendorApi,
  VendorApplication,
  VendorApplicationRequest,
} from "@/lib/api";

import {
  Badge,
  Modal,
  PageState,
  Toast,
} from "@/components/ui";

type View =
  | "dashboard"
  | "products"
  | "orders"
  | "inventory"
  | "wallet"
  | "withdrawals"
  | "banks"
  | "notifications"
  | "settings";

const nav: { id: View; label: string; icon: string }[] = [
  { id: "dashboard", label: "Overview", icon: "◫" },
  { id: "products", label: "Products", icon: "□" },
  { id: "orders", label: "Orders", icon: "▣" },
  { id: "inventory", label: "Inventory", icon: "▤" },
  { id: "wallet", label: "Wallet", icon: "◒" },
  { id: "withdrawals", label: "Withdrawals", icon: "↗" },
  { id: "banks", label: "Bank accounts", icon: "▧" },
  { id: "notifications", label: "Notifications", icon: "♧" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

const title: Record<View, string> = {
  dashboard: "Overview",
  products: "Products",
  orders: "Orders",
  inventory: "Inventory",
  wallet: "Wallet",
  withdrawals: "Withdrawals",
  banks: "Bank accounts",
  notifications: "Notifications",
  settings: "Settings",
};

export function Portal({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const [application, setApplication] =
    useState<VendorApplication | null>(null);
  const [applicationLoading, setApplicationLoading] =
    useState(true);
  const [applicationError, setApplicationError] = useState("");
  const [applicationMissing, setApplicationMissing] = useState(false);

  const [view, setView] = useState<View>("dashboard");
  const [mobile, setMobile] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const notify = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3500);
  };

  const loadApplication = useCallback(async () => {
    setApplicationLoading(true);
    setApplicationError("");

    try {
      const result = await vendorApi.getApplication();
      setApplication(result);
      setApplicationMissing(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load your vendor application.";

      const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error
          ? Number((error as { status?: unknown }).status)
          : undefined;

      if (
        status === 404 ||
        /(?:404|not found|no vendor application|application does not exist)/i.test(
          message,
        )
      ) {
        setApplication(null);
        setApplicationMissing(true);
      } else {
        setApplicationError(message);
      }
    } finally {
      setApplicationLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApplication();
  }, [loadApplication]);

  if (applicationLoading) {
    return (
      <div className="portal">
        <main className="workspace">
          <PageState type="loading" />
        </main>
      </div>
    );
  }

  if (applicationError) {
    return (
      <div className="portal">
        <main className="workspace">
          <section className="panel">
            <h2>Unable to load vendor application</h2>
            <p>{applicationError}</p>

            <button
              className="button primary"
              type="button"
              onClick={() => void loadApplication()}
            >
              Try again
            </button>

            <button
              className="button ghost"
              type="button"
              onClick={onLogout}
            >
              Sign out
            </button>
          </section>
        </main>
      </div>
    );
  }

  const vendorStatus = String(application?.status ?? "")
  .trim()
  .toLowerCase();

if (!application || vendorStatus !== "approved") {
  return (
    <VendorApplicationPage
      user={user}
      application={application}
      applicationMissing={applicationMissing}
      onApplicationSaved={(saved) => {
        setApplication(saved);
        setApplicationMissing(false);
        notify(
          String(saved.status).trim().toLowerCase() === "approved"
            ? "Your vendor account is approved."
            : "Vendor application saved successfully.",
        );
      }}
      onLogout={onLogout}
      toast={toast}
    />
  );
}
  return (
    <div className="portal">
      <aside className={mobile ? "sidebar open" : "sidebar"}>
        <div className="sidebar-brand">
          <div className="brand-mark small-mark">K</div>
          <span>KwariHub</span>

          <button
            type="button"
            className="mobile-only icon-button"
            onClick={() => setMobile(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <nav>
          {nav.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                setView(item.id);
                setMobile(false);
              }}
              className={
                view === item.id
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <i>{item.icon}</i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-mini">
            <div className="avatar">
              {user.first_name?.[0] ?? ""}
              {user.last_name?.[0] ?? ""}
            </div>

            <span>
              <b>
                {user.first_name} {user.last_name}
              </b>
              <small>@{user.username}</small>
            </span>
          </div>

          <button
            type="button"
            className="nav-link"
            onClick={onLogout}
          >
            <i>↪</i>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {mobile && (
        <div
          className="scrim"
          onClick={() => setMobile(false)}
        />
      )}

      <main className="workspace">
        <header>
          <button
            type="button"
            className="mobile-menu icon-button"
            onClick={() => setMobile(true)}
            aria-label="Open menu"
          >
            ☰
          </button>

          <div>
            <p className="eyebrow">SELLER PORTAL</p>
            <h1>{title[view]}</h1>
          </div>

          <div className="header-user">
            <span className="muted">{user.email}</span>

            <div className="avatar">
              {user.first_name?.[0] ?? ""}
              {user.last_name?.[0] ?? ""}
            </div>
          </div>
        </header>

        <div className="content">
          {view === "dashboard" && <Dashboard />}

          {view === "products" && (
            <Products notify={notify} />
          )}

          {view === "orders" && (
            <Orders notify={notify} />
          )}

          {view === "inventory" && (
            <Inventory notify={notify} />
          )}

          {view === "wallet" && <Wallet />}

          {view === "withdrawals" && (
            <Withdrawals notify={notify} />
          )}

          {view === "banks" && (
            <Banks notify={notify} />
          )}

          {view === "notifications" && (
            <Notifications notify={notify} />
          )}

          {view === "settings" && (
            <Settings user={user} notify={notify} />
          )}
        </div>
      </main>

      {toast && <Toast {...toast} />}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Vendor application / approval gate                                         */
/* -------------------------------------------------------------------------- */

type VendorApplicationPageProps = {
  user: User;
  application: VendorApplication | null;
  applicationMissing: boolean;
  onApplicationSaved: (
    application: VendorApplication,
  ) => void;
  onLogout: () => void;
  toast: {
    message: string;
    type: "success" | "error";
  } | null;
};

function VendorApplicationPage({
  user,
  application,
  applicationMissing,
  onApplicationSaved,
  onLogout,
  toast,
}: VendorApplicationPageProps) {
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] =
    useState<VendorApplicationRequest>({
      business_name: application?.business_name ?? "",
      business_description:
        application?.business_description ?? "",
      business_phone:
        application?.business_phone ?? user.phone ?? "",
      business_email:
        application?.business_email ?? user.email ?? "",
      country: application?.country ?? "Nigeria",
      state: application?.state ?? "",
      city: application?.city ?? "",
      address: application?.address ?? "",
    });

  useEffect(() => {
    setForm({
      business_name: application?.business_name ?? "",
      business_description:
        application?.business_description ?? "",
      business_phone:
        application?.business_phone ?? user.phone ?? "",
      business_email:
        application?.business_email ?? user.email ?? "",
      country: application?.country ?? "Nigeria",
      state: application?.state ?? "",
      city: application?.city ?? "",
      address: application?.address ?? "",
    });
  }, [application, user.email, user.phone]);

  function setField<K extends keyof VendorApplicationRequest>(
    key: K,
    value: VendorApplicationRequest[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (busy) return;

    setBusy(true);
    setFormError("");

    const payload: VendorApplicationRequest = {
      business_name: form.business_name.trim(),
      business_description:
        form.business_description?.trim() || null,
      business_phone: form.business_phone.trim(),
      business_email: form.business_email.trim(),
      country: form.country.trim(),
      state: form.state.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
    };

    try {
      const saved =
        applicationMissing || !application
          ? await vendorApi.submitApplication(payload)
          : await vendorApi.updateApplication(payload);

      onApplicationSaved(saved);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not save your vendor application.",
      );
    } finally {
      setBusy(false);
    }
  }

  const status = application?.status;
  const statusLabel = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Not submitted";

  return (
    <div className="portal">
      <main className="workspace">
        <header>
          <div>
            <p className="eyebrow">KWARIHUB SELLERS</p>
            <h1>Become a vendor</h1>
            <p className="muted">
              Apply to sell your products on KwariHub.
            </p>
          </div>

          <button
            type="button"
            className="button ghost"
            onClick={onLogout}
          >
            Sign out
          </button>
        </header>

        <div className="content">
          <section className="panel">
            <h2>
              {application
                ? "Your vendor application"
                : "Vendor registration"}
            </h2>

            <p className="muted">
              {application
                ? `Application status: ${statusLabel}`
                : "Complete your business details to submit your application."}
            </p>

            {application?.status === "pending" && (
              <div className="notice">
                <strong>Application under review</strong>
                <p>
                  Your application has been received. You
                  will be able to access the seller modules
                  after an administrator approves your account.
                </p>
              </div>
            )}

            {application?.status === "rejected" && (
              <div className="notice error-notice">
                <strong>Application rejected</strong>
                <p>
                  {application.rejection_reason ||
                    "No rejection reason was provided. Please review your business details and contact support if needed."}
                </p>
              </div>
            )}

            {application?.status === "suspended" && (
              <div className="notice error-notice">
                <strong>Vendor account suspended</strong>
                <p>
                  Your seller access is currently suspended.
                  Please contact KwariHub support for assistance.
                </p>
              </div>
            )}

            {application?.admin_note && (
              <div className="notice">
                <strong>Administrator note</strong>
                <p>{application.admin_note}</p>
              </div>
            )}

            {formError && (
              <div className="notice error-notice">
                {formError}
              </div>
            )}

            <form
              className="form-grid"
              onSubmit={submit}
            >
              <label>
                Business name
                <input
                  value={form.business_name}
                  onChange={(event) =>
                    setField(
                      "business_name",
                      event.target.value,
                    )
                  }
                  minLength={2}
                  maxLength={255}
                  required
                  placeholder="Your business name"
                  disabled={busy || status === "suspended"}
                />
              </label>

              <label>
                Business phone
                <input
                  type="tel"
                  value={form.business_phone}
                  onChange={(event) =>
                    setField(
                      "business_phone",
                      event.target.value,
                    )
                  }
                  minLength={7}
                  maxLength={20}
                  required
                  placeholder="+234..."
                  disabled={busy || status === "suspended"}
                />
              </label>

              <label>
                Business email
                <input
                  type="email"
                  value={form.business_email}
                  onChange={(event) =>
                    setField(
                      "business_email",
                      event.target.value,
                    )
                  }
                  required
                  placeholder="business@example.com"
                  disabled={busy || status === "suspended"}
                />
              </label>

              <label>
                Country
                <input
                  value={form.country}
                  onChange={(event) =>
                    setField("country", event.target.value)
                  }
                  required
                  maxLength={100}
                  disabled={busy || status === "suspended"}
                />
              </label>

              <label>
                State
                <input
                  value={form.state}
                  onChange={(event) =>
                    setField("state", event.target.value)
                  }
                  required
                  maxLength={100}
                  placeholder="e.g. Kano"
                  disabled={busy || status === "suspended"}
                />
              </label>

              <label>
                City
                <input
                  value={form.city}
                  onChange={(event) =>
                    setField("city", event.target.value)
                  }
                  required
                  maxLength={100}
                  placeholder="Your city"
                  disabled={busy || status === "suspended"}
                />
              </label>

              <label className="full">
                Business address
                <textarea
                  value={form.address}
                  onChange={(event) =>
                    setField("address", event.target.value)
                  }
                  minLength={5}
                  maxLength={500}
                  rows={3}
                  required
                  placeholder="Full business address"
                  disabled={busy || status === "suspended"}
                />
              </label>

              <label className="full">
                Business description
                <textarea
                  value={form.business_description ?? ""}
                  onChange={(event) =>
                    setField(
                      "business_description",
                      event.target.value,
                    )
                  }
                  maxLength={5000}
                  rows={4}
                  placeholder="Tell customers about your business"
                  disabled={busy || status === "suspended"}
                />
              </label>

              {status !== "suspended" && (
                <div className="modal-actions full">
                  <button
                    className="button primary"
                    type="submit"
                    disabled={busy}
                  >
                    {busy
                      ? "Saving application…"
                      : application
                        ? "Update application"
                        : "Submit application"}
                  </button>
                </div>
              )}
            </form>
          </section>
        </div>
      </main>

      {toast && <Toast {...toast} />}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared loader                                                              */
/* -------------------------------------------------------------------------- */

function useLoad<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");

    try {
      const result = await api<T>(path);
      setData(result);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load data.",
      );
    }
  }, [path]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, error, load };
}

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                  */
/* -------------------------------------------------------------------------- */

type SellerDashboard = {
  total_products: number;
  active_products: number;
  total_orders: number;
  pending_orders: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  total_sales: number;
  today_sales: number;
  total_customers: number;
  average_rating: number;
  out_of_stock_products: number;
};

function Dashboard() {
  const { data, error } =
    useLoad<SellerDashboard>("/seller/dashboard");

  if (error) {
    return <PageState type="error">{error}</PageState>;
  }

  if (!data) {
    return <PageState type="loading" />;
  }

  const stats = [
    {
      name: "Total sales",
      value: money(data.total_sales),
      sub: "All time",
    },
    {
      name: "Today's sales",
      value: money(data.today_sales),
      sub: "Today",
    },
    {
      name: "Orders",
      value: data.total_orders,
      sub: "Across all statuses",
    },
    {
      name: "Active products",
      value: data.active_products,
      sub: `${data.out_of_stock_products} out of stock`,
    },
  ];

  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">YOUR STORE AT A GLANCE</p>
          <h2>Good to see you.</h2>
          <p>
            Here&apos;s how your shop is performing right now.
          </p>
        </div>

        <div className="hero-orders">
          <b>{data.pending_orders}</b>
          <span>orders need attention</span>
        </div>
      </section>

      <section className="stat-grid">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.name}>
            <p>{stat.name}</p>
            <strong>{stat.value}</strong>
            <small>{stat.sub}</small>
          </article>
        ))}
      </section>

      <section className="two-grid">
        <article className="panel">
          <div className="panel-heading">
            <h2>Order pipeline</h2>
          </div>

          <div className="pipeline">
            <span>
              Pending <b>{data.pending_orders}</b>
            </span>
            <span>
              Processing <b>{data.processing_orders}</b>
            </span>
            <span>
              Shipped <b>{data.shipped_orders}</b>
            </span>
            <span>
              Delivered <b>{data.delivered_orders}</b>
            </span>
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h2>Customers &amp; quality</h2>
          </div>

          <div className="metric-list">
            <p>
              Customers <b>{data.total_customers}</b>
            </p>
            <p>
              Average rating
              <b>
                {Number(data.average_rating).toFixed(1)} / 5
              </b>
            </p>
            <p>
              Catalogued products
              <b>{data.total_products}</b>
            </p>
          </div>
        </article>
      </section>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Products                                                                   */
/* -------------------------------------------------------------------------- */

function Products({
  notify,
}: {
  notify: (
    message: string,
    type?: "success" | "error",
  ) => void;
}) {
  const { data, error, load } =
    useLoad<Product[]>("/products/my-products");

  const [editor, setEditor] =
    useState<Product | null | undefined>();

  const [details, setDetails] =
    useState<Product | null>(null);

  async function remove(product: Product) {
    const confirmed = window.confirm(
      `Delete ${product.name}?`,
    );

    if (!confirmed) return;

    try {
      await api(`/products/${product.uuid}`, {
        method: "DELETE",
      });

      notify("Product removed.");
      await load();
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Could not remove product.",
        "error",
      );
    }
  }

  if (error) {
    return <PageState type="error">{error}</PageState>;
  }

  if (!data) {
    return <PageState type="loading" />;
  }

  return (
    <>
      <div className="toolbar">
        <p className="muted">
          {data.length} products in your catalogue
        </p>

        <button
          type="button"
          className="button primary"
          onClick={() => setEditor(null)}
        >
          + Add product
        </button>
      </div>

      {data.length === 0 ? (
        <PageState type="empty">
          Create your first product to start selling.
        </PageState>
      ) : (
        <div className="panel table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {data.map((product) => (
                <tr key={product.uuid}>
                  <td>
                    <b>{product.name}</b>
                    <small>
                      {product.brand || product.unit}
                    </small>
                  </td>

                  <td>{product.sku}</td>

                  <td>
                    {money(
                      product.discount_price ?? product.price,
                    )}
                  </td>

                  <td>{product.quantity}</td>

                  <td>
                    <Badge>
                      {product.is_active
                        ? product.status
                        : "INACTIVE"}
                    </Badge>
                  </td>

                  <td className="actions">
                    <button
                      type="button"
                      onClick={() => setDetails(product)}
                    >
                      Manage
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditor(product)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="danger-text"
                      onClick={() => void remove(product)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editor !== undefined && (
        <ProductForm
          product={editor ?? undefined}
          onClose={() => setEditor(undefined)}
          onDone={() => {
            setEditor(undefined);
            void load();

            notify(
              editor ? "Product updated." : "Product created.",
            );
          }}
          notify={notify}
        />
      )}

      {details && (
        <ProductDetail
          product={details}
          onClose={() => setDetails(null)}
          notify={notify}
        />
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Product form                                                               */
/* -------------------------------------------------------------------------- */

type Category = {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  parent_id?: number | null;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
};

type DraftVariant = {
  id: string;
  color: string;
  size: string;
  material: string;
  price: string;
  quantity: string;
};

type CategoryResponse =
  | Category[]
  | {
      data?: unknown;
      items?: unknown;
      results?: unknown;
      categories?: unknown;
    };

const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_PRODUCT_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function normalizeCategories(value: unknown): Category[] {
  if (Array.isArray(value)) {
    return value as Category[];
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const record = value as Record<string, unknown>;

  for (const key of ["data", "items", "results", "categories"]) {
    const candidate = record[key];

    if (Array.isArray(candidate)) {
      return candidate as Category[];
    }

    if (candidate && typeof candidate === "object") {
      const nested = normalizeCategories(candidate);

      if (nested.length > 0) {
        return nested;
      }
    }
  }

  return [];
}

function ProductForm({
  product,
  onClose,
  onDone,
  notify,
}: {
  product?: Product;
  onClose: () => void;
  onDone: () => void;
  notify: (
    message: string,
    type?: "success" | "error",
  ) => void;
}) {
  const {
    data: categoriesResponse,
    error: categoriesError,
  } = useLoad<CategoryResponse>("/categories");

  const categories = normalizeCategories(categoriesResponse);

  const [busy, setBusy] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    null,
  );

  const [variants, setVariants] = useState<DraftVariant[]>([]);
  const [showVariants, setShowVariants] = useState(true);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    if (!ALLOWED_PRODUCT_IMAGE_TYPES.includes(file.type)) {
      notify("Only JPG, PNG, and WEBP images are allowed.", "error");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
      notify("Product image must be 5MB or smaller.", "error");
      event.target.value = "";
      return;
    }

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function addVariantRow() {
    setVariants((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        color: "",
        size: "",
        material: "",
        price: "",
        quantity: "",
      },
    ]);
  }

  function updateVariant(
    id: string,
    field: keyof Omit<DraftVariant, "id">,
    value: string,
  ) {
    setVariants((current) =>
      current.map((variant) =>
        variant.id === id
          ? { ...variant, [field]: value }
          : variant,
      ),
    );
  }

  function removeVariant(id: string) {
    setVariants((current) =>
      current.filter((variant) => variant.id !== id),
    );
  }

  async function uploadImage(productUuid: string) {
    if (!imageFile) return;

    const uploadData = new FormData();
    uploadData.append("image", imageFile);

    await api(`/products/${productUuid}/images`, {
      method: "POST",
      body: uploadData,
    });
  }

  async function createVariants(productUuid: string) {
    for (const variant of variants) {
      const color = variant.color.trim();
      const size = variant.size.trim();
      const material = variant.material.trim();
      const price = Number(variant.price);
      const quantity = Number(variant.quantity);

      if (!color || !size || !material) {
        throw new Error(
          "Every variant must have colour, size, and material.",
        );
      }

      if (!Number.isFinite(price) || price < 0) {
        throw new Error(
          `Invalid price for variant "${color} ${size}".`,
        );
      }

      if (!Number.isInteger(quantity) || quantity < 0) {
        throw new Error(
          `Invalid quantity for variant "${color} ${size}".`,
        );
      }

      await api(`/products/${productUuid}/variants`, {
        method: "POST",
        body: JSON.stringify({
          color,
          size,
          material,
          price,
          quantity,
        }),
      });
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) return;

    const form = new FormData(event.currentTarget);

    const categoryId = Number(form.get("category_id"));
    const name = String(form.get("name") ?? "").trim();
    const description = String(
      form.get("description") ?? "",
    ).trim();
    const price = Number(form.get("price"));
    const quantity = Number(form.get("quantity"));

    const discountValue = String(
      form.get("discount_price") ?? "",
    ).trim();

    const discountPrice =
      discountValue !== "" ? Number(discountValue) : null;

    const unit = String(form.get("unit") ?? "").trim();
    const brand = String(form.get("brand") ?? "").trim();
    const origin = String(form.get("origin") ?? "").trim();
    const isFeatured = form.get("is_featured") === "on";

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      notify("Please select a valid product category.", "error");
      return;
    }

    if (name.length < 3) {
      notify(
        "Product name must contain at least 3 characters.",
        "error",
      );
      return;
    }

    if (description.length < 10) {
      notify(
        "Product description must contain at least 10 characters.",
        "error",
      );
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      notify("Please enter a valid product price.", "error");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      notify("Please enter a valid product quantity.", "error");
      return;
    }

    if (
      discountPrice !== null &&
      (!Number.isFinite(discountPrice) || discountPrice < 0)
    ) {
      notify("Please enter a valid discount price.", "error");
      return;
    }

    if (discountPrice !== null && discountPrice > price) {
      notify(
        "Discount price cannot be greater than the original price.",
        "error",
      );
      return;
    }

    if (!unit) {
      notify("Please enter the product unit.", "error");
      return;
    }

    setBusy(true);

    const body = {
      name,
      category_id: categoryId,
      description,
      price,
      quantity,
      discount_price: discountPrice,
      unit,
      brand,
      origin,
      is_featured: isFeatured,
    };

    try {
      let productUuid: string;

      if (product) {
        await api(`/products/${product.uuid}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });

        productUuid = product.uuid;
      } else {
        const createdProduct = await api<Product>("/products", {
          method: "POST",
          body: JSON.stringify(body),
        });

        productUuid = createdProduct.uuid;
      }

      if (imageFile) {
        await uploadImage(productUuid);
      }

      if (variants.length > 0) {
        await createVariants(productUuid);
      }

      onDone();
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Could not save product.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  }

  if (categoriesError) {
    return (
      <Modal
        title={product ? "Edit product" : "Add a product"}
        onClose={onClose}
      >
        <PageState type="error">
          Unable to load product categories.
          <p>{categoriesError}</p>
        </PageState>
      </Modal>
    );
  }

  if (!categoriesResponse) {
    return (
      <Modal
        title={product ? "Edit product" : "Add a product"}
        onClose={onClose}
      >
        <PageState type="loading" />
      </Modal>
    );
  }

  const activeCategories = categories
    .filter((category) => category.is_active)
    .sort(
      (a, b) =>
        a.sort_order - b.sort_order ||
        a.name.localeCompare(b.name),
    );

  return (
    <Modal
      title={product ? "Edit product" : "Add a product"}
      onClose={onClose}
    >
      <form className="form-grid" onSubmit={save}>
        <label>
          Product name
          <input
            name="name"
            defaultValue={product?.name ?? ""}
            required
            minLength={3}
            maxLength={255}
            placeholder="e.g. Premium Ankara Fabric"
          />
        </label>

        <label>
          Category
          <select
            name="category_id"
            defaultValue={
              product?.category_id
                ? String(product.category_id)
                : ""
            }
            required
            disabled={activeCategories.length === 0}
          >
            <option value="">Select a category</option>

            {activeCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {activeCategories.length === 0 && (
            <small className="muted">
              No active categories are available. Please contact
              the administrator.
            </small>
          )}
        </label>

        <label className="full">
          Description
          <textarea
            name="description"
            defaultValue={product?.description ?? ""}
            required
            minLength={10}
            rows={5}
            placeholder="Describe the product..."
          />
        </label>

        <label>
          Price (₦)
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.price ?? ""}
            required
          />
        </label>

        <label>
          Discount price (₦)
          <input
            name="discount_price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.discount_price ?? ""}
            placeholder="Optional"
          />
        </label>

        <label>
          Quantity
          <input
            name="quantity"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.quantity ?? 0}
            required
          />
        </label>

        <label>
          Unit
          <input
            name="unit"
            defaultValue={product?.unit ?? ""}
            required
            placeholder="yard, piece, roll"
          />
        </label>

        <label>
          Brand
          <input
            name="brand"
            defaultValue={product?.brand ?? ""}
            placeholder="Optional"
          />
        </label>

        <label>
          Origin
          <input
            name="origin"
            defaultValue={product?.origin ?? ""}
            placeholder="Optional"
          />
        </label>

        <div className="full">
          <label>Product image</label>

          {imagePreview && (
            <div
              style={{
                width: 180,
                height: 180,
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid rgba(0,0,0,.1)",
                margin: "12px 0",
              }}
            >
              <img
                src={imagePreview}
                alt="Product preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          )}

          <input
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
          />

          <small className="muted">
            JPG, PNG or WEBP · Maximum 5MB
          </small>
        </div>

        <div className="full detail-section">
          <div className="panel-heading">
            <div>
              <h3>Product variants</h3>
              <p className="muted">
                Add colour, size, material, price and stock variations.
              </p>
            </div>

            <button
              type="button"
              className="button ghost small-button"
              onClick={() =>
                setShowVariants((current) => !current)
              }
            >
              {showVariants ? "Hide" : "Show"}
            </button>
          </div>

          {showVariants && (
            <>
              {variants.map((variant, index) => (
                <div
                  key={variant.id}
                  className="panel"
                  style={{ padding: 16, marginTop: 12 }}
                >
                  <div className="panel-heading">
                    <strong>Variant {index + 1}</strong>

                    <button
                      type="button"
                      className="danger-text"
                      onClick={() => removeVariant(variant.id)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="form-grid compact">
                    <label>
                      Colour
                      <input
                        value={variant.color}
                        onChange={(event) =>
                          updateVariant(
                            variant.id,
                            "color",
                            event.target.value,
                          )
                        }
                        required
                        maxLength={100}
                        placeholder="Red"
                      />
                    </label>

                    <label>
                      Size
                      <input
                        value={variant.size}
                        onChange={(event) =>
                          updateVariant(
                            variant.id,
                            "size",
                            event.target.value,
                          )
                        }
                        required
                        maxLength={100}
                        placeholder="6 yards"
                      />
                    </label>

                    <label>
                      Material
                      <input
                        value={variant.material}
                        onChange={(event) =>
                          updateVariant(
                            variant.id,
                            "material",
                            event.target.value,
                          )
                        }
                        required
                        maxLength={150}
                        placeholder="Cotton"
                      />
                    </label>

                    <label>
                      Price (₦)
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.price}
                        onChange={(event) =>
                          updateVariant(
                            variant.id,
                            "price",
                            event.target.value,
                          )
                        }
                        required
                      />
                    </label>

                    <label>
                      Quantity
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={variant.quantity}
                        onChange={(event) =>
                          updateVariant(
                            variant.id,
                            "quantity",
                            event.target.value,
                          )
                        }
                        required
                      />
                    </label>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="button ghost"
                onClick={addVariantRow}
                style={{ marginTop: 12 }}
              >
                + Add variant
              </button>
            </>
          )}
        </div>

        <label className="check full">
          <input
            name="is_featured"
            type="checkbox"
            defaultChecked={product?.is_featured ?? false}
          />
          Feature this product
        </label>

        <div className="modal-actions full">
          <button
            type="button"
            className="button ghost"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="button primary"
            disabled={busy || activeCategories.length === 0}
          >
            {busy
              ? "Saving product…"
              : product
                ? "Update product"
                : "Create product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* Product detail                                                             */
/* -------------------------------------------------------------------------- */

function ProductDetail({
  product,
  onClose,
  notify,
}: {
  product: Product;
  onClose: () => void;
  notify: (
    message: string,
    type?: "success" | "error",
  ) => void;
}) {
  const {
    data: variants,
    error: variantsError,
    load: loadVariants,
  } = useLoad<Variant[]>(
    `/products/${product.uuid}/variants`,
  );

  const {
    data: images,
    error: imagesError,
    load: loadImages,
  } = useLoad<ImageAsset[]>(
    `/products/${product.uuid}/images`,
  );

  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busyVariant, setBusyVariant] = useState(false);

  function imageUrl(image: string): string {
    if (!image) return "";

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("blob:")
    ) {
      return image;
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ??
      "";

    let path = image.replaceAll("\\", "/");

    const storageIndex = path.indexOf("/storage/");

    if (storageIndex >= 0) {
      path = path.substring(storageIndex);
    } else if (path.startsWith("storage/")) {
      path = `/${path}`;
    } else if (!path.startsWith("/")) {
      path = `/storage/${path}`;
    }

    return `${apiUrl}${path}`;
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (uploading) return;

    const form = new FormData(event.currentTarget);
    const file = form.get("image");

    if (!(file instanceof File) || file.size === 0) {
      notify("Please select an image.", "error");
      return;
    }

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(
        file.type,
      )
    ) {
      notify(
        "Only JPG, PNG and WEBP images are allowed.",
        "error",
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notify("Image must be 5MB or smaller.", "error");
      return;
    }

    setUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append("image", file);

      await api(`/products/${product.uuid}/images`, {
        method: "POST",
        body: uploadData,
      });

      await loadImages();
      event.currentTarget.reset();

      notify("Image uploaded successfully.");
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Upload failed.",
        "error",
      );
    } finally {
      setUploading(false);
    }
  }

  async function makePrimary(image: ImageAsset) {
    try {
      await api(`/products/images/${image.uuid}/primary`, {
        method: "PATCH",
      });

      await loadImages();
      notify("Primary image updated.");
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Could not update primary image.",
        "error",
      );
    }
  }

  async function addVariant(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (busyVariant) return;

    const form = new FormData(event.currentTarget);

    const color = String(form.get("color") ?? "").trim();
    const size = String(form.get("size") ?? "").trim();
    const material = String(
      form.get("material") ?? "",
    ).trim();

    const price = Number(form.get("price"));
    const quantity = Number(form.get("quantity"));

    if (!color || !size || !material) {
      notify(
        "Colour, size and material are required.",
        "error",
      );
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      notify("Please enter a valid variant price.", "error");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      notify("Please enter a valid variant quantity.", "error");
      return;
    }

    setBusyVariant(true);

    try {
      await api(`/products/${product.uuid}/variants`, {
        method: "POST",
        body: JSON.stringify({
          color,
          size,
          material,
          price,
          quantity,
        }),
      });

      setAdding(false);
      await loadVariants();

      notify("Variant added.");
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Could not add variant.",
        "error",
      );
    } finally {
      setBusyVariant(false);
    }
  }

  return (
    <Modal title={product.name} onClose={onClose}>
      <div className="detail-section">
        <div className="panel-heading">
          <div>
            <h3>Product</h3>
            <p className="muted">
              {product.unit}
              {product.brand ? ` · ${product.brand}` : ""}
            </p>
          </div>

          <Badge>
            {product.is_active
              ? product.status
              : "INACTIVE"}
          </Badge>
        </div>

        <p>{product.description}</p>

        <div className="metric-list">
          <p>
            Price
            <b>{money(product.price)}</b>
          </p>

          {product.discount_price != null && (
            <p>
              Discount price
              <b>{money(product.discount_price)}</b>
            </p>
          )}

          <p>
            Quantity
            <b>{product.quantity}</b>
          </p>

          <p>
            SKU
            <b>{product.sku || "Not assigned"}</b>
          </p>
        </div>
      </div>

      <div className="detail-section">
        <div className="panel-heading">
          <div>
            <h3>Product images</h3>
            <p className="muted">
              Upload and manage product images.
            </p>
          </div>
        </div>

        {imagesError ? (
          <p className="danger-text">{imagesError}</p>
        ) : !images ? (
          <PageState type="loading" />
        ) : images.length > 0 ? (
          <div className="image-row">
            {images.map((image) => (
              <div className="product-image" key={image.uuid}>
                <img
                  src={imageUrl(image.image)}
                  alt={product.name}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />

                <button
                  type="button"
                  onClick={() => void makePrimary(image)}
                  disabled={image.is_primary}
                >
                  {image.is_primary
                    ? "Primary"
                    : "Make primary"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No images uploaded yet.</p>
        )}

        <form className="inline-form" onSubmit={upload}>
          <input
            type="file"
            name="image"
            accept="image/png,image/jpeg,image/webp"
            required
            disabled={uploading}
          />

          <button
            type="submit"
            className="button ghost"
            disabled={uploading}
          >
            {uploading ? "Uploading…" : "Upload image"}
          </button>
        </form>
      </div>

      <div className="detail-section">
        <div className="panel-heading">
          <div>
            <h3>Variants</h3>
            <p className="muted">
              Manage colours, sizes, materials, prices and stock.
            </p>
          </div>

          <button
            type="button"
            className="button ghost small-button"
            onClick={() =>
              setAdding((current) => !current)
            }
          >
            {adding ? "Cancel" : "+ Variant"}
          </button>
        </div>

        {adding && (
          <form
            className="form-grid compact"
            onSubmit={addVariant}
          >
            <label>
              Colour
              <input
                name="color"
                required
                maxLength={100}
              />
            </label>

            <label>
              Size
              <input
                name="size"
                required
                maxLength={100}
              />
            </label>

            <label>
              Material
              <input
                name="material"
                required
                maxLength={150}
              />
            </label>

            <label>
              Price
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </label>

            <label>
              Quantity
              <input
                name="quantity"
                type="number"
                min="0"
                step="1"
                required
              />
            </label>

            <div className="modal-actions full">
              <button
                type="submit"
                className="button primary"
                disabled={busyVariant}
              >
                {busyVariant ? "Adding…" : "Add variant"}
              </button>
            </div>
          </form>
        )}

        {variantsError ? (
          <p className="danger-text">{variantsError}</p>
        ) : !variants ? (
          <PageState type="loading" />
        ) : variants.length === 0 ? (
          <p className="muted">No variants yet.</p>
        ) : (
          <div className="variant-list">
            {variants.map((variant) => (
              <p key={variant.uuid}>
                <b>
                  {variant.color} · {variant.size}
                </b>

                <span>{variant.material}</span>

                <span>{variant.quantity} in stock</span>

                <span>{money(variant.price)}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* Orders                                                                     */
/* -------------------------------------------------------------------------- */

function Orders({
  notify,
}: {
  notify: (
    message: string,
    type?: "success" | "error",
  ) => void;
}) {
  const {
    data,
    error,
    load,
  } = useLoad<SellerOrder[]>("/seller/orders");

  const [chosen, setChosen] = useState<SellerOrder | null>(null);

  if (error) {
    return <PageState type="error">{error}</PageState>;
  }

  if (!data) {
    return <PageState type="loading" />;
  }

  return (
    <>
      {data.length === 0 ? (
        <PageState type="empty">
          Orders for your products will appear here.
        </PageState>
      ) : (
        <div className="panel table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Buyer</th>
                <th>Items</th>
                <th>Placed</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {data.map((order) => (
                <tr key={order.order_uuid}>
                  <td>
                    <b>#{order.order_number}</b>
                  </td>

                  <td>{order.buyer_name}</td>

                  <td>{order.items.length}</td>

                  <td>{dateTime(order.created_at)}</td>

                  <td>
                    <Badge>{order.status}</Badge>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => setChosen(order)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {chosen && (
        <OrderModal
          order={chosen}
          close={() => setChosen(null)}
          refresh={load}
          notify={notify}
        />
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Order modal                                                                */
/* -------------------------------------------------------------------------- */

function OrderModal({
  order,
  close,
  refresh,
  notify,
}: {
  order: SellerOrder;
  close: () => void;
  refresh: () => Promise<void> | void;
  notify: (
    message: string,
    type?: "success" | "error",
  ) => void;
}) {
  const [status, setStatus] = useState(order.status);
  const [busy, setBusy] = useState(false);

  async function update() {
    if (status === order.status || busy) {
      return;
    }

    setBusy(true);

    try {
      await api(
        `/seller/orders/${order.order_uuid}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
      );

      await refresh();

      notify("Order status updated.");
      close();
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Could not update status.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  }

  const total = order.items.reduce(
    (sum, item) => sum + Number(item.total_price),
    0,
  );

  return (
    <Modal
      title={`Order #${order.order_number}`}
      onClose={close}
    >
      <p className="muted">
        {order.buyer_name} · {dateTime(order.created_at)}
      </p>

      <div className="address">
        Ship to: {order.shipping_address}
      </div>

      <div className="order-items">
        {order.items.map((item) => (
          <p key={item.uuid}>
            <span>
              <b>{item.product_name}</b>

              <small>
                {item.variant_name} × {item.quantity}
              </small>
            </span>

            <b>{money(item.total_price)}</b>
          </p>
        ))}
      </div>

      <div className="total-row">
        <b>Order total</b>
        <b>{money(total)}</b>
      </div>

      <div className="status-edit">
        <label>
          Status

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            disabled={busy}
          >
            {[
              "PENDING",
              "PROCESSING",
              "SHIPPED",
              "DELIVERED",
              "CANCELLED",
            ].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="button primary"
          onClick={() => void update()}
          disabled={busy || status === order.status}
        >
          {busy ? "Updating…" : "Update status"}
        </button>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* Inventory                                                                  */
/* -------------------------------------------------------------------------- */

type InventoryItem = {
  uuid: string;
  product_name: string;
  sku: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
  is_active: boolean;
};

function Inventory({
  notify,
}: {
  notify: (
    message: string,
    type?: "success" | "error",
  ) => void;
}) {
  const {
    data,
    error,
    load,
  } = useLoad<InventoryItem[]>("/inventory");

  if (error) {
    return <PageState type="error">{error}</PageState>;
  }

  if (!data) {
    return <PageState type="loading" />;
  }

  async function adjust(item: InventoryItem) {
    const input = window.prompt(
      `Add stock for ${item.product_name}. Enter quantity:`,
    );

    if (input === null || input.trim() === "") {
      return;
    }

    const quantity = Number(input);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      notify("Please enter a valid quantity.", "error");
      return;
    }

    try {
      await api(`/inventory/${item.uuid}/add-stock`, {
        method: "POST",
        body: JSON.stringify({
          quantity,
          reason: "Seller stock adjustment",
        }),
      });

      await load();
      notify("Stock updated.");
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Could not update stock.",
        "error",
      );
    }
  }

  if (data.length === 0) {
    return (
      <PageState type="empty">
        Product variants appear here once created.
      </PageState>
    );
  }

  return (
    <div className="panel table-wrap">
      <table>
        <thead>
          <tr>
            <th>Variant</th>
            <th>SKU</th>
            <th>In stock</th>
            <th>Price</th>
            <th>State</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.uuid}>
              <td>
                <b>{item.product_name}</b>
                <small>
                  {item.color} · {item.size}
                </small>
              </td>

              <td>{item.sku}</td>

              <td
                className={
                  item.quantity === 0
                    ? "danger-text"
                    : undefined
                }
              >
                {item.quantity}
              </td>

              <td>{money(item.price)}</td>

              <td>
                <Badge>
                  {item.is_active ? "ACTIVE" : "INACTIVE"}
                </Badge>
              </td>

              <td>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => void adjust(item)}
                >
                  Add stock
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Wallet                                                                     */
/* -------------------------------------------------------------------------- */

type WalletData = {
  balance: number;
  total_earned: number;
  total_withdrawn: number;
};

type WalletTransaction = {
  uuid: string;
  reference: string;
  type: string;
  status: string;
  amount: number;
  description: string;
  created_at: string;
};

function Wallet() {
  const wallet = useLoad<WalletData>("/wallet/summary");

  const transactions = useLoad<WalletTransaction[]>(
    "/wallet/transactions",
  );

  if (wallet.error || transactions.error) {
    return (
      <PageState type="error">
        {wallet.error || transactions.error}
      </PageState>
    );
  }

  if (!wallet.data || !transactions.data) {
    return <PageState type="loading" />;
  }

  return (
    <>
      <section className="wallet-hero">
        <p>Available balance</p>

        <strong>{money(wallet.data.balance)}</strong>

        <div>
          <span>
            Total earned{" "}
            <b>{money(wallet.data.total_earned)}</b>
          </span>

          <span>
            Total withdrawn{" "}
            <b>{money(wallet.data.total_withdrawn)}</b>
          </span>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Transaction history</h2>
        </div>

        {transactions.data.length === 0 ? (
          <PageState type="empty">
            Your sales and payout movements will be listed here.
          </PageState>
        ) : (
          <div className="transaction-list">
            {transactions.data.map((transaction) => {
              const credit =
                transaction.type.toUpperCase() === "CREDIT";

              return (
                <p key={transaction.uuid}>
                  <span
                    className={credit ? "tx-credit" : "tx-debit"}
                  >
                    {credit ? "↓" : "↑"}
                  </span>

                  <span>
                    <b>{transaction.description}</b>

                    <small>
                      {transaction.reference} ·{" "}
                      {dateTime(transaction.created_at)}
                    </small>
                  </span>

                  <span>
                    <b>
                      {credit ? "+" : "-"}
                      {money(transaction.amount)}
                    </b>

                    <small>
                      <Badge>{transaction.status}</Badge>
                    </small>
                  </span>
                </p>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Withdrawals                                                                */
/* -------------------------------------------------------------------------- */

type Withdrawal = {
  uuid: string;
  amount: number;
  reference: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  narration: string;
  status: string;
  created_at: string;
};

function Withdrawals({
  notify,
}: {
  notify: (
    message: string,
    type?: "success" | "error",
  ) => void;
}) {
  const { data, error, load } =
    useLoad<Withdrawal[]>("/withdrawals");

  const [open, setOpen] = useState(false);

  if (error) {
    return <PageState type="error">{error}</PageState>;
  }

  if (!data) {
    return <PageState type="loading" />;
  }

  return (
    <>
      <div className="toolbar">
        <p className="muted">
          Withdraw available earnings to your bank account.
        </p>

        <button
          type="button"
          className="button primary"
          onClick={() => setOpen(true)}
        >
          Request withdrawal
        </button>
      </div>

      <div className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Destination</th>
              <th>Amount</th>
              <th>Requested</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {data.map((withdrawal) => (
              <tr key={withdrawal.uuid}>
                <td>{withdrawal.reference}</td>

                <td>
                  <b>{withdrawal.bank_name}</b>
                  <small>
                    {withdrawal.account_number} ·{" "}
                    {withdrawal.account_name}
                  </small>
                </td>

                <td>{money(withdrawal.amount)}</td>

                <td>{dateTime(withdrawal.created_at)}</td>

                <td>
                  <Badge>{withdrawal.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <PageState type="empty">
            No withdrawal requests yet.
          </PageState>
        )}
      </div>

      {open && (
        <WithdrawalForm
          close={() => setOpen(false)}
          done={() => {
            setOpen(false);
            void load();
            notify("Withdrawal request submitted.");
          }}
          notify={notify}
        />
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Withdrawal form                                                            */
/* -------------------------------------------------------------------------- */

function WithdrawalForm({
  close,
  done,
  notify,
}: {
  close: () => void;
  done: () => void;
  notify: (
    message: string,
    type?: "success" | "error",
  ) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (busy) return;

    const form = new FormData(event.currentTarget);
    const amount = Number(form.get("amount"));
    const bankName = String(form.get("bank_name") ?? "").trim();
    const accountName = String(form.get("account_name") ?? "").trim();
    const accountNumber = String(
      form.get("account_number") ?? "",
    ).trim();

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !bankName ||
      !accountName ||
      !accountNumber
    ) {
      notify("Please complete all required fields.", "error");
      return;
    }

    setBusy(true);

    try {
      await api("/withdrawals", {
        method: "POST",
        body: JSON.stringify({
          amount,
          bank_name: bankName,
          account_name: accountName,
          account_number: accountNumber,
          narration: String(form.get("narration") ?? "").trim() || null,
        }),
      });

      done();
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Could not submit withdrawal.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Request withdrawal" onClose={close}>
      <form onSubmit={submit} className="form-grid">
        <label>
          Amount (₦)
          <input
            name="amount"
            type="number"
            min="1"
            step="0.01"
            required
          />
        </label>

        <label>
          Bank name
          <input name="bank_name" required />
        </label>

        <label>
          Account name
          <input name="account_name" required />
        </label>

        <label>
          Account number
          <input
            name="account_number"
            inputMode="numeric"
            pattern="[0-9]{10}"
            minLength={10}
            maxLength={10}
            required
          />
        </label>

        <label className="full">
          Narration (optional)
          <input name="narration" />
        </label>

        <div className="modal-actions full">
          <button
            type="button"
            className="button ghost"
            onClick={close}
            disabled={busy}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="button primary"
            disabled={busy}
          >
            {busy ? "Submitting…" : "Request payout"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* Bank accounts                                                              */
/* -------------------------------------------------------------------------- */

type BankAccount = {
  uuid: string;
  bank_code: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  is_default: boolean;
  is_verified: boolean;
  created_at: string;
};

type BankOption = {
  name: string;
  code: string;
};

type ResolvedBankAccount = {
  account_name: string;
  bank_name: string;
  account_number: string;
  bank_code: string;
};

function Banks({
  notify,
}: {
  notify: (
    message: string,
    type?: "success" | "error",
  ) => void;
}) {
  const { data, error, load } =
    useLoad<BankAccount[]>("/bank-accounts");

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const [banks, setBanks] = useState<BankOption[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [banksError, setBanksError] = useState("");

  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedAccount, setResolvedAccount] =
    useState<ResolvedBankAccount | null>(null);

  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const selectedBank = banks.find(
    (bank) => bank.code === bankCode,
  );

  const resetForm = () => {
    setBankCode("");
    setAccountNumber("");
    setResolvedAccount(null);
    setVerificationError("");
    setBanksError("");
  };

  const loadBanks = useCallback(async () => {
    setBanksLoading(true);
    setBanksError("");

    try {
      const result = await api<unknown>(
        "/bank-accounts/banks",
      );

      // The backend currently returns a list of {name, code}.
      // Also tolerate common wrapped API response formats.
      let records: unknown = result;

      if (records && typeof records === "object") {
        const wrapped = records as Record<string, unknown>;

        if (Array.isArray(wrapped.data)) {
          records = wrapped.data;
        } else if (Array.isArray(wrapped.responseBody)) {
          records = wrapped.responseBody;
        } else if (Array.isArray(wrapped.banks)) {
          records = wrapped.banks;
        }
      }

      if (!Array.isArray(records)) {
        throw new Error(
          "The bank service returned an unexpected response.",
        );
      }

      const normalized: BankOption[] = records
        .filter(
          (item): item is Record<string, unknown> =>
            Boolean(item) &&
            typeof item === "object",
        )
        .map((item) => ({
          name: String(item.name ?? "").trim(),
          code: String(item.code ?? "").trim(),
        }))
        .filter((bank) => bank.name && bank.code)
        .sort((a, b) => a.name.localeCompare(b.name));

      if (normalized.length === 0) {
        throw new Error(
          "No banks are currently available. Please try again.",
        );
      }

      setBanks(normalized);
    } catch (error) {
      setBanks([]);
      setBanksError(
        error instanceof Error
          ? error.message
          : "Unable to load banks from Monnify.",
      );
    } finally {
      setBanksLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && banks.length === 0 && !banksLoading) {
      void loadBanks();
    }
  }, [open, banks.length, banksLoading, loadBanks]);

  function changeBank(value: string) {
    setBankCode(value);
    setResolvedAccount(null);
    setVerificationError("");
  }

  function changeAccountNumber(value: string) {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);

    setAccountNumber(digitsOnly);
    setResolvedAccount(null);
    setVerificationError("");
  }

  async function verifyAccount() {
    if (verifying || busy) return;

    if (!bankCode) {
      setVerificationError("Please select your bank.");
      return;
    }

    if (!/^\d{10}$/.test(accountNumber)) {
      setVerificationError(
        "Enter a valid 10-digit Nigerian account number.",
      );
      return;
    }

    setVerifying(true);
    setVerificationError("");
    setResolvedAccount(null);

    try {
      const result = await api<ResolvedBankAccount>(
        "/bank-accounts/resolve",
        {
          method: "POST",
          body: JSON.stringify({
            bank_code: bankCode,
            account_number: accountNumber,
          }),
        },
      );

      if (
        !result ||
        typeof result.account_name !== "string" ||
        !result.account_name.trim() ||
        result.account_number !== accountNumber ||
        result.bank_code !== bankCode
      ) {
        throw new Error(
          "We could not confirm the account details. Please try again.",
        );
      }

      setResolvedAccount({
        account_name: result.account_name.trim(),
        bank_name: result.bank_name || selectedBank?.name || "",
        account_number: result.account_number,
        bank_code: result.bank_code,
      });
    } catch (error) {
      setVerificationError(
        error instanceof Error
          ? error.message
          : "Account verification failed. Please check your details.",
      );
    } finally {
      setVerifying(false);
    }
  }

  async function addAccount(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (busy) return;

    if (!resolvedAccount) {
      setVerificationError(
        "Verify your account before saving it.",
      );
      return;
    }

    setBusy(true);

    try {
      // The backend verifies the account again before saving.
      await api("/bank-accounts", {
        method: "POST",
        body: JSON.stringify({
          bank_code: resolvedAccount.bank_code,
          account_number: resolvedAccount.account_number,
        }),
      });

      await load();

      setOpen(false);
      resetForm();

      notify("Verified bank account added successfully.");
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Could not save the bank account.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  }

  async function makeDefault(id: string) {
    try {
      await api(`/bank-accounts/${id}/default`, {
        method: "PATCH",
      });

      await load();
      notify("Default account updated.");
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Could not update account.",
        "error",
      );
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this bank account?")) {
      return;
    }

    try {
      await api(`/bank-accounts/${id}`, {
        method: "DELETE",
      });

      await load();
      notify("Bank account removed.");
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Could not remove account.",
        "error",
      );
    }
  }

  if (error) {
    return <PageState type="error">{error}</PageState>;
  }

  if (!data) {
    return <PageState type="loading" />;
  }

  return (
    <>
      <div className="toolbar">
        <p className="muted">
          Manage your verified bank accounts for vendor payouts.
        </p>

        <button
          type="button"
          className="button primary"
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
        >
          + Add account
        </button>
      </div>

      {data.length === 0 ? (
        <PageState type="empty">
          Add a bank account to prepare for vendor payouts.
        </PageState>
      ) : (
        <div className="bank-grid">
          {data.map((bank) => (
            <article className="bank-card" key={bank.uuid}>
              <div>
                <p className="eyebrow">
                  {bank.is_default
                    ? "DEFAULT ACCOUNT"
                    : "BANK ACCOUNT"}
                </p>

                <h3>{bank.bank_name}</h3>
                <p>{bank.account_number}</p>
                <b>{bank.account_name}</b>

                <p>
                  <Badge>
                    {bank.is_verified ? "VERIFIED" : "UNVERIFIED"}
                  </Badge>
                </p>
              </div>

              <div className="card-actions">
                {!bank.is_default && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => void makeDefault(bank.uuid)}
                  >
                    Make default
                  </button>
                )}

                <button
                  type="button"
                  className="danger-text"
                  onClick={() => void remove(bank.uuid)}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {open && (
        <Modal
          title="Add bank account"
          onClose={() => {
            if (!busy && !verifying) {
              setOpen(false);
              resetForm();
            }
          }}
        >
          <form className="form-grid" onSubmit={addAccount}>
            <label className="full">
              Bank name
              <select
                value={bankCode}
                onChange={(event) => changeBank(event.target.value)}
                required
                disabled={banksLoading || verifying || busy}
              >
                <option value="">
                  {banksLoading
                    ? "Loading banks..."
                    : "Select your bank"}
                </option>

                {banks.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </label>

            {banksError && (
              <div className="notice error-notice full">
                <p>{banksError}</p>

                <button
                  type="button"
                  className="button ghost"
                  onClick={() => void loadBanks()}
                  disabled={banksLoading}
                >
                  {banksLoading ? "Loading..." : "Retry loading banks"}
                </button>
              </div>
            )}

            <label className="full">
              Account number
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={accountNumber}
                onChange={(event) =>
                  changeAccountNumber(event.target.value)
                }
                placeholder="Enter your 10-digit account number"
                pattern="[0-9]{10}"
                minLength={10}
                maxLength={10}
                required
                disabled={verifying || busy}
              />
              <small className="muted">
                Enter the account number linked to your selected bank.
              </small>
            </label>

            <div className="full">
              <button
                type="button"
                className="button ghost"
                onClick={() => void verifyAccount()}
                disabled={
                  banksLoading ||
                  Boolean(banksError) ||
                  !bankCode ||
                  !/^\d{10}$/.test(accountNumber) ||
                  verifying ||
                  busy
                }
              >
                {verifying
                  ? "Verifying account..."
                  : "Verify account"}
              </button>
            </div>

            {verificationError && (
              <div className="notice error-notice full" role="alert">
                {verificationError}
              </div>
            )}

            {resolvedAccount && (
              <div className="notice full">
                <strong>Account verified</strong>

                <div className="metric-list">
                  <p>
                    Bank
                    <b>{resolvedAccount.bank_name}</b>
                  </p>

                  <p>
                    Account name
                    <b>{resolvedAccount.account_name}</b>
                  </p>

                  <p>
                    Account number
                    <b>{resolvedAccount.account_number}</b>
                  </p>
                </div>

                <small>
                  Confirm that the bank and account name belong to you
                  before saving this account.
                </small>
              </div>
            )}

            <div className="modal-actions full">
              <button
                type="button"
                className="button ghost"
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
                disabled={busy || verifying}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="button primary"
                disabled={
                  busy ||
                  verifying ||
                  !resolvedAccount ||
                  Boolean(banksError)
                }
              >
                {busy ? "Saving account..." : "Save bank account"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Notifications                                                              */
/* -------------------------------------------------------------------------- */

type NotificationItem = {
  uuid: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

function Notifications({
  notify,
}: {
  notify: (
    message: string,
    type?: "success" | "error",
  ) => void;
}) {
  const { data, error, load } =
    useLoad<NotificationItem[]>("/notifications");

  const [busy, setBusy] = useState(false);

  if (error) {
    return <PageState type="error">{error}</PageState>;
  }

  if (!data) {
    return <PageState type="loading" />;
  }

  async function markAllRead() {
    if (busy || !data || data.every((item) => item.is_read)) {
      return;
    }

    setBusy(true);

    try {
      await api("/notifications/read-all", {
        method: "PATCH",
      });

      await load();
      notify("All notifications marked as read.");
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Could not update notifications.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  }

  async function markRead(notification: NotificationItem) {
    if (notification.is_read || busy) {
      return;
    }

    setBusy(true);

    try {
      await api(
        `/notifications/${notification.uuid}/read`,
        {
          method: "PATCH",
        },
      );

      await load();
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Could not mark notification as read.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="toolbar">
        <p className="muted">
          Updates relevant to your seller account.
        </p>

        <button
          type="button"
          className="button ghost"
          onClick={() => void markAllRead()}
          disabled={
            busy ||
            data.length === 0 ||
            data.every((item) => item.is_read)
          }
        >
          {busy ? "Updating…" : "Mark all read"}
        </button>
      </div>

      <section className="panel notification-list">
        {data.length === 0 ? (
          <PageState type="empty">
            You're all caught up.
          </PageState>
        ) : (
          data.map((notification) => (
            <button
              type="button"
              key={notification.uuid}
              className={
                notification.is_read
                  ? "notification"
                  : "notification unread"
              }
              onClick={() => void markRead(notification)}
              disabled={busy}
              aria-label={
                `${notification.title}. ${
                  notification.is_read
                    ? "Already read"
                    : "Mark as read"
                }`
              }
            >
              <span className="notification-dot" />

              <span>
                <b>{notification.title}</b>

                <p>{notification.message}</p>

                <small>
                  {notification.type} ·{" "}
                  {dateTime(notification.created_at)}
                </small>
              </span>
            </button>
          ))
        )}
      </section>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Settings                                                                   */
/* -------------------------------------------------------------------------- */

function Settings({
  user,
  notify,
}: {
  user: User;
  notify: (
    message: string,
    type?: "success" | "error",
  ) => void;
}) {
  const [profile, setProfile] = useState(user);
  const [saving, setSaving] = useState(false);

  async function save(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (saving) return;

    const form = new FormData(event.currentTarget);

    setSaving(true);

    try {
      const updated = await api<User>("/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          first_name: String(form.get("first_name") ?? "").trim(),
          last_name: String(form.get("last_name") ?? "").trim(),
          username: String(form.get("username") ?? "").trim(),
          phone: String(form.get("phone") ?? "").trim(),
        }),
      });

      setProfile(updated);
      notify("Profile saved.");
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Could not save profile.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="settings-grid">
      <section className="panel">
        <div className="panel-heading">
          <h2>Business profile</h2>
        </div>

        <form className="form-grid" onSubmit={save}>
          <label>
            First name
            <input
              name="first_name"
              defaultValue={profile.first_name ?? ""}
              required
            />
          </label>

          <label>
            Last name
            <input
              name="last_name"
              defaultValue={profile.last_name ?? ""}
              required
            />
          </label>

          <label>
            Username
            <input
              name="username"
              defaultValue={profile.username ?? ""}
              required
            />
          </label>

          <label>
            Phone
            <input
              name="phone"
              defaultValue={profile.phone ?? ""}
              required
            />
          </label>

          <label className="full">
            Email
            <input
              value={profile.email}
              disabled
              readOnly
            />
            <small>
              Email changes are not supported by the current API.
            </small>
          </label>

          <div className="full">
            <button
              type="submit"
              className="button primary"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>
      </section>

      <Password notify={notify} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Password                                                                   */
/* -------------------------------------------------------------------------- */

function Password({
  notify,
}: {
  notify: (
    message: string,
    type?: "success" | "error",
  ) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function changePassword(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (busy) return;

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const currentPassword = String(form.get("current") ?? "");
    const newPassword = String(form.get("next") ?? "");

    if (newPassword.length < 8) {
      notify(
        "The new password must be at least 8 characters.",
        "error",
      );
      return;
    }

    if (currentPassword === newPassword) {
      notify(
        "Your new password must differ from your current password.",
        "error",
      );
      return;
    }

    setBusy(true);

    try {
      await api("/users/change-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      formElement.reset();
      notify("Password updated.");
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Could not update password.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Change password</h2>
      </div>

      <form
        className="form-grid"
        onSubmit={changePassword}
      >
        <label className="full">
          Current password
          <input
            name="current"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>

        <label className="full">
          New password
          <input
            name="next"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        <div className="full">
          <button
            type="submit"
            className="button ghost"
            disabled={busy}
          >
            {busy ? "Updating…" : "Update password"}
          </button>
        </div>
      </form>
    </section>
  );
}
