
import type { Metadata } from "next";
import Link from "next/link";
import { Storefront } from "@/components/storefront";

export const metadata: Metadata = {
  title: "Shop Textiles | KwariHub Digital Marketplace",
  description:
    "Explore textile products on KwariHub. Discover listings, compare product details, and connect with textile sellers across Nigeria.",
};

export default function ShopPage() {
  return (
    <>
      <PublicHeader />

      <main className="kh-shop-page">
        <section className="kh-shop-hero">
          <div className="kh-shop-hero-glow" />
          <div className="kh-shop-hero-grid" />

          <div className="kh-shop-hero-inner">
            <div className="kh-shop-hero-copy">
              <span className="kh-eyebrow kh-eyebrow-dark">
                THE KWARIHUB MARKETPLACE
              </span>

              <h1>
                Find your next textile.
                <br />
                <span>Discover more possibilities.</span>
              </h1>

              <p>
                Explore textile listings, discover products from sellers,
                and find the materials you need through one digital
                marketplace.
              </p>

              <div className="kh-shop-hero-actions">
                <a href="#shop-catalogue" className="kh-btn kh-btn-primary">
                  Explore products <span>↓</span>
                </a>

                <Link
                  href="/vendor"
                  className="kh-btn kh-btn-outline-light"
                >
                  Become a vendor
                </Link>
              </div>

              <div className="kh-shop-trust-row">
                <span>
                  <i>◇</i> Discover textile listings
                </span>
                <span>
                  <i>◎</i> Connect with sellers
                </span>
                <span>
                  <i>↗</i> Shop online
                </span>
              </div>
            </div>

            <div className="kh-shop-visual" aria-hidden="true">
              <div className="kh-shop-orbit kh-shop-orbit-a" />
              <div className="kh-shop-orbit kh-shop-orbit-b" />

              <div className="kh-shop-fabric-card kh-shop-fabric-card-back">
                <div className="kh-fabric-pattern kh-fabric-pattern-gold" />
              </div>

              <div className="kh-shop-fabric-card kh-shop-fabric-card-middle">
                <div className="kh-fabric-pattern kh-fabric-pattern-blue" />
              </div>

              <div className="kh-shop-fabric-card kh-shop-fabric-card-front">
                <div className="kh-fabric-pattern kh-fabric-pattern-white" />
              </div>

              <div className="kh-shop-floating-tag kh-shop-tag-top">
                <span>✦</span>
                Textile discovery
              </div>

              <div className="kh-shop-floating-tag kh-shop-tag-bottom">
                <span>↗</span>
                Digital marketplace
              </div>

              <div className="kh-shop-visual-caption">
                <span className="kh-live-dot" />
                Discover the marketplace
              </div>
            </div>
          </div>

          <div className="kh-shop-hero-line" />
        </section>

        <section className="kh-shop-benefits">
          <article>
            <span className="kh-shop-benefit-icon">⌕</span>
            <div>
              <h3>Discover products</h3>
              <p>Explore available textile listings.</p>
            </div>
          </article>

          <article>
            <span className="kh-shop-benefit-icon">◇</span>
            <div>
              <h3>Compare listings</h3>
              <p>Review prices and product details.</p>
            </div>
          </article>

          <article>
            <span className="kh-shop-benefit-icon">◎</span>
            <div>
              <h3>Connect through commerce</h3>
              <p>Discover sellers through KwariHub.</p>
            </div>
          </article>
        </section>

        <section className="kh-shop-catalogue" id="shop-catalogue">
          <div className="kh-shop-catalogue-heading">
            <div>
              <span className="kh-eyebrow kh-eyebrow-light">
                EXPLORE THE COLLECTION
              </span>

              <h2>Shop textile products</h2>

              <p>
                Browse available products and explore the listings
                published on KwariHub.
              </p>
            </div>

            <Link href="/about" className="kh-shop-about-link">
              Discover KwariHub <span>→</span>
            </Link>
          </div>

          <div className="kh-shop-storefront">
            <Storefront full />
          </div>
        </section>

        <section className="kh-shop-vendor-cta">
          <div className="kh-shop-cta-pattern" />

          <div className="kh-shop-cta-copy">
            <span className="kh-eyebrow kh-eyebrow-light">
              FOR TEXTILE BUSINESSES
            </span>

            <h2>Have textile products to showcase?</h2>

            <p>
              Explore the KwariHub vendor portal and learn how to apply
              to bring your business to the digital marketplace.
            </p>

            <div className="kh-shop-hero-actions">
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

          <div className="kh-shop-cta-symbol" aria-hidden="true">
            <div className="kh-shop-cta-ring" />
            <span>KH</span>
            <small>KWARIHUB</small>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}

function PublicHeader() {
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

function PublicFooter() {
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
