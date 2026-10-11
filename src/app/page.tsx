
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_URL, money, type Product } from "@/lib/api";

type HomeProduct = Product & {
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

type ProductResponse =
  | HomeProduct[]
  | {
      items?: HomeProduct[];
      data?: HomeProduct[] | { items?: HomeProduct[] };
      products?: HomeProduct[];
    };

function getProducts(payload: ProductResponse): HomeProduct[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.products)) return payload.products;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && !Array.isArray(payload.data)) {
    return payload.data.items ?? [];
  }
  return [];
}

function productImage(product: HomeProduct): string {
  const raw =
    product.images?.find((image) => image.is_primary)?.image ??
    product.images?.[0]?.image ??
    product.images?.find((image) => image.is_primary)?.url ??
    product.images?.[0]?.url ??
    product.image_url ??
    product.image;

  if (!raw) return "";

  if (/^https?:\/\//i.test(raw)) return raw;

  const origin = API_URL.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
  return `${origin}/${raw.replace(/^\/+/, "")}`;
}

function categoryName(product: HomeProduct): string {
  return typeof product.category === "string"
    ? product.category
    : product.category?.name ?? "Textile";
}

export default function HomePage() {
  const [products, setProducts] = useState<HomeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/products`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Unable to load products (${response.status}).`);
        }

        const payload = (await response.json()) as ProductResponse;
        setProducts(getProducts(payload).slice(0, 8));
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Products are temporarily unavailable.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadProducts();

    return () => controller.abort();
  }, []);

  return (
    <>
      <Header />

      <main className="kh-home">
        {/* INTERNATIONAL HERO */}
        <section className="kh-about-hero kh-home-hero">
          <div className="kh-hero-glow" />
          <div className="kh-hero-grid" />

          <div className="kh-hero-inner">
            <div className="kh-hero-copy kh-reveal">
              <span className="kh-eyebrow kh-eyebrow-dark">
                THE DIGITAL TEXTILE MARKETPLACE
              </span>

              <h1>
                Discover textiles.
                <br />
                <span>Connect without borders.</span>
              </h1>

              <p>
                Explore textile products and connect with sellers through
                KwariHub, a digital marketplace designed to expand
                opportunities for buyers, retailers, and wholesalers
                across Nigeria.
              </p>

              <div className="kh-hero-actions">
                <Link href="/shop" className="kh-btn kh-btn-primary">
                  Explore marketplace <span>→</span>
                </Link>

                <Link
                  href="/vendor"
                  className="kh-btn kh-btn-outline-light"
                >
                  Become a vendor
                </Link>
              </div>

              <div className="kh-hero-benefits">
                <div className="kh-hero-benefit">
                  <span className="kh-benefit-icon">◇</span>
                  <span>Textile discovery</span>
                </div>

                <div className="kh-hero-benefit">
                  <span className="kh-benefit-icon">◎</span>
                  <span>Buyer & seller connections</span>
                </div>

                <div className="kh-hero-benefit">
                  <span className="kh-benefit-icon">↗</span>
                  <span>Business opportunities</span>
                </div>
              </div>
            </div>

            {/* Reuses the animated global illustration from About */}
            <div
              className="kh-global-visual"
              aria-label="Illustration of connected textile markets"
            >
              <div className="kh-orbit kh-orbit-one" />
              <div className="kh-orbit kh-orbit-two" />

              <div className="kh-globe">
                <div className="kh-globe-latitudes" />
                <div className="kh-globe-longitudes" />
                <div className="kh-globe-land kh-land-one" />
                <div className="kh-globe-land kh-land-two" />
                <div className="kh-globe-land kh-land-three" />

                <span className="kh-globe-point kh-point-one" />
                <span className="kh-globe-point kh-point-two" />
                <span className="kh-globe-point kh-point-three" />
                <span className="kh-globe-point kh-point-four" />
              </div>

              <div className="kh-region-label kh-region-europe">
                🌍 Global markets
              </div>
              <div className="kh-region-label kh-region-asia">
                🌏 Asia
              </div>
              <div className="kh-region-label kh-region-nigeria">
                🇳🇬 Nigeria
              </div>
              <div className="kh-region-label kh-region-africa">
                🌍 Africa
              </div>
              <div className="kh-region-label kh-region-america">
                🌎 Buyers & sellers
              </div>

              <div className="kh-global-caption">
                <span className="kh-live-dot" />
                Discover. Connect. Trade.
              </div>
            </div>
          </div>

          <div className="kh-hero-bottom-line" />
        </section>

        {/* MARKETPLACE INTRODUCTION */}
        <section className="kh-home-intro">
          <div>
            <span className="kh-eyebrow kh-eyebrow-light">
              WELCOME TO KWARIHUB
            </span>
            <h2>A more connected way to discover textiles.</h2>
          </div>

          <p>
            Bringing textile discovery and digital commerce together
            through one marketplace for buyers and sellers.
          </p>
        </section>

        {/* PRODUCT CATALOGUE */}
        <section className="kh-home-products" id="featured-products">
          <div className="kh-home-section-heading">
            <div>
              <span className="kh-eyebrow kh-eyebrow-light">
                EXPLORE THE MARKETPLACE
              </span>
              <h2>Explore textile products</h2>
              <p>
                Discover products available through the KwariHub
                marketplace.
              </p>
            </div>

            <Link href="/shop" className="kh-home-view-all">
              View all products <span>→</span>
            </Link>
          </div>

          {loading ? (
            <div className="kh-home-product-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="kh-product-skeleton" key={index}>
                  <div />
                  <span />
                  <span />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="kh-home-state">
              <span className="kh-home-state-icon">↻</span>
              <h3>Products could not be loaded</h3>
              <p>
                The marketplace is currently unable to retrieve products.
                Please try again or browse the full shop.
              </p>
              <Link href="/shop" className="kh-btn kh-btn-primary">
                Open marketplace →
              </Link>
            </div>
          ) : products.length === 0 ? (
            <div className="kh-home-state">
              <span className="kh-home-state-icon">◇</span>
              <h3>Products are coming into view</h3>
              <p>
                There are no products to display here yet. Visit the
                marketplace to explore available listings.
              </p>
              <Link href="/shop" className="kh-btn kh-btn-primary">
                Browse marketplace →
              </Link>
            </div>
          ) : (
            <div className="kh-home-product-grid">
              {products.map((product) => {
                const image = productImage(product);
                const price = product.discount_price ?? product.price;

                return (
                  <article
                    className="kh-home-product-card"
                    key={product.uuid}
                  >
                    <Link
                      href={`/products/${encodeURIComponent(product.uuid)}`}
                      className="kh-home-product-image"
                      aria-label={`View ${product.name}`}
                    >
                      {image ? (
                        <img src={image} alt={product.name} loading="lazy" />
                      ) : (
                        <div className="kh-home-product-placeholder">
                          <span>KH</span>
                          <small>TEXTILE PRODUCT</small>
                        </div>
                      )}

                      <span className="kh-home-product-category">
                        {categoryName(product)}
                      </span>
                    </Link>

                    <div className="kh-home-product-info">
                      <Link
                        href={`/products/${encodeURIComponent(product.uuid)}`}
                        className="kh-home-product-name"
                      >
                        {product.name}
                      </Link>

                      <div className="kh-home-product-price">
                        {money(price)}
                      </div>

                      <div className="kh-home-product-bottom">
                        <span
                          className={
                            product.quantity > 0
                              ? "kh-stock-available"
                              : "kh-stock-unavailable"
                          }
                        >
                          {product.quantity > 0
                            ? "Available"
                            : "Check availability"}
                        </span>

                        <Link
                          href={`/products/${encodeURIComponent(product.uuid)}`}
                          className="kh-product-arrow"
                          aria-label={`View ${product.name}`}
                        >
                          →
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="kh-home-mobile-view-all">
            <Link href="/shop" className="kh-btn kh-btn-outline-blue">
              Explore all products →
            </Link>
          </div>
        </section>

        {/* HOW KWARIHUB CONNECTS THE MARKET */}
        <section className="kh-home-steps">
          <div className="kh-home-steps-heading">
            <span className="kh-eyebrow kh-eyebrow-light">
              SIMPLE. CONNECTED. DIGITAL.
            </span>
            <h2>Start exploring KwariHub.</h2>
            <p>
              Whether you are discovering products or bringing your
              business online, start with the marketplace.
            </p>
          </div>

          <div className="kh-home-steps-grid">
            <article className="kh-home-step">
              <span className="kh-step-number">01</span>
              <div className="kh-step-icon">⌕</div>
              <h3>Discover products</h3>
              <p>
                Browse available textile listings and review product
                details before making a purchase.
              </p>
              <Link href="/shop">Browse the shop →</Link>
            </article>

            <article className="kh-home-step">
              <span className="kh-step-number">02</span>
              <div className="kh-step-icon">◇</div>
              <h3>Connect with the market</h3>
              <p>
                Explore a digital marketplace built to connect textile
                buyers, sellers, retailers, and wholesalers.
              </p>
              <Link href="/about">Our vision →</Link>
            </article>

            <article className="kh-home-step">
              <span className="kh-step-number">03</span>
              <div className="kh-step-icon">↗</div>
              <h3>Bring your business online</h3>
              <p>
                Discover how to apply to join KwariHub as a vendor and
                showcase your products.
              </p>
              <Link href="/vendor">Vendor portal →</Link>
            </article>
          </div>
        </section>

        {/* VENDOR CALL TO ACTION */}
        <section className="kh-about-cta kh-home-cta">
          <div className="kh-cta-pattern" />

          <div className="kh-cta-content">
            <span className="kh-eyebrow kh-eyebrow-light">
              FOR TEXTILE BUSINESSES
            </span>

            <h2>Bring your textile business to KwariHub.</h2>

            <p>
              Explore the vendor portal and discover how to apply to
              showcase your products through the digital marketplace.
            </p>

            <div className="kh-hero-actions">
              <Link href="/vendor" className="kh-btn kh-btn-primary">
                Visit vendor portal <span>→</span>
              </Link>

              <Link
                href="/support"
                className="kh-btn kh-btn-outline-blue"
              >
                Contact support
              </Link>
            </div>
          </div>

          <div className="kh-cta-art" aria-hidden="true">
            <div className="kh-cta-orbit" />

            <div className="kh-cta-tile kh-cta-tile-one">
              <span>✦</span>
              Textile discovery
            </div>

            <div className="kh-cta-tile kh-cta-tile-two">
              <span>↗</span>
              Digital marketplace
            </div>

            <div className="kh-cta-globe">◎</div>
          </div>
        </section>
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
        <Link href="/" className="kh-nav-active">
          Home
        </Link>
        <Link href="/shop">Shop fabrics</Link>
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
