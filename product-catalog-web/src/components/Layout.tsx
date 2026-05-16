import type { FormEvent } from "react";
import { startTransition, useDeferredValue, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../features/auth/AuthContext";
import { useCart } from "../features/cart/hooks";
import { useLocale } from "../features/i18n/LocaleContext";
import { getLayoutCopy } from "../features/layout/copy";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { isAdmin, isAuthenticated, signIn, signOut, signingIn, user } = useAuth();
  const { locale, setLocale } = useLocale();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const deferredEmail = useDeferredValue(email);
  const copy = getLayoutCopy(locale);

  /** Submits the lightweight customer sign-in form from the shared shell header. */
  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await signIn({ email: deferredEmail, name });
    setEmail("");
    setName("");
  };

  /** Routes brand clicks back to the catalog without blocking the current render. */
  const handleCatalogClick = () => {
    startTransition(() => {
      navigate("/");
    });
  };

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand-block">
          <button type="button" className="brand-link" onClick={handleCatalogClick}>
            Northstar Supply
          </button>
          <p className="brand-copy">{copy.tagline}</p>
          <div className="language-toggle" role="group" aria-label={copy.language}>
            <button
              type="button"
              className={locale === "en" ? "active" : ""}
              onClick={() => setLocale("en")}
            >
              EN
            </button>
            <button
              type="button"
              className={locale === "ja" ? "active" : ""}
              onClick={() => setLocale("ja")}
            >
              日本語
            </button>
          </div>
        </div>

        <nav className="nav-links" aria-label="Primary">
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")} end>
            {copy.catalog}
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {copy.cart} <span className="pill">{cartCount}</span>
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => (isActive ? "active" : "")}>
            {copy.orders}
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
            {copy.admin}
          </NavLink>
        </nav>

        <div className="account-panel">
          {isAuthenticated ? (
            <div className="account-chip">
              <span className="status-dot" />
              <div>
                <strong>{user?.name ?? copy.signedIn}{isAdmin ? " · Admin" : ""}</strong>
                <p>{user?.email}</p>
              </div>
              <button type="button" className="ghost-button compact-button" onClick={signOut}>
                {copy.signOut}
              </button>
            </div>
          ) : (
            <form className="sign-in-form" onSubmit={handleSignIn}>
              <input
                type="text"
                placeholder={copy.namePlaceholder}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <input
                type="email"
                placeholder={copy.emailPlaceholder}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <button type="submit" disabled={signingIn || !email.trim()}>
                {signingIn ? copy.signingIn : copy.signIn}
              </button>
            </form>
          )}
        </div>
      </header>

      {location.pathname === "/" ? (
        <section className="hero-panel">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.heroTitle}</h1>
            <p className="hero-text">{copy.heroText}</p>
          </div>
          <Link className="hero-cta" to="/cart">
            {copy.heroCta}
          </Link>
        </section>
      ) : null}

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
