import type { Locale } from "../i18n/LocaleContext";

export type CartCopy = {
  empty: string;
  emptyText: string;
  cart: string;
  itemsReady: string;
  qty: string;
  remove: string;
  checkout: string;
  summary: string;
  shipping: string;
  shippingPlaceholder: string;
  subtotal: string;
  tax: string;
  total: string;
  processing: string;
  payNow: string;
  signInPrompt: string;
  checkoutFailed: string;
  paymentCaptured: string;
  reference: string;
  viewOrders: string;
};

/** Keeps cart labels separate from checkout flow logic. */
export function getCartCopy(locale: Locale): CartCopy {
  return locale === "ja"
    ? {
        empty: "カートは空です",
        emptyText: "商品一覧から商品を追加して決済フローを確認してください。",
        cart: "カート",
        itemsReady: "点、購入準備完了",
        qty: "数量",
        remove: "削除",
        checkout: "決済",
        summary: "モック決済サマリー",
        shipping: "配送先住所",
        shippingPlaceholder: "東京都渋谷区...",
        subtotal: "小計",
        tax: "概算税額",
        total: "合計",
        processing: "決済処理中...",
        payNow: "今すぐ支払う",
        signInPrompt: "決済前にヘッダーからログインしてください。",
        checkoutFailed: "決済に失敗しました",
        paymentCaptured: "支払い完了",
        reference: "参照番号",
        viewOrders: "注文履歴を見る",
      }
    : {
        empty: "Your cart is empty",
        emptyText: "Add a few products from the catalog to test the checkout flow.",
        cart: "Cart",
        itemsReady: "items ready for checkout",
        qty: "Qty",
        remove: "Remove",
        checkout: "Checkout",
        summary: "Mock payment summary",
        shipping: "Shipping address",
        shippingPlaceholder: "221B Baker Street, London, NW1 6XE",
        subtotal: "Subtotal",
        tax: "Estimated tax",
        total: "Total",
        processing: "Processing payment...",
        payNow: "Pay now",
        signInPrompt: "Sign in from the header before checkout.",
        checkoutFailed: "Checkout failed",
        paymentCaptured: "Payment captured",
        reference: "Reference",
        viewOrders: "View orders",
      };
}
