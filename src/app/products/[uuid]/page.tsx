
"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { API_URL, money, type Product } from "@/lib/api";

type ProductDetail = Product & {
  uuid: string;
  name: string;
  price: number;
  discount_price?: number | null;
  description?: string | null;
  quantity: number;
  unit?: string;
  image?: string;
  image_url?: string;
  images?: {
    image?: string;
    url?: string;
    is_primary?: boolean;
  }[];
  category?: { name?: string } | string;
};

type CartItem = {
  uuid: string;
  name: string;
  price: number;
  quantity: number;
};

function getImage(product: ProductDetail, index = 0): string {
  const images = product.images ?? [];
  const selected =
    images[index] ??
    images.find((item) => item.is_primary) ??
    images[0];

  const raw =
    selected?.image ??
    selected?.url ??
    product.image_url ??
    product.image;

  if (!raw) return "";

  if (/^https?:\/\//i.test(raw)) return raw;

  const origin = API_URL.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
  return `${origin}/${raw.replace(/^\/+/, "")}`;
}

function getCategory(product: ProductDetail): string {
  return typeof product.category === "string"
    ? product.category
    : product.category?.name ?? "TEXTILE PRODUCT";
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = use(params);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/products/${encodeURIComponent(uuid)}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "This product could not be found."
              : `Product details could not be loaded (${response.status}).`,
          );
        }

        const data = (await response.json()) as ProductDetail;
        setProduct(data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "This product is temporarily unavailable.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadProduct();

    return () => controller.abort();
  }, [uuid]);

  function addToCart() {
    if (!product || product.quantity <= 0) return;

    let cart: CartItem[] = [];

    try {
      const saved = localStorage.getItem("kwarihub_guest_cart");
      const parsed: unknown = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed)) cart = parsed as CartItem[];
    } catch {
      cart = [];
    }

    const price = Number(product.discount_price ?? product.price);
    const existing = cart.find((item) => item.uuid === product.uuid);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        uuid: product.uuid,
        name: product.name,
        price,
        quantity,
      });
    }

    localStorage.setItem("kwarihub_guest_cart", JSON.stringify(cart));
    setAdded(true);

    window.setTimeout(() => {
      window.location.href = "/checkout";
    }, 450);
  }

  const galleryImages = product
    ? Array.from(
        new Set(
          [
            ...(product.images ?? []).map((item) => {
              const raw = item.image ?? item.url;
              if (!raw) return "";
              if (/^https?:\/\//i.test(raw)) return raw;

              const origin = API_URL.replace(
                /\/api\/v1\/?$/,
                "",
              ).replace(/\/$/, "");

              return `${origin}/${raw.replace(/^\/+/, "")}`;
            }),
            product.image_url ?? "",
            product.image ?? "",
          ].filter(Boolean).map((raw) => {
            if (/^https?:\/\//i.test(raw)) return raw;
            const origin = API_URL.replace(
              /\/api\/v1\/?$/,
              "",
            ).replace(/\/$/, "");
            return `${origin}/${raw.replace(/^\/+/, "")}`;
          }),
        ),
      )
    : [];

  const primaryImage = product ? getImage(product) : "";
  const imageSrc = galleryImages[selectedImage] || primaryImage;
  const available = (product?.quantity ?? 0) > 0;
  const price = product
    ? Number(product.discount_price ?? product.price)
    : 0;

  return (
    <>
      <Header />

      <main className="kh-product-page">
        <div className="kh-product-breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/shop">Marketplace</Link>
          <span>/</span>
          <span>{loading ? "Product" : product?.name ?? "Product"}</span>
        </div>

        {loading ? (
          <section className="kh-product-loading">
            <div className="kh-product-loading-image" />
            <div className="kh-product-loading-copy">
              <span />
              <span />
              <span />
              <span />
            </div>
          </section>
        ) : error || !product ? (
          <section className="kh-product-error">
            <div className="kh-product-error-icon">◇</div>
            <span className="kh-eyebrow kh-eyebrow-light">
              KWARIHUB MARKETPLACE
            </span>
            <h1>We couldn't load this product.</h1>
            <p>{error || "The requested product is unavailable."}</p>
            <div className="kh-product-actions">
              <Link href="/shop" className="kh-btn kh-btn-primary">
                Browse products →
              </Link>
              <Link href="/" className="kh-btn kh-btn-outline-blue">
                Return home
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="kh-product-detail">
              <div className="kh-product-gallery">
                <div className="kh-product-main-image">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={product.name}
                      key={imageSrc}
                    />
                  ) : (
                    <div className="kh-product-placeholder">
                      <span>KH</span>
                      <small>TEXTILE PRODUCT</small>
                    </div>
                  )}

                  <span className="kh-product-image-badge">
                    KWARIHUB MARKETPLACE
                  </span>
                </div>

                {galleryImages.length > 1 && (
                  <div className="kh-product-thumbnails">
                    {galleryImages.map((image, index) => (
                      <button
                        type="button"
                        key={`${image}-${index}`}
                        className={
                          selectedImage === index
                            ? "kh-product-thumbnail active"
                            : "kh-product-thumbnail"
                        }
                        onClick={() => setSelectedImage(index)}
                        aria-label={`View product image ${index + 1}`}
                        aria-pressed={selectedImage === index}
                      >
                        <img src={image} alt="" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="kh-product-trust">
                  <div>
                    <span>◇</span>
                    <div>
                      <strong>Product discovery</strong>
                      <small>Explore textile listings</small>
                    </div>
                  </div>
                  <div>
                    <span>↗</span>
                    <div>
                      <strong>Convenient shopping</strong>
                      <small>Guest cart supported</small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="kh-product-information">
                <span className="kh-eyebrow kh-eyebrow-light">
                  {getCategory(product)}
                </span>

                <h1>{product.name}</h1>

                <div className="kh-product-price-block">
                  <strong className="kh-product-price">
                    {money(price)}
                  </strong>

                  {product.discount_price != null &&
                    Number(product.discount_price) <
                      Number(product.price) && (
                      <span className="kh-product-old-price">
                        {money(product.price)}
                      </span>
                    )}
                </div>

                <div className="kh-product-stock">
                  <span
                    className={
                      available
                        ? "kh-stock-indicator available"
                        : "kh-stock-indicator unavailable"
                    }
                  />
                  <span>
                    {available
                      ? `Available: ${product.quantity} ${product.unit || "units"}`
                      : "Please contact the seller to confirm availability"}
                  </span>
                </div>

                <div className="kh-product-description">
                  <h2>Product details</h2>
                  <p>
                    {product.description ||
                      "Product details have not been added yet."}
                  </p>
                </div>

                {available && (
                  <div className="kh-product-quantity">
                    <span>Quantity</span>
                    <div className="kh-quantity-control">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((current) => Math.max(1, current - 1))
                        }
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span>{quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((current) =>
                            Math.min(product.quantity, current + 1),
                          )
                        }
                        disabled={quantity >= product.quantity}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <div className="kh-product-total">
                  <span>Subtotal</span>
                  <strong>{money(price * quantity)}</strong>
                </div>

                <button
                  type="button"
                  className="kh-btn kh-btn-primary kh-product-add"
                  onClick={addToCart}
                  disabled={!available || added}
                >
                  {added
                    ? "Added — opening checkout…"
                    : available
                      ? "Add to cart & continue →"
                      : "Currently unavailable"}
                </button>

                <p className="kh-product-note">
                  You can add items to your cart without an account.
                  Sign in is required at checkout.
                </p>

                <div className="kh-product-help">
                  Need help with this product?
                  {" "}
                  <Link href="/support">Contact customer support →</Link>
                </div>
              </div>
            </section>

            <section className="kh-product-discovery">
              <div>
                <span className="kh-eyebrow kh-eyebrow-light">
                  KEEP EXPLORING
                </span>
                <h2>Discover more from the marketplace.</h2>
                <p>
                  Explore more textile products and discover what is
                  available on KwariHub.
                </p>
              </div>
              <Link href="/shop" className="kh-btn kh-btn-primary">
                Browse all products →
              </Link>
            </section>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}

function Header() {
  return (
    <header className="kh-header">
      <Link href="/" className="kh-brand" aria-label="KwariHub home">
        <span className="kh-brand-symbol">K</span>
        <span>
          Kwari<span>Hub</span>
        </span>
      </Link>

      <nav className="kh-nav" aria-label="Main navigation">
        <Link href="/">Home</Link>
        <Link href="/shop" className="kh-nav-active">
          Shop fabrics
        </Link>
        <Link href="/about">About</Link>
        <Link href="/support">Customer support</Link>
        <Link href="/vendor">Vendor portal</Link>
      </nav>

      <div className="kh-header-actions">
        <Link href="/account" className="kh-signin">
          Sign in
        </Link>
        <Link href="/checkout" className="kh-header-cta">
          Cart / Checkout <span>→</span>
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="kh-footer">
      <div className="kh-footer-main">
        <Link href="/" className="kh-brand" aria-label="KwariHub home">
          <span className="kh-brand-symbol">K</span>
          <span>
            Kwari<span>Hub</span>
          </span>
        </Link>

        <p>
          The digital textile marketplace for discovering products and
          connecting the market.
        </p>

        <nav className="kh-footer-links" aria-label="Footer navigation">
          <Link href="/shop">Shop</Link>
          <Link href="/about">About us</Link>
          <Link href="/support">Customer support</Link>
          <Link href="/vendor">Vendor portal</Link>
        </nav>
      </div>

      <div className="kh-footer-bottom">
        <span>
          © {new Date().getFullYear()} KwariHub. All rights reserved.
        </span>
        <a href="https://kwarihub.com">kwarihub.com ↗</a>
      </div>
    </footer>
  );
}
