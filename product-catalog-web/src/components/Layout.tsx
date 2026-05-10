import type { FormEvent } from "react";
import { startTransition, useDeferredValue, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../features/auth/AuthContext";
import { useCart } from "../features/cart/hooks";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { isAdmin, isAuthenticated, signIn, signOut, signingIn, user } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const deferredEmail = useDeferredValue(email);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await signIn({ email: deferredEmail, name });
    setEmail("");
    setName("");
  };

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
          <p className="brand-copy">
            A fast catalog MVP with typed search, account access, and mock checkout.
          </p>
        </div>

        <nav className="nav-links" aria-label="Primary">
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")} end>
            Catalog
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Cart <span className="pill">{cartCount}</span>
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
            Admin
          </NavLink>
        </nav>

        <div className="account-panel">
          {isAuthenticated ? (
            <div className="account-chip">
              <span className="status-dot" />
              <div>
                <strong>{user?.name ?? "Signed in"}{isAdmin ? " · Admin" : ""}</strong>
                <p>{user?.email}</p>
              </div>
              <button type="button" className="ghost-button compact-button" onClick={signOut}>
                Sign out
              </button>
            </div>
          ) : (
            <form className="sign-in-form" onSubmit={handleSignIn}>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <button type="submit" disabled={signingIn || !email.trim()}>
                {signingIn ? "Signing in..." : "Sign in"}
              </button>
            </form>
          )}
        </div>
      </header>

      {location.pathname === "/" ? (
        <section className="hero-panel">
          <div>
            <p className="eyebrow">Lean commerce baseline</p>
            <h1>Searchable products, account access, and checkout in one pass.</h1>
            <p className="hero-text">
              Built for quick iteration with Fastify, Prisma, React, and TanStack Query.
            </p>
          </div>
          <Link className="hero-cta" to="/cart">
            Review cart
          </Link>
        </section>
      ) : null}

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
