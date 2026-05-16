import type { Locale } from "../i18n/LocaleContext";

export type LayoutCopy = {
  tagline: string;
  catalog: string;
  cart: string;
  orders: string;
  admin: string;
  signedIn: string;
  signOut: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  signingIn: string;
  signIn: string;
  eyebrow: string;
  heroTitle: string;
  heroText: string;
  heroCta: string;
  language: string;
};

/** Supplies shared shell copy for navigation, hero content, and sign-in UI. */
export function getLayoutCopy(locale: Locale): LayoutCopy {
  return locale === "ja"
    ? {
        tagline: "高速なカタログMVP。検索、アカウント、モック決済に対応。",
        catalog: "商品一覧",
        cart: "カート",
        orders: "注文履歴",
        admin: "管理",
        signedIn: "ログイン済み",
        signOut: "ログアウト",
        namePlaceholder: "名前",
        emailPlaceholder: "メール",
        signingIn: "ログイン中...",
        signIn: "ログイン",
        eyebrow: "コマース基盤",
        heroTitle: "検索、アカウント、決済をひとつの導線で。",
        heroText: "Fastify、Prisma、React、TanStack Query で素早く反復できます。",
        heroCta: "カートを確認",
        language: "言語",
      }
    : {
        tagline: "A fast catalog MVP with typed search, account access, and mock checkout.",
        catalog: "Catalog",
        cart: "Cart",
        orders: "Orders",
        admin: "Admin",
        signedIn: "Signed in",
        signOut: "Sign out",
        namePlaceholder: "Name",
        emailPlaceholder: "Email",
        signingIn: "Signing in...",
        signIn: "Sign in",
        eyebrow: "Lean commerce baseline",
        heroTitle: "Searchable products, account access, and checkout in one pass.",
        heroText: "Built for quick iteration with Fastify, Prisma, React, and TanStack Query.",
        heroCta: "Review cart",
        language: "Language",
      };
}
