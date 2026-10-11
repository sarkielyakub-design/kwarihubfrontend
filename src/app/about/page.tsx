import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About KwariHub | The Digital Textile Marketplace",
  description:
    "Discover KwariHub's mission to connect textile buyers and sellers, empower traders, and expand Nigeria's textile marketplace through technology.",
};

const benefits = [
  {
    icon: "◇",
    title: "Trusted Marketplace",
    description: "A digital destination for textile discovery and commerce.",
  },
  {
    icon: "◎",
    title: "Connecting Buyers & Sellers",
    description: "Bringing customers, retailers, and wholesalers together.",
  },
  {
    icon: "◉",
    title: "Wider Market Access",
    description: "Helping textile businesses reach more customers.",
  },
];

const founderPillars = [
  {
    icon: "✦",
    title: "Entrepreneurship",
    description: "Building opportunities through technology.",
  },
  {
    icon: "◎",
    title: "Digital Market Access",
    description: "Connecting traditional trade with digital commerce.",
  },
  {
    icon: "♧",
    title: "Business Connections",
    description: "Supporting buyers, retailers, and textile traders.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />

      <main className="kh-about">
        {/* INTERNATIONAL HERO */}
        <section className="kh-about-hero">
          <div className="kh-hero-glow" />
          <div className="kh-hero-grid" />

          <div className="kh-hero-inner">
            <div className="kh-hero-copy kh-reveal">
              <span className="kh-eyebrow kh-eyebrow-dark">
                ABOUT KWARIHUB
              </span>

              <h1>
                Traditional textile trade.
                <br />
                <span>Connected by technology.</span>
              </h1>

              <p>
                KwariHub is a digital marketplace initiative designed to
                connect textile buyers and sellers, simplify product
                discovery, and expand access to textile trading
                opportunities across Nigeria.
              </p>

              <div className="kh-hero-actions">
                <Link href="/shop" className="kh-btn kh-btn-primary">
                  Browse products <span>→</span>
                </Link>

                <Link href="/vendor" className="kh-btn kh-btn-outline-light">
                  Become a vendor
                </Link>
              </div>

              <div className="kh-hero-benefits">
                {benefits.map((benefit) => (
                  <div className="kh-hero-benefit" key={benefit.title}>
                    <span className="kh-benefit-icon">{benefit.icon}</span>
                    <span>{benefit.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ANIMATED GLOBAL MARKETPLACE VISUAL */}
            <div className="kh-global-visual" aria-label="Global textile trade illustration">
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
                <span>🌍</span> Europe
              </div>

              <div className="kh-region-label kh-region-asia">
                <span>🌏</span> Asia
              </div>

              <div className="kh-region-label kh-region-nigeria">
                <span>🇳🇬</span> Nigeria
              </div>

              <div className="kh-region-label kh-region-africa">
                <span>🌍</span> Africa
              </div>

              <div className="kh-region-label kh-region-america">
                <span>🌎</span> Global trade
              </div>

              <div className="kh-global-caption">
                <span className="kh-live-dot" />
                Connecting textile markets
              </div>
            </div>
          </div>

          <div className="kh-hero-bottom-line" />
        </section>

        {/* FOUNDER PROFILE */}
        <section className="kh-founder-section">
          <div className="kh-founder-image-column kh-reveal">
            <div className="kh-founder-image-backdrop" />

            <div className="kh-founder-image-frame">
              <img
                src="/images/ibrahim-umar-ibrahim.jpg"
                alt="Ibrahim Umar Ibrahim, Founder and Chairman of KwariHub"
                className="kh-founder-image"
              />

              <div className="kh-founder-image-overlay" />

              <div className="kh-founder-image-caption">
                <span className="kh-caption-label">FOUNDER & CHAIRMAN</span>
                <strong>Ibrahim Umar Ibrahim</strong>
                <span>KwariHub</span>
              </div>
            </div>

            <div className="kh-founder-image-decoration" />
          </div>

          <div className="kh-founder-content kh-reveal">
            <span className="kh-eyebrow kh-eyebrow-light">
              A MESSAGE FROM OUR FOUNDER & CHAIRMAN
            </span>

            <h2>Ibrahim Umar Ibrahim</h2>

            <p className="kh-founder-role">
              Founder & Chairman of KwariHub
            </p>

            <p>
              Ibrahim Umar Ibrahim is an entrepreneur and the Founder &
              Chairman of KwariHub, a digital marketplace initiative
              designed to connect textile buyers and sellers, simplify
              product discovery, and expand access to textile trading
              opportunities across Nigeria.
            </p>

            <p>
              Through KwariHub, he aims to bridge the gap between traditional
              textile markets and digital commerce by creating opportunities
              for traders, wholesalers, retailers, and customers to connect
              more efficiently.
            </p>

            <p>
              His vision is to contribute to the digital transformation of
              Nigeria’s textile trading industry and help businesses reach
              wider markets through technology.
            </p>

            <div className="kh-founder-pillars">
              {founderPillars.map((pillar) => (
                <div className="kh-founder-pillar" key={pillar.title}>
                  <span className="kh-pillar-icon">{pillar.icon}</span>
                  <div>
                    <strong>{pillar.title}</strong>
                    <span>{pillar.description}</span>
                  </div>
                </div>
              ))}
            </div>

            <a
              className="kh-official-link"
              href="https://kwarihub.com"
              target="_blank"
              rel="noreferrer"
            >
              <span>↗</span>
              Official website: <strong>kwarihub.com</strong>
            </a>
          </div>
        </section>

        {/* MARKETPLACE VALUE PROPOSITION */}
        <section className="kh-value-section">
          <div className="kh-value-heading kh-reveal">
            <span className="kh-eyebrow kh-eyebrow-light">
              THE KWARIHUB VISION
            </span>
            <h2>Bringing textile trade into the digital age.</h2>
            <p>
              A more connected way for textile buyers, traders, retailers,
              and wholesalers to discover business opportunities.
            </p>
          </div>

          <div className="kh-value-grid">
            <article className="kh-value-card">
              <span className="kh-value-number">01</span>
              <div className="kh-value-icon">⌕</div>
              <h3>Discover products</h3>
              <p>
                Explore textile products and make product discovery easier
                through a digital marketplace.
              </p>
              <Link href="/shop">Explore the shop →</Link>
            </article>

            <article className="kh-value-card">
              <span className="kh-value-number">02</span>
              <div className="kh-value-icon">↔</div>
              <h3>Connect the market</h3>
              <p>
                Create opportunities for customers, retailers, and
                wholesalers to connect more efficiently.
              </p>
              <Link href="/support">Get in touch →</Link>
            </article>

            <article className="kh-value-card">
              <span className="kh-value-number">03</span>
              <div className="kh-value-icon">↗</div>
              <h3>Grow your business</h3>
              <p>
                Help textile businesses showcase products and pursue wider
                market opportunities through technology.
              </p>
              <Link href="/vendor">Become a vendor →</Link>
            </article>
          </div>
        </section>

        {/* CTA */}
        <section className="kh-about-cta">
          <div className="kh-cta-pattern" />

          <div className="kh-cta-content">
            <span className="kh-eyebrow kh-eyebrow-light">
              DISCOVER THE MARKETPLACE
            </span>

            <h2>Be part of a more connected textile community.</h2>

            <p>
              Explore textile products or discover how to bring your
              business to KwariHub.
            </p>

            <div className="kh-hero-actions">
              <Link href="/shop" className="kh-btn kh-btn-primary">
                Browse products <span>→</span>
              </Link>

              <Link href="/vendor" className="kh-btn kh-btn-outline-blue">
                Vendor portal
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
              Business growth
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
        <Link href="/">Home</Link>
        <Link href="/shop">Shop fabrics</Link>
        <Link href="/about" className="kh-nav-active">
          About
        </Link>
        <Link href="/support">Customer support</Link>
        <Link href="/vendor">Vendor portal</Link>
      </nav>

      <div className="kh-header-actions">
        <Link href="/account" className="kh-signin">
          Sign in
        </Link>
        <Link href="/shop" className="kh-header-cta">
          Explore shop <span>→</span>
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