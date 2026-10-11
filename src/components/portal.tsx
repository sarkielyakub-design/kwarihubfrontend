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

const nav: {
  id: View;
  label: string;
  icon: string;
}[] = [
  {
    id: "dashboard",
    label: "Overview",
    icon: "◫",
  },
  {
    id: "products",
    label: "Products",
    icon: "□",
  },
  {
    id: "orders",
    label: "Orders",
    icon: "▣",
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: "▤",
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: "◒",
  },
  {
    id: "withdrawals",
    label: "Withdrawals",
    icon: "↗",
  },
  {
    id: "banks",
    label: "Bank accounts",
    icon: "▧",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: "♧",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "⚙",
  },
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
    setToast({
      message,
      type,
    });

    window.setTimeout(() => {
      setToast(null);
    }, 3500);
  };

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
            <Settings
              user={user}
              notify={notify}
            />
          )}
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

  return {
    data,
    error,
    load,
  };
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
    return (
      <PageState type="error">
        {error}
      </PageState>
    );
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
          <p className="eyebrow">
            YOUR STORE AT A GLANCE
          </p>

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
          <article
            className="stat-card"
            key={stat.name}
          >
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
              Pending
              <b>{data.pending_orders}</b>
            </span>

            <span>
              Processing
              <b>{data.processing_orders}</b>
            </span>

            <span>
              Shipped
              <b>{data.shipped_orders}</b>
            </span>

            <span>
              Delivered
              <b>{data.delivered_orders}</b>
            </span>
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h2>Customers &amp; quality</h2>
          </div>

          <div className="metric-list">
            <p>
              Customers
              <b>{data.total_customers}</b>
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
  const {
    data,
    error,
    load,
  } = useLoad<Product[]>("/products/my-products");

  const [editor, setEditor] =
    useState<Product | null | undefined>();

  const [details, setDetails] =
    useState<Product | null>(null);

  async function remove(product: Product) {
    const confirmed = window.confirm(
      `Delete ${product.name}?`,
    );

    if (!confirmed) {
      return;
    }

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
    return (
      <PageState type="error">
        {error}
      </PageState>
    );
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
                      product.discount_price ??
                        product.price,
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
                      onClick={() =>
                        setDetails(product)
                      }
                    >
                      Manage
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setEditor(product)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="danger-text"
                      onClick={() =>
                        void remove(product)
                      }
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
              editor
                ? "Product updated."
                : "Product created.",
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

const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_PRODUCT_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

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
  type CategoryResponse =
    | Category[]
    | {
        data?: unknown;
        items?: unknown;
        results?: unknown;
        categories?: unknown;
      };

  function normalizeCategories(
    value: CategoryResponse | null,
  ): Category[] {
    if (Array.isArray(value)) {
      return value;
    }

    if (!value || typeof value !== "object") {
      return [];
    }

    const record = value as Record<string, unknown>;

    for (const key of [
      "data",
      "items",
      "results",
      "categories",
    ]) {
      const candidate = record[key];

      if (Array.isArray(candidate)) {
        return candidate as Category[];
      }

      if (
        candidate &&
        typeof candidate === "object"
      ) {
        const nested = normalizeCategories(
          candidate as CategoryResponse,
        );

        if (nested.length > 0) {
          return nested;
        }
      }
    }

    return [];
  }

  const {
    data: categoriesResponse,
    error: categoriesError,
  } = useLoad<CategoryResponse>("/categories");

  const categories = normalizeCategories(
    categoriesResponse,
  );

  const [busy, setBusy] = useState(false);

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  const [variants, setVariants] =
    useState<DraftVariant[]>([]);

  const [showVariants, setShowVariants] =
    useState(true);

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

    if (
      !ALLOWED_PRODUCT_IMAGE_TYPES.includes(
        file.type,
      )
    ) {
      notify(
        "Only JPG, PNG, and WEBP images are allowed.",
        "error",
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
      notify(
        "Product image must be 5MB or smaller.",
        "error",
      );

      event.target.value = "";
      return;
    }

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setImageFile(file);
    setImagePreview(previewUrl);
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
          ? {
              ...variant,
              [field]: value,
            }
          : variant,
      ),
    );
  }

  function removeVariant(id: string) {
    setVariants((current) =>
      current.filter(
        (variant) => variant.id !== id,
      ),
    );
  }

  async function uploadImage(
    productUuid: string,
  ) {
    if (!imageFile) {
      return;
    }

    const uploadData = new FormData();

    uploadData.append("image", imageFile);

    await api(
      `/products/${productUuid}/images`,
      {
        method: "POST",
        body: uploadData,
      },
    );
  }

  async function createVariants(
    productUuid: string,
  ) {
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

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        throw new Error(
          `Invalid price for variant "${color} ${size}".`,
        );
      }

      if (
        !Number.isInteger(quantity) ||
        quantity < 0
      ) {
        throw new Error(
          `Invalid quantity for variant "${color} ${size}".`,
        );
      }

      await api(
        `/products/${productUuid}/variants`,
        {
          method: "POST",
          body: JSON.stringify({
            color,
            size,
            material,
            price,
            quantity,
          }),
        },
      );
    }
  }

  async function save(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (busy) {
      return;
    }

    setBusy(true);

    const form = new FormData(
      event.currentTarget,
    );

    const categoryValue = String(
      form.get("category_id") ?? "",
    );

    const categoryId = Number(categoryValue);

    if (
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      notify(
        "Please select a valid product category.",
        "error",
      );

      setBusy(false);
      return;
    }

    const name = String(
      form.get("name") ?? "",
    ).trim();

    const description = String(
      form.get("description") ?? "",
    ).trim();

    const price = Number(
      form.get("price"),
    );

    const quantity = Number(
      form.get("quantity"),
    );

    const discountValue = String(
      form.get("discount_price") ?? "",
    ).trim();

    const discountPrice =
      discountValue !== ""
        ? Number(discountValue)
        : null;

    const unit = String(
      form.get("unit") ?? "",
    ).trim();

    const brand = String(
      form.get("brand") ?? "",
    ).trim();

    const origin = String(
      form.get("origin") ?? "",
    ).trim();

    const isFeatured =
      form.get("is_featured") === "on";

    if (!name || name.length < 3) {
      notify(
        "Product name must contain at least 3 characters.",
        "error",
      );

      setBusy(false);
      return;
    }

    if (
      !description ||
      description.length < 10
    ) {
      notify(
        "Product description must contain at least 10 characters.",
        "error",
      );

      setBusy(false);
      return;
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      notify(
        "Please enter a valid product price.",
        "error",
      );

      setBusy(false);
      return;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      notify(
        "Please enter a valid product quantity.",
        "error",
      );

      setBusy(false);
      return;
    }

    if (
      discountPrice !== null &&
      (!Number.isFinite(discountPrice) ||
        discountPrice < 0)
    ) {
      notify(
        "Please enter a valid discount price.",
        "error",
      );

      setBusy(false);
      return;
    }

    if (
      discountPrice !== null &&
      discountPrice > price
    ) {
      notify(
        "Discount price cannot be greater than the original price.",
        "error",
      );

      setBusy(false);
      return;
    }

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
      /*
       * ----------------------------------------------------------------------
       * UPDATE EXISTING PRODUCT
       * ----------------------------------------------------------------------
       */

      if (product) {
        await api(
          `/products/${product.uuid}`,
          {
            method: "PATCH",
            body: JSON.stringify(body),
          },
        );

        /*
         * If a new image was selected while editing,
         * upload it using the existing image endpoint.
         */
        if (imageFile) {
          await uploadImage(product.uuid);
        }

        /*
         * Variants entered while editing are created
         * using the existing variant endpoint.
         */
        if (variants.length > 0) {
          await createVariants(product.uuid);
        }

        onDone();

        return;
      }

      /*
       * ----------------------------------------------------------------------
       * CREATE NEW PRODUCT
       * ----------------------------------------------------------------------
       */

      const createdProduct =
        await api<Product>(
          "/products",
          {
            method: "POST",
            body: JSON.stringify(body),
          },
        );

      /*
       * Product must exist before an image can be
       * attached because the image endpoint requires
       * the product UUID.
       */
      if (imageFile) {
        await uploadImage(
          createdProduct.uuid,
        );
      }

      /*
       * Create all variants after the product has
       * been created.
       */
      if (variants.length > 0) {
        await createVariants(
          createdProduct.uuid,
        );
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

  /*
   * --------------------------------------------------------------------------
   * CATEGORY LOADING STATE
   * --------------------------------------------------------------------------
   */

  if (categoriesError) {
    return (
      <Modal
        title={
          product
            ? "Edit product"
            : "Add a product"
        }
        onClose={onClose}
      >
        <PageState type="error">
          Unable to load product categories.
          <br />
          <small>
            {categoriesError}
          </small>
        </PageState>
      </Modal>
    );
  }

  return (
    <Modal
      title={
        product
          ? "Edit product"
          : "Add a product"
      }
      onClose={onClose}
    >
      <form
        className="form-grid"
        onSubmit={save}
      >
        {/* ---------------------------------------------------------------- */}
        {/* PRODUCT NAME                                                     */}
        {/* ---------------------------------------------------------------- */}

        <label>
          Product name

          <input
            name="name"
            defaultValue={product?.name}
            required
            minLength={3}
            maxLength={255}
            placeholder="e.g. Premium Ankara Fabric"
          />
        </label>

        {/* ---------------------------------------------------------------- */}
        {/* CATEGORY                                                         */}
        {/* ---------------------------------------------------------------- */}

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
            disabled={categories.length === 0}
          >
            <option value="">
              {categories
                ? "Select a category"
                : "Loading categories..."}
            </option>

            {categories
              .filter(
                (category) =>
                  category.is_active,
              )
              .sort(
                (a, b) =>
                  a.sort_order -
                  b.sort_order ||
                  a.name.localeCompare(
                    b.name,
                  ),
              )
              .map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
          </select>
        </label>

        {/* ---------------------------------------------------------------- */}
        {/* DESCRIPTION                                                      */}
        {/* ---------------------------------------------------------------- */}

        <label className="full">
          Description

          <textarea
            name="description"
            defaultValue={
              product?.description ?? ""
            }
            required
            minLength={10}
            rows={5}
            placeholder="Describe the product..."
          />
        </label>

        {/* ---------------------------------------------------------------- */}
        {/* PRICE                                                            */}
        {/* ---------------------------------------------------------------- */}

        <label>
          Price (₦)

          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={
              product?.price ?? ""
            }
            required
          />
        </label>

        {/* ---------------------------------------------------------------- */}
        {/* DISCOUNT                                                         */}
        {/* ---------------------------------------------------------------- */}

        <label>
          Discount price (₦)

          <input
            name="discount_price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={
              product?.discount_price ?? ""
            }
            placeholder="Optional"
          />
        </label>

        {/* ---------------------------------------------------------------- */}
        {/* QUANTITY                                                         */}
        {/* ---------------------------------------------------------------- */}

        <label>
          Quantity

          <input
            name="quantity"
            type="number"
            min="0"
            step="1"
            defaultValue={
              product?.quantity ?? 0
            }
            required
          />
        </label>

        {/* ---------------------------------------------------------------- */}
        {/* UNIT                                                             */}
        {/* ---------------------------------------------------------------- */}

        <label>
          Unit

          <input
            name="unit"
            defaultValue={
              product?.unit ?? ""
            }
            required
            placeholder="yard, piece, roll"
          />
        </label>

        {/* ---------------------------------------------------------------- */}
        {/* BRAND                                                            */}
        {/* ---------------------------------------------------------------- */}

        <label>
          Brand

          <input
            name="brand"
            defaultValue={
              product?.brand ?? ""
            }
            placeholder="Optional"
          />
        </label>

        {/* ---------------------------------------------------------------- */}
        {/* ORIGIN                                                           */}
        {/* ---------------------------------------------------------------- */}

        <label>
          Origin

          <input
            name="origin"
            defaultValue={
              product?.origin ?? ""
            }
            placeholder="Optional"
          />
        </label>

        {/* ---------------------------------------------------------------- */}
        {/* PRODUCT IMAGE                                                    */}
        {/* ---------------------------------------------------------------- */}

        <div className="full">
          <label>
            Product image
          </label>

          <div
            style={{
              display: "grid",
              gap: "12px",
            }}
          >
            {imagePreview && (
              <div
                style={{
                  width: "180px",
                  height: "180px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border:
                    "1px solid rgba(0,0,0,.1)",
                  background: "#f5f5f5",
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
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* VARIANTS                                                         */}
        {/* ---------------------------------------------------------------- */}

        <div className="full detail-section">
          <div className="panel-heading">
            <div>
              <h3>Product variants</h3>

              <p className="muted">
                Add colour, size, material, price
                and stock variations for this
                product.
              </p>
            </div>

            <button
              type="button"
              className="button ghost small-button"
              onClick={() =>
                setShowVariants(
                  (current) => !current,
                )
              }
            >
              {showVariants
                ? "Hide"
                : "Show"}
            </button>
          </div>

          {showVariants && (
            <>
              {variants.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                    marginTop: "12px",
                  }}
                >
                  {variants.map(
                    (variant, index) => (
                      <div
                        key={variant.id}
                        className="panel"
                        style={{
                          padding: "16px",
                        }}
                      >
                        <div
                          className="panel-heading"
                        >
                          <strong>
                            Variant{" "}
                            {index + 1}
                          </strong>

                          <button
                            type="button"
                            className="danger-text"
                            onClick={() =>
                              removeVariant(
                                variant.id,
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>

                        <div className="form-grid compact">
                          <label>
                            Colour

                            <input
                              value={
                                variant.color
                              }
                              onChange={(event) =>
                                updateVariant(
                                  variant.id,
                                  "color",
                                  event.target
                                    .value,
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
                              value={
                                variant.size
                              }
                              onChange={(event) =>
                                updateVariant(
                                  variant.id,
                                  "size",
                                  event.target
                                    .value,
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
                              value={
                                variant.material
                              }
                              onChange={(event) =>
                                updateVariant(
                                  variant.id,
                                  "material",
                                  event.target
                                    .value,
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
                              value={
                                variant.price
                              }
                              onChange={(event) =>
                                updateVariant(
                                  variant.id,
                                  "price",
                                  event.target
                                    .value,
                                )
                              }
                              type="number"
                              min="0"
                              step="0.01"
                              required
                              placeholder="0.00"
                            />
                          </label>

                          <label>
                            Quantity

                            <input
                              value={
                                variant.quantity
                              }
                              onChange={(event) =>
                                updateVariant(
                                  variant.id,
                                  "quantity",
                                  event.target
                                    .value,
                                )
                              }
                              type="number"
                              min="0"
                              step="1"
                              required
                              placeholder="0"
                            />
                          </label>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}

              <button
                type="button"
                className="button ghost"
                onClick={addVariantRow}
                style={{
                  marginTop: "12px",
                }}
              >
                + Add variant
              </button>
            </>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* FEATURED                                                         */}
        {/* ---------------------------------------------------------------- */}

        <label className="check full">
          <input
            name="is_featured"
            type="checkbox"
            defaultChecked={
              product?.is_featured ?? false
            }
          />

          Feature this product
        </label>

        {/* ---------------------------------------------------------------- */}
        {/* ACTIONS                                                          */}
        {/* ---------------------------------------------------------------- */}

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
            disabled={
              busy ||
              categories.length === 0
            }
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
    load: loadVariants,
  } = useLoad<Variant[]>(
    `/products/${product.uuid}/variants`,
  );

  const {
    data: images,
    load: loadImages,
  } = useLoad<ImageAsset[]>(
    `/products/${product.uuid}/images`,
  );

  const [adding, setAdding] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  function imageUrl(
    image: string,
  ): string {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("blob:")
    ) {
      return image;
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace(
        /\/$/,
        "",
      ) ?? "";

    /*
     * Backend currently stores paths similar to:
     *
     * storage/products/filename.jpg
     *
     * or:
     *
     * /storage/products/filename.jpg
     *
     * StaticFiles is mounted at /storage.
     */

    let path = image.replaceAll("\\", "/");

    const storageIndex =
      path.indexOf("/storage/");

    if (storageIndex >= 0) {
      path = path.substring(
        storageIndex,
      );
    } else if (
      path.startsWith("storage/")
    ) {
      path = `/${path}`;
    } else if (
      !path.startsWith("/")
    ) {
      path = `/storage/${path}`;
    }

    return `${apiUrl}${path}`;
  }

  async function upload(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (uploading) {
      return;
    }

    const form = new FormData(
      event.currentTarget,
    );

    const file = form.get("image");

    if (
      !(file instanceof File) ||
      file.size === 0
    ) {
      notify(
        "Please select an image.",
        "error",
      );

      return;
    }

    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(file.type)
    ) {
      notify(
        "Only JPG, PNG and WEBP images are allowed.",
        "error",
      );

      return;
    }

    if (
      file.size > 5 * 1024 * 1024
    ) {
      notify(
        "Image must be 5MB or smaller.",
        "error",
      );

      return;
    }

    setUploading(true);

    try {
      const uploadData =
        new FormData();

      uploadData.append(
        "image",
        file,
      );

      await api(
        `/products/${product.uuid}/images`,
        {
          method: "POST",
          body: uploadData,
        },
      );

      await loadImages();

      event.currentTarget.reset();

      notify(
        "Image uploaded successfully.",
      );
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

  async function makePrimary(
    image: ImageAsset,
  ) {
    try {
      await api(
        `/products/images/${image.uuid}/primary`,
        {
          method: "PATCH",
        },
      );

      await loadImages();

      notify(
        "Primary image updated.",
      );
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

    const form = new FormData(
      event.currentTarget,
    );

    const color = String(
      form.get("color") ?? "",
    ).trim();

    const size = String(
      form.get("size") ?? "",
    ).trim();

    const material = String(
      form.get("material") ?? "",
    ).trim();

    const price = Number(
      form.get("price"),
    );

    const quantity = Number(
      form.get("quantity"),
    );

    if (!color || !size || !material) {
      notify(
        "Colour, size and material are required.",
        "error",
      );

      return;
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      notify(
        "Please enter a valid variant price.",
        "error",
      );

      return;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      notify(
        "Please enter a valid variant quantity.",
        "error",
      );

      return;
    }

    try {
      await api(
        `/products/${product.uuid}/variants`,
        {
          method: "POST",
          body: JSON.stringify({
            color,
            size,
            material,
            price,
            quantity,
          }),
        },
      );

      setAdding(false);

      event.currentTarget.reset();

      await loadVariants();

      notify("Variant added.");
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Could not add variant.",
        "error",
      );
    }
  }

  return (
    <Modal
      title={product.name}
      onClose={onClose}
    >
      {/* ------------------------------------------------------------------ */}
      {/* PRODUCT SUMMARY                                                    */}
      {/* ------------------------------------------------------------------ */}

      <div className="detail-section">
        <div className="panel-heading">
          <div>
            <h3>Product</h3>

            <p className="muted">
              {product.unit}
              {product.brand
                ? ` · ${product.brand}`
                : ""}
            </p>
          </div>

          <Badge>
            {product.is_active
              ? product.status
              : "INACTIVE"}
          </Badge>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* IMAGES                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="detail-section">
        <div className="panel-heading">
          <div>
            <h3>Product images</h3>

            <p className="muted">
              Upload and manage product images.
            </p>
          </div>
        </div>

        {images &&
        images.length > 0 ? (
          <div className="image-row">
            {images.map((image) => (
              <div
                className="product-image"
                key={image.uuid}
              >
                <img
                  src={imageUrl(
                    image.image,
                  )}
                  alt={product.name}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    void makePrimary(
                      image,
                    )
                  }
                  disabled={
                    image.is_primary
                  }
                >
                  {image.is_primary
                    ? "Primary"
                    : "Make primary"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">
            No images uploaded yet.
          </p>
        )}

        <form
          className="inline-form"
          onSubmit={upload}
        >
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
            {uploading
              ? "Uploading…"
              : "Upload image"}
          </button>
        </form>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* VARIANTS                                                           */}
      {/* ------------------------------------------------------------------ */}

      <div className="detail-section">
        <div className="panel-heading">
          <div>
            <h3>Variants</h3>

            <p className="muted">
              Manage colours, sizes, materials,
              prices and stock.
            </p>
          </div>

          <button
            type="button"
            className="button ghost small-button"
            onClick={() =>
              setAdding(
                (current) => !current,
              )
            }
          >
            {adding
              ? "Cancel"
              : "+ Variant"}
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
              >
                Add variant
              </button>
            </div>
          </form>
        )}

        {!variants ? (
          <PageState type="loading" />
        ) : variants.length === 0 ? (
          <p className="muted">
            No variants yet.
          </p>
        ) : (
          <div className="variant-list">
            {variants.map(
              (variant) => (
                <p
                  key={variant.uuid}
                >
                  <b>
                    {variant.color} ·{" "}
                    {variant.size}
                  </b>

                  <span>
                    {variant.material}
                  </span>

                  <span>
                    {variant.quantity}{" "}
                    in stock
                  </span>

                  <span>
                    {money(
                      variant.price,
                    )}
                  </span>
                </p>
              ),
            )}
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
  } = useLoad<SellerOrder[]>(
    "/seller/orders",
  );

  const [chosen, setChosen] =
    useState<SellerOrder | null>(null);

  if (error) {
    return (
      <PageState type="error">
        {error}
      </PageState>
    );
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
                    <b>
                      #{order.order_number}
                    </b>
                  </td>

                  <td>{order.buyer_name}</td>

                  <td>
                    {order.items.length}
                  </td>

                  <td>
                    {dateTime(
                      order.created_at,
                    )}
                  </td>

                  <td>
                    <Badge>
                      {order.status}
                    </Badge>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() =>
                        setChosen(order)
                      }
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
  const [status, setStatus] =
    useState(order.status);

  const [busy, setBusy] =
    useState(false);

  async function update() {
    setBusy(true);

    try {
      await api(
        `/seller/orders/${order.order_uuid}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
          }),
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
    (sum, item) =>
      sum + Number(item.total_price),
    0,
  );

  return (
    <Modal
      title={`Order #${order.order_number}`}
      onClose={close}
    >
      <p className="muted">
        {order.buyer_name} ·{" "}
        {dateTime(order.created_at)}
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
                {item.variant_name} ×{" "}
                {item.quantity}
              </small>
            </span>

            <b>
              {money(item.total_price)}
            </b>
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
            onChange={(event) =>
              setStatus(event.target.value)
            }
          >
            {[
              "PENDING",
              "PROCESSING",
              "SHIPPED",
              "DELIVERED",
              "CANCELLED",
            ].map((value) => (
              <option
                key={value}
                value={value}
              >
                {value}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="button primary"
          onClick={() => void update()}
          disabled={busy}
        >
          {busy
            ? "Updating…"
            : "Update status"}
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
  } = useLoad<InventoryItem[]>(
    "/inventory",
  );

  if (error) {
    return (
      <PageState type="error">
        {error}
      </PageState>
    );
  }

  if (!data) {
    return <PageState type="loading" />;
  }

  async function adjust(
    item: InventoryItem,
  ) {
    const input = window.prompt(
      `Add stock for ${item.product_name}. Enter quantity:`,
    );

    if (!input) {
      return;
    }

    const quantity = Number(input);

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      notify(
        "Please enter a valid quantity.",
        "error",
      );

      return;
    }

    try {
      await api(
        `/inventory/${item.uuid}/add-stock`,
        {
          method: "POST",
          body: JSON.stringify({
            quantity,
            reason:
              "Seller stock adjustment",
          }),
        },
      );

      notify("Stock updated.");

      await load();
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

              <td>
                {money(item.price)}
              </td>

              <td>
                <Badge>
                  {item.is_active
                    ? "ACTIVE"
                    : "INACTIVE"}
                </Badge>
              </td>

              <td>
                <button
                  type="button"
                  className="text-button"
                  onClick={() =>
                    void adjust(item)
                  }
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
  const wallet =
    useLoad<WalletData>("/wallet/summary");

  const transactions =
    useLoad<WalletTransaction[]>(
      "/wallet/transactions",
    );

  if (wallet.error || transactions.error) {
    return (
      <PageState type="error">
        {wallet.error ||
          transactions.error}
      </PageState>
    );
  }

  if (
    !wallet.data ||
    !transactions.data
  ) {
    return <PageState type="loading" />;
  }

  return (
    <>
      <section className="wallet-hero">
        <p>Available balance</p>

        <strong>
          {money(wallet.data.balance)}
        </strong>

        <div>
          <span>
            Total earned{" "}
            <b>
              {money(
                wallet.data.total_earned,
              )}
            </b>
          </span>

          <span>
            Total withdrawn{" "}
            <b>
              {money(
                wallet.data.total_withdrawn,
              )}
            </b>
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
            {transactions.data.map(
              (transaction) => {
                const credit =
                  transaction.type ===
                  "CREDIT";

                return (
                  <p
                    key={transaction.uuid}
                  >
                    <span
                      className={
                        credit
                          ? "tx-credit"
                          : "tx-debit"
                      }
                    >
                      {credit ? "↓" : "↑"}
                    </span>

                    <span>
                      <b>
                        {
                          transaction.description
                        }
                      </b>

                      <small>
                        {
                          transaction.reference
                        }{" "}
                        ·{" "}
                        {dateTime(
                          transaction.created_at,
                        )}
                      </small>
                    </span>

                    <span>
                      <b>
                        {credit ? "+" : "-"}
                        {money(
                          transaction.amount,
                        )}
                      </b>

                      <small>
                        <Badge>
                          {
                            transaction.status
                          }
                        </Badge>
                      </small>
                    </span>
                  </p>
                );
              },
            )}
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
  const {
    data,
    error,
    load,
  } = useLoad<Withdrawal[]>(
    "/withdrawals",
  );

  const [open, setOpen] =
    useState(false);

  if (error) {
    return (
      <PageState type="error">
        {error}
      </PageState>
    );
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
                <td>
                  {withdrawal.reference}
                </td>

                <td>
                  <b>
                    {withdrawal.bank_name}
                  </b>

                  <small>
                    {
                      withdrawal.account_number
                    }{" "}
                    ·{" "}
                    {
                      withdrawal.account_name
                    }
                  </small>
                </td>

                <td>
                  {money(
                    withdrawal.amount,
                  )}
                </td>

                <td>
                  {dateTime(
                    withdrawal.created_at,
                  )}
                </td>

                <td>
                  <Badge>
                    {withdrawal.status}
                  </Badge>
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
            notify(
              "Withdrawal request submitted.",
            );
          }}
          notify={notify}
        />
      )}
    </>
  );
}

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
  const [busy, setBusy] =
    useState(false);

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setBusy(true);

    const form = new FormData(
      event.currentTarget,
    );

    try {
      await api("/withdrawals", {
        method: "POST",
        body: JSON.stringify({
          amount: Number(
            form.get("amount"),
          ),
          bank_name: String(
            form.get("bank_name") ?? "",
          ),
          account_name: String(
            form.get("account_name") ?? "",
          ),
          account_number: String(
            form.get("account_number") ?? "",
          ),
          narration:
            form.get("narration") || null,
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
    <Modal
      title="Request withdrawal"
      onClose={close}
    >
      <form
        onSubmit={submit}
        className="form-grid"
      >
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

          <input
            name="bank_name"
            required
          />
        </label>

        <label>
          Account name

          <input
            name="account_name"
            required
          />
        </label>

        <label>
          Account number

          <input
            name="account_number"
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
          >
            Cancel
          </button>

          <button
            type="submit"
            className="button primary"
            disabled={busy}
          >
            {busy
              ? "Submitting…"
              : "Request payout"}
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

function Banks({
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
  } = useLoad<BankAccount[]>(
    "/bank-accounts",
  );

  const [open, setOpen] =
    useState(false);

  if (error) {
    return (
      <PageState type="error">
        {error}
      </PageState>
    );
  }

  if (!data) {
    return <PageState type="loading" />;
  }

  async function makeDefault(
    id: string,
  ) {
    try {
      await api(
        `/bank-accounts/${id}/default`,
        {
          method: "PATCH",
        },
      );

      await load();

      notify(
        "Default account updated.",
      );
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
    const confirmed = window.confirm(
      "Remove this bank account?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await api(
        `/bank-accounts/${id}`,
        {
          method: "DELETE",
        },
      );

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

  return (
    <>
      <div className="toolbar">
        <p className="muted">
          Saved accounts for your KwariHub profile.
        </p>

        <button
          type="button"
          className="button primary"
          onClick={() => setOpen(true)}
        >
          + Add account
        </button>
      </div>

      {data.length === 0 ? (
        <PageState type="empty">
          Add a bank account for faster payout setup.
        </PageState>
      ) : (
        <div className="bank-grid">
          {data.map((bank) => (
            <article
              className="bank-card"
              key={bank.uuid}
            >
              <div>
                <p className="eyebrow">
                  {bank.is_default
                    ? "DEFAULT ACCOUNT"
                    : "BANK ACCOUNT"}
                </p>

                <h3>
                  {bank.bank_name}
                </h3>

                <p>
                  {bank.account_number}
                </p>

                <b>
                  {bank.account_name}
                </b>
              </div>

              <div className="card-actions">
                {!bank.is_default && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      void makeDefault(
                        bank.uuid,
                      )
                    }
                  >
                    Make default
                  </button>
                )}

                <button
                  type="button"
                  className="danger-text"
                  onClick={() =>
                    void remove(bank.uuid)
                  }
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
          onClose={() => setOpen(false)}
        >
          <form
            className="form-grid"
            onSubmit={async (event) => {
              event.preventDefault();

              const form =
                new FormData(
                  event.currentTarget,
                );

              try {
                await api("/bank-accounts", {
                  method: "POST",
                  body: JSON.stringify({
                    bank_code: String(
                      form.get(
                        "bank_code",
                      ) ?? "",
                    ),
                    account_number: String(
                      form.get(
                        "account_number",
                      ) ?? "",
                    ),
                  }),
                });

                setOpen(false);

                await load();

                notify(
                  "Bank account added.",
                );
              } catch (error) {
                notify(
                  error instanceof Error
                    ? error.message
                    : "Could not add account.",
                  "error",
                );
              }
            }}
          >
            <label>
              Bank code

              <input
                name="bank_code"
                required
                placeholder="e.g. 058"
              />
            </label>

            <label>
              Account number

              <input
                name="account_number"
                required
              />
            </label>

            <div className="modal-actions full">
              <button
                type="button"
                className="button ghost"
                onClick={() =>
                  setOpen(false)
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="button primary"
              >
                Add account
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
  const {
    data,
    error,
    load,
  } = useLoad<NotificationItem[]>(
    "/notifications",
  );

  if (error) {
    return (
      <PageState type="error">
        {error}
      </PageState>
    );
  }

  if (!data) {
    return <PageState type="loading" />;
  }

  async function markAllRead() {
    try {
      await api(
        "/notifications/read-all",
        {
          method: "PATCH",
        },
      );

      await load();

      notify(
        "All notifications marked as read.",
      );
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Could not update notifications.",
        "error",
      );
    }
  }

  async function markRead(
    notification: NotificationItem,
  ) {
    if (notification.is_read) {
      return;
    }

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
          onClick={() =>
            void markAllRead()
          }
        >
          Mark all read
        </button>
      </div>

      <section className="panel notification-list">
        {data.length === 0 ? (
          <PageState type="empty">
            You&apos;re all caught up.
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
              onClick={() =>
                void markRead(
                  notification,
                )
              }
            >
              <span className="notification-dot" />

              <span>
                <b>
                  {notification.title}
                </b>

                <p>
                  {notification.message}
                </p>

                <small>
                  {notification.type} ·{" "}
                  {dateTime(
                    notification.created_at,
                  )}
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
  const [profile, setProfile] =
    useState(user);

  async function save(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      const form = new FormData(
        event.currentTarget,
      );

      const updated = await api<User>(
        "/users/profile",
        {
          method: "PUT",
          body: JSON.stringify({
            first_name: String(
              form.get("first_name") ?? "",
            ),
            last_name: String(
              form.get("last_name") ?? "",
            ),
            username: String(
              form.get("username") ?? "",
            ),
            phone: String(
              form.get("phone") ?? "",
            ),
          }),
        },
      );

      setProfile(updated);

      notify("Profile saved.");
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Could not save profile.",
        "error",
      );
    }
  }

  return (
    <div className="settings-grid">
      <section className="panel">
        <div className="panel-heading">
          <h2>Business profile</h2>
        </div>

        <form
          className="form-grid"
          onSubmit={save}
        >
          <label>
            First name

            <input
              name="first_name"
              defaultValue={
                profile.first_name
              }
              required
            />
          </label>

          <label>
            Last name

            <input
              name="last_name"
              defaultValue={
                profile.last_name
              }
              required
            />
          </label>

          <label>
            Username

            <input
              name="username"
              defaultValue={
                profile.username
              }
              required
            />
          </label>

          <label>
            Phone

            <input
              name="phone"
              defaultValue={profile.phone}
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
              Email changes are not supported by
              the current API.
            </small>
          </label>

          <div className="full">
            <button
              type="submit"
              className="button primary"
            >
              Save profile
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
  const [busy, setBusy] =
    useState(false);

  async function changePassword(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setBusy(true);

    try {
      const form = new FormData(
        event.currentTarget,
      );

      await api(
        "/users/change-password",
        {
          method: "POST",
          body: JSON.stringify({
            current_password: String(
              form.get("current") ?? "",
            ),
            new_password: String(
              form.get("next") ?? "",
            ),
          }),
        },
      );

      event.currentTarget.reset();

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
            required
            minLength={8}
          />
        </label>

        <label className="full">
          New password

          <input
            name="next"
            type="password"
            required
            minLength={8}
          />
        </label>

        <div className="full">
          <button
            type="submit"
            className="button ghost"
            disabled={busy}
          >
            {busy
              ? "Updating…"
              : "Update password"}
          </button>
        </div>
      </form>
    </section>
  );
}