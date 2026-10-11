"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { API_URL, money, type Product } from "@/lib/api";

type PublicProduct = Product & { images?: { image?: string; url?: string; is_primary?: boolean }[]; image?: string; image_url?: string; category?: { name?: string } | string };
type CartLine = { uuid: string; name: string; price: number; quantity: number };

function records<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    for (const key of ["items", "results", "products", "data"]) {
      if (Array.isArray(object[key])) return object[key] as T[];
      if (object[key] && typeof object[key] === "object") {
        const nested = records<T>(object[key]);
        if (nested.length) return nested;
      }
    }
  }
  return [];
}

function imageFor(product: PublicProduct) {
  const selected = product.images?.find((image) => image.is_primary) ?? product.images?.[0];
  const raw = selected?.image ?? selected?.url ?? product.image_url ?? product.image;
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${API_URL.replace(/\/api\/v1\/?$/, "")}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

export function Storefront({ full = false }: { full?: boolean }) {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    try {
      const cart = JSON.parse(localStorage.getItem("kwarihub_guest_cart") || "[]") as CartLine[];
      setCartCount(cart.reduce((sum, line) => sum + line.quantity, 0));
    } catch { setCartCount(0); }
    const controller = new AbortController();
    fetch(`${API_URL}/products`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Product catalogue is currently unavailable (${response.status}).`);
        return response.json();
      })
      .then((payload: unknown) => setProducts(records<PublicProduct>(payload).filter((product) => product.is_active !== false && product.status !== "rejected")))
      .catch((cause: unknown) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load products."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    const items = term ? products.filter((p) => `${p.name} ${p.description ?? ""} ${p.category ?? ""} ${p.brand ?? ""}`.toLowerCase().includes(term)) : products;
    return full ? items : items.slice(0, 8);
  }, [products, query, full]);

  function addToCart(product: PublicProduct) {
    let cart: CartLine[] = [];
    try { cart = JSON.parse(localStorage.getItem("kwarihub_guest_cart") || "[]") as CartLine[]; } catch { cart = []; }
    const existing = cart.find((line) => line.uuid === product.uuid);
    if (existing) existing.quantity += 1;
    else cart.push({ uuid: product.uuid, name: product.name, price: Number(product.discount_price ?? product.price), quantity: 1 });
    localStorage.setItem("kwarihub_guest_cart", JSON.stringify(cart));
    setCartCount(cart.reduce((sum, line) => sum + line.quantity, 0));
  }

  return <section className={`catalogue-section${full ? " catalogue-full" : ""}`} id="shop">
    <div className="section-heading"><div><p className="eyebrow-pill">THE MARKETPLACE</p><h2>{full ? "Explore textile products" : "Discover what’s in the market"}</h2><p>Browse the catalogue without an account. Sign in only when you’re ready to place an order.</p></div><Link href="/checkout" className="cart-link" aria-label={`Open cart with ${cartCount} items`}>Cart <span>{cartCount}</span></Link></div>
    <div className="catalogue-tools"><label className="search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search fabrics, products and textiles" aria-label="Search products" /></label><span className="catalogue-count">{loading ? "Loading catalogue…" : `${visible.length} product${visible.length === 1 ? "" : "s"}${products.length > visible.length && !query && !full ? " shown" : ""}`}</span></div>
    {loading ? <div className="catalogue-state"><span className="loading-dot" /> Loading products from KwariHub…</div> : error ? <div className="catalogue-state catalogue-error"><strong>We couldn’t load the catalogue.</strong><span>{error}</span><span>Product browsing will work once the public product endpoint is reachable without authentication.</span></div> : visible.length === 0 ? <div className="catalogue-state">No products match this search yet. Try another word.</div> : <div className="product-grid">{visible.map((product) => {
      const src = imageFor(product);
      return <article className="product-card" key={product.uuid}><Link href={`/products/${encodeURIComponent(product.uuid)}`} className="product-image-link" aria-label={`View ${product.name}`}><div className={`product-image${src ? " has-product-image" : ""}`}>{src ? <img src={src} alt={product.name} loading="lazy" /> : <div className="product-placeholder"><span>KH</span><small>TEXTILE SAMPLE</small></div>}{product.is_featured && <span className="product-tag">Featured</span>}</div></Link><div className="product-card-body"><div className="product-category">{typeof product.category === "string" ? product.category : product.category?.name ?? product.unit ?? "Textile product"}</div><Link href={`/products/${encodeURIComponent(product.uuid)}`} className="product-name">{product.name}</Link><p className="product-description">{product.description || "Product details available on the product page."}</p><div className="product-card-bottom"><strong>{money(product.discount_price ?? product.price)}</strong><button type="button" className="add-cart-button" onClick={() => addToCart(product)} aria-label={`Add ${product.name} to cart`}>+</button></div></div></article>;
    })}</div>}
    {!full && products.length > 8 && <div className="catalogue-more"><Link href="/shop" className="button-secondary">View all products <span aria-hidden="true">→</span></Link></div>}
  </section>;
}
