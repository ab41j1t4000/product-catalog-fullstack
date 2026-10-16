import assert from "node:assert/strict";
import { after, test } from "node:test";
import {
  isSupabaseConfigured,
  SupabaseConfigurationError,
} from "./supabase.js";

const originalUrl = process.env.SUPABASE_URL;
const originalSecretKey = process.env.SUPABASE_SECRET_KEY;

after(() => {
  if (originalUrl === undefined) delete process.env.SUPABASE_URL;
  else process.env.SUPABASE_URL = originalUrl;
  if (originalSecretKey === undefined) delete process.env.SUPABASE_SECRET_KEY;
  else process.env.SUPABASE_SECRET_KEY = originalSecretKey;
});

test("partial Supabase configuration is reported as a typed configuration failure", () => {
  process.env.SUPABASE_URL = "https://example.supabase.co";
  delete process.env.SUPABASE_SECRET_KEY;

  assert.throws(
    () => isSupabaseConfigured(),
    (error: unknown) =>
      error instanceof SupabaseConfigurationError &&
      error.message.includes("Set both SUPABASE_URL and SUPABASE_SECRET_KEY"),
  );
});
