
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { money } from "@/lib/api";

type CartLine = {
  uuid: string;
  name: string;
  price: number;
  quantity: number;
};

type CheckoutResponse = {
  order_uuid: string;
  reference?: string;
  checkout_url?: string;
  payment_url?: string;
  message?: string;
};

type PaymentStatus = {
  status?: string;
  payment_status?: string;
  order_status?: string;
  message?: string;
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://kwarihub-backend-production-ea77.up.railway.app/api/v1"
).replace(/\/+$/, "");

const CART_KEY = "kwarihub_guest_cart";
const TOKEN_KEY = "kwarihub_access_token";

export default function CheckoutPage() {
  const searchParams = useSearchParams();

  const [cart, setCart] = useState<CartLine[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus | null>(null);

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, line) =>
          sum + Number(line.price) * Number(line.quantity),
        0,
      ),
    [cart],
  );

  const loadCart = useCallback(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(CART_KEY) || "[]",
      );

      const safeCart: CartLine[] = Array.isArray(stored)
        ? stored
            .filter(
              (line: Partial<CartLine>) =>
                typeof line.uuid === "string" &&
                typeof line.name === "string" &&
                Number.isFinite(Number(line.price)) &&
                Number(line.price) >= 0 &&
                Number.isInteger(Number(line.quantity)) &&
                Number(line.quantity) > 0,
            )
            .map((line: CartLine) => ({
              ...line,
              price: Number(line.price),
              quantity: Number(line.quantity),
            }))
        : [];

      setCart(safeCart);
    } catch {
      setCart([]);
    }
  }, []);

  useEffect(() => {
    setSignedIn(Boolean(localStorage.getItem(TOKEN_KEY)));
    loadCart();
    setReady(true);
  }, [loadCart]);

  // A payment-return URL must be verified by the backend.
  useEffect(() => {
    const reference = searchParams.get("reference");
    const paymentReference = searchParams.get("paymentReference");
    const paymentReturned = searchParams.get("payment");

    if (!reference && !paymentReference && !paymentReturned) return;

    if (paymentReturned === "cancelled") {
      setNotice(
        "Payment was cancelled. Your order has not been confirmed as paid.",
      );
      return;
    }

    const ref = reference || paymentReference;

    if (!ref) {
      setNotice(
        "Payment return received. Sign in and check your order status.",
      );
      return;
    }

    let cancelled = false;

    async function verifyReturn() {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        setNotice(
          "Please sign in to check the status of your payment.",
        );
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/payments/monnify/verify/${encodeURIComponent(ref!)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            cache: "no-store",
          },
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.detail || data.message ||
              "We could not verify this payment yet.",
          );
        }

        if (cancelled) return;

        const result = data as PaymentStatus;
        setPaymentStatus(result);

        const status = String(
          result.payment_status || result.status || "",
        ).toUpperCase();

        if (status === "PAID" || status === "SUCCESS" ||
            status === "SUCCESSFUL") {
          localStorage.removeItem(CART_KEY);
          setCart([]);
          setNotice(
            "Payment verified. Your order confirmation is being updated.",
          );
        } else if (status === "FAILED" || status === "CANCELLED") {
          setNotice(
            "The payment was not completed. Check the order status before trying again.",
          );
        } else {
          setNotice(
            "Your payment is still being confirmed. Please check again shortly.",
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to verify payment.",
          );
        }
      }
    }

    void verifyReturn();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  function changeQuantity(uuid: string, quantity: number) {
    const next = cart
      .map((line) =>
        line.uuid === uuid ? { ...line, quantity } : line,
      )
      .filter((line) => line.quantity > 0);

    setCart(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    setError("");
  }

  async function startCheckout() {
    setError("");
    setNotice("");

    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      window.location.href =
        "/account?next=" + encodeURIComponent("/checkout");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (shippingAddress.trim().length < 10) {
      setError("Enter a complete delivery address.");
      return;
    }

    setSubmitting(true);

    try {
      /*
       * Backend contract:
       * 1. Create/prepare an order from the authenticated server-side cart.
       * 2. Initialize Monnify Hosted Checkout for that order.
       * 3. Return order_uuid and checkout_url.
       *
       * The backend must calculate the payable amount from its database.
       * Never send the browser-calculated total as the trusted amount.
       */
      const response = await fetch(
        `${API_BASE_URL}/payments/monnify/initialize`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            shipping_address: shippingAddress.trim(),
          }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || data.message ||
            "Could not start checkout. Please try again.",
        );
      }

      const result = data as CheckoutResponse;
      const checkoutUrl = result.checkout_url || result.payment_url;

      if (!checkoutUrl) {
        throw new Error(
          "The server did not return a Monnify checkout URL.",
        );
      }

      // Only redirect to a trusted HTTPS Monnify checkout URL.
      const destination = new URL(checkoutUrl);

      if (
        destination.protocol !== "https:" ||
        !(
          destination.hostname === "monnify.com" ||
          destination.hostname.endsWith(".monnify.com")
        )
      ) {
        throw new Error("The payment URL returned by the server is invalid.");
      }

      window.location.assign(destination.toString());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while starting checkout.",
      );
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />

      <main className="checkout-page">
        <p className="eyebrow-pill">SECURE CHECKOUT</p>

        <h1>
          {signedIn
            ? "Review your order."
            : "Your next order starts here."}
        </h1>

        <p className="content-lead">
          Review your fabrics, provide your delivery address, and
          continue to secure payment.
        </p>

        {notice && (
          <div className="form-notice" role="status">
            {notice}
            {paymentStatus?.order_status && (
              <p>
                Order status: {paymentStatus.order_status}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="checkout-error" role="alert">
            {error}
          </div>
        )}

        {!ready ? (
          <div className="catalogue-state">Loading your cart…</div>
        ) : cart.length === 0 ? (
          <div className="empty-cart">
            <span>＋</span>
            <h2>Your cart is empty</h2>
            <p>
              Explore the catalogue and add products you like.
            </p>
            <Link className="button-primary" href="/shop">
              Browse products →
            </Link>
          </div>
        ) : (
          <div className="checkout-layout">
            <section className="cart-lines">
              <h2>Your items ({cart.length})</h2>

              {cart.map((line) => (
                <article className="cart-line" key={line.uuid}>
                  <div className="cart-line-mark">KH</div>

                  <div className="cart-line-info">
                    <Link
                      href={`/products/${encodeURIComponent(line.uuid)}`}
                    >
                      {line.name}
                    </Link>

                    <strong>{money(line.price)}</strong>

                    <div className="quantity-control">
                      <button
                        type="button"
                        onClick={() =>
                          changeQuantity(
                            line.uuid,
                            line.quantity - 1,
                          )
                        }
                        aria-label={`Decrease quantity of ${line.name}`}
                        disabled={submitting}
                      >
                        −
                      </button>

                      <span>{line.quantity}</span>

                      <button
                        type="button"
                        onClick={() =>
                          changeQuantity(
                            line.uuid,
                            line.quantity + 1,
                          )
                        }
                        aria-label={`Increase quantity of ${line.name}`}
                        disabled={submitting}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-line-end">
                    <strong>
                      {money(line.price * line.quantity)}
                    </strong>

                    <button
                      type="button"
                      className="remove-line"
                      onClick={() => changeQuantity(line.uuid, 0)}
                      disabled={submitting}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}

              <div className="shipping-section">
                <h2>Delivery details</h2>
                <label htmlFor="shippingAddress">
                  Full delivery address
                </label>

                <textarea
                  id="shippingAddress"
                  value={shippingAddress}
                  onChange={(event) =>
                    setShippingAddress(event.target.value)
                  }
                  placeholder="House number, street, area, city, state..."
                  rows={4}
                  minLength={10}
                  required
                  disabled={submitting}
                />

                <p className="muted-note">
                  Enter the address where you want your order delivered.
                </p>
              </div>
            </section>

            <aside className="order-summary">
              <h2>Order summary</h2>

              <div>
                <span>Subtotal</span>
                <strong>{money(total)}</strong>
              </div>

              <div>
                <span>Delivery</span>
                <span>Confirmed by the server</span>
              </div>

              <div className="summary-total">
                <span>Subtotal before delivery</span>
                <strong>{money(total)}</strong>
              </div>

              {!signedIn ? (
                <Link
                  className="button-primary account-submit"
                  href="/account?next=%2Fcheckout"
                >
                  Sign in to continue →
                </Link>
              ) : (
                <button
                  type="button"
                  className="button-primary account-submit"
                  onClick={startCheckout}
                  disabled={submitting || cart.length === 0}
                >
                  {submitting
                    ? "Connecting to Monnify…"
                    : "Continue to secure payment →"}
                </button>
              )}

              <p className="muted-note">
                Your final amount, delivery fee, stock availability,
                and payment status must be confirmed by KwariHub's
                server. Your order is not paid until the backend
                verifies the transaction.
              </p>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

function Header() {
  return (
    <header className="public-header">
      <Link href="/" className="public-brand">
        <span className="brand-symbol">K</span>
        <span>
          Kwari<span className="brand-accent">Hub</span>
        </span>
      </Link>

      <nav className="public-nav">
        <Link href="/shop">Shop fabrics</Link>
        <Link href="/about">About</Link>
        <Link href="/support">Customer support</Link>
      </nav>

      <div className="public-header-actions">
        <Link className="header-login" href="/account">
          My account
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="public-footer">
      <Link href="/" className="public-brand">
        <span className="brand-symbol">K</span>
        <span>
          Kwari<span className="brand-accent">Hub</span>
        </span>
      </Link>

      <p>
        The digital textile marketplace for discovering products
        and connecting the market.
      </p>

      <div className="footer-links">
        <Link href="/shop">Shop</Link>
        <Link href="/about">About us</Link>
        <Link href="/support">Customer support</Link>
        <Link href="/vendor">Vendor portal</Link>
      </div>

      <small>
        © {new Date().getFullYear()} KwariHub. All rights reserved.
      </small>
    </footer>
  );
}
