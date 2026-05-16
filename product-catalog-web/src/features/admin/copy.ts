import type { Locale } from "../i18n/LocaleContext";

export type AdminCopy = {
  access: string;
  manage: string;
  useCredentials: string;
  username: string;
  password: string;
  signingIn: string;
  adminSignIn: string;
  adminPanel: string;
  products: string;
  signedInAs: string;
  signOut: string;
  editProduct: string;
  newProduct: string;
  updateItem: string;
  createItem: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  priceInCents: string;
  inventory: string;
  imageUrl: string;
  featureProduct: string;
  saving: string;
  saveChanges: string;
  saveProduct: string;
  clear: string;
  savedProducts: string;
  items: string;
  loading: string;
  loadError: string;
  featured: string;
  stock: string;
  edit: string;
  delete: string;
};

/** Returns all admin page labels from a single locale-aware source. */
export function getAdminCopy(locale: Locale): AdminCopy {
  return locale === "ja"
    ? {
        access: "管理アクセス",
        manage: "商品管理",
        useCredentials: "`admin` / `admin` でログインしてください。",
        username: "ユーザー名",
        password: "パスワード",
        signingIn: "ログイン中...",
        adminSignIn: "管理者ログイン",
        adminPanel: "管理パネル",
        products: "商品",
        signedInAs: "ログイン中",
        signOut: "ログアウト",
        editProduct: "商品編集",
        newProduct: "新規商品",
        updateItem: "既存商品の更新",
        createItem: "商品を作成",
        name: "名前",
        brand: "ブランド",
        category: "カテゴリ",
        description: "説明",
        priceInCents: "価格",
        inventory: "在庫",
        imageUrl: "画像URL",
        featureProduct: "注目商品にする",
        saving: "保存中...",
        saveChanges: "変更を保存",
        saveProduct: "商品を保存",
        clear: "クリア",
        savedProducts: "保存済み商品",
        items: "件",
        loading: "商品を読み込み中...",
        loadError: "商品の読み込みに失敗しました",
        featured: "注目",
        stock: "在庫",
        edit: "編集",
        delete: "削除",
      }
    : {
        access: "Admin access",
        manage: "Manage product entries",
        useCredentials: "Use `admin` / `admin` to sign in.",
        username: "Username",
        password: "Password",
        signingIn: "Signing in...",
        adminSignIn: "Admin sign in",
        adminPanel: "Admin panel",
        products: "Products",
        signedInAs: "Signed in as",
        signOut: "Sign out",
        editProduct: "Edit product",
        newProduct: "New product",
        updateItem: "Update existing item",
        createItem: "Create a catalog item",
        name: "Name",
        brand: "Brand",
        category: "Category",
        description: "Description",
        priceInCents: "Price",
        inventory: "Inventory",
        imageUrl: "Image URL",
        featureProduct: "Feature this product",
        saving: "Saving...",
        saveChanges: "Save changes",
        saveProduct: "Save product",
        clear: "Clear",
        savedProducts: "Saved products",
        items: "items",
        loading: "Loading products...",
        loadError: "Unable to load products",
        featured: "Featured",
        stock: "Stock",
        edit: "Edit",
        delete: "Delete",
      };
}
