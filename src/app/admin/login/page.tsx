import Image from "next/image";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="login-shell">
      {/* =====================================================
          GLOBAL ANIMATED BACKGROUND
          ===================================================== */}
      <div
        className="login-background"
        aria-hidden="true"
      >
        <span className="background-orb orb-one" />
        <span className="background-orb orb-two" />
        <span className="background-orb orb-three" />

        <span className="background-ring ring-one" />
        <span className="background-ring ring-two" />
      </div>

      {/* =====================================================
          LEFT BRANDING PANEL
          ===================================================== */}
      <section className="login-brand-panel">
        {/* Background grid */}
        <div
          className="brand-grid-pattern"
          aria-hidden="true"
        />

        <div className="login-brand-content">

          {/* =================================================
              KWARIHUB LOGO
              ================================================= */}
          <div className="brand-lockup login-brand-lockup">
            <div className="brand-logo-box">
              <Image
                src="/images/kwarihub_logo.png"
                alt="KwariHub"
                width={52}
                height={52}
                priority
              />
            </div>

            <div className="brand-name">
              Kwari<span>Hub</span>
            </div>
          </div>

          {/* =================================================
              BRAND MESSAGE
              ================================================= */}
          <div className="brand-copy">

            <div className="eyebrow-wrapper">
              <span className="eyebrow-line" />

              <p className="eyebrow">
                MARKETPLACE OPERATIONS
              </p>
            </div>

            <h1>
              Made for the people
              <br />
              who move the{" "}
              <span className="brand-highlight">
                market.
              </span>
            </h1>

            <p className="brand-description">
              One clear view of the KwariHub textile marketplace.
              Manage sellers, products, orders, payments and
              marketplace activity from one place.
            </p>
          </div>

          {/* =================================================
              MARKETPLACE FEATURES
              ================================================= */}
          <div className="brand-features">

            <div className="brand-feature">
              <span className="feature-dot" />
              <span>Seller management</span>
            </div>

            <div className="brand-feature">
              <span className="feature-dot" />
              <span>Product operations</span>
            </div>

            <div className="brand-feature">
              <span className="feature-dot" />
              <span>Order management</span>
            </div>

          </div>

          {/* =================================================
              DECORATIVE TEXTILE DESIGN
              ================================================= */}
          <div
            className="fabric-art"
            aria-hidden="true"
          >
            <span className="fabric fabric-one" />
            <span className="fabric fabric-two" />
            <span className="fabric fabric-three" />
            <span className="fabric fabric-four" />
            <span className="fabric fabric-five" />
          </div>

          {/* =================================================
              BRAND FOOTER
              ================================================= */}
          <div className="brand-foot">
            <span />

            TEXTILE COMMERCE, CONNECTED.

            <span />
          </div>
        </div>
      </section>

      {/* =====================================================
          RIGHT LOGIN AREA
          ===================================================== */}
      <section className="login-form-panel">

        <div className="login-panel-inner">

          {/* =================================================
              MOBILE BRAND
              ================================================= */}
          <div className="mobile-brand">

            <div className="brand-logo-box">
              <Image
                src="/images/kwarihub_logo.png"
                alt="KwariHub"
                width={42}
                height={42}
                priority
              />
            </div>

            <div className="brand-name">
              Kwari<span>Hub</span>
            </div>

          </div>

          {/* =================================================
              LOGIN CARD
              ================================================= */}
          <div className="login-card">

            {/* =================================================
                LOGIN HEADER
                ================================================= */}
            <div className="login-card-header">

              {/* Security status */}
              <div className="login-status">
                <span className="status-pulse" />

                <span>
                  Secure administrator portal
                </span>
              </div>

              {/* Section label */}
              <p className="eyebrow">
                ADMINISTRATOR ACCESS
              </p>

              {/* Heading */}
              <h2>
                Welcome
                <span> back</span>
              </h2>

              {/* Description */}
              <p className="muted">
                Sign in to your KwariHub administration
                account to continue managing the
                marketplace.
              </p>

            </div>

            {/* =================================================
                AUTHENTICATION
                ================================================= */}
            <div className="login-form-wrapper">
              <LoginForm />
            </div>

            {/* =================================================
                SECURITY INFORMATION
                ================================================= */}
            <div className="login-help">

              <div className="login-help-icon">
                <span>✓</span>
              </div>

              <div className="login-help-content">

                <strong>
                  Protected access
                </strong>

                <p>
                  Use an active, verified account
                  configured for marketplace
                  administration.
                </p>

              </div>

            </div>

          </div>
        </div>

        {/* =================================================
            LOGIN FOOTER
            ================================================= */}
        <footer className="form-footer">

          <span>
            © {new Date().getFullYear()} KwariHub
          </span>

          <span className="footer-separator">
            •
          </span>

          <span>
            Marketplace administration
          </span>

          <span className="footer-separator">
            •
          </span>

          <span>
            Secure access
          </span>

        </footer>

      </section>
    </main>
  );
}