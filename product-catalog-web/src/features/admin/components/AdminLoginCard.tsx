import type { FormEvent } from "react";

import type { AdminCopy } from "../copy";

type AdminCredentials = {
  username: string;
  password: string;
};

type AdminLoginCardProps = {
  copy: AdminCopy;
  credentials: AdminCredentials;
  signingIn: boolean;
  errorMessage: string | null;
  onCredentialsChange: (field: keyof AdminCredentials, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function AdminLoginCard({
  copy,
  credentials,
  signingIn,
  errorMessage,
  onCredentialsChange,
  onSubmit,
}: AdminLoginCardProps) {
  return (
    <section className="admin-shell">
      <div className="admin-login-card">
        <p className="eyebrow">{copy.access}</p>
        <h2>{copy.manage}</h2>
        <p className="form-note">{copy.useCredentials}</p>
        <form className="admin-login-form" onSubmit={onSubmit}>
          <label className="search-field">
            <span>{copy.username}</span>
            <input
              type="text"
              value={credentials.username}
              onChange={(event) => onCredentialsChange("username", event.target.value)}
              required
            />
          </label>
          <label className="search-field">
            <span>{copy.password}</span>
            <input
              type="password"
              value={credentials.password}
              onChange={(event) => onCredentialsChange("password", event.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={signingIn}>
            {signingIn ? copy.signingIn : copy.adminSignIn}
          </button>
        </form>
        {errorMessage ? <p className="form-note error">{errorMessage}</p> : null}
      </div>
    </section>
  );
}
