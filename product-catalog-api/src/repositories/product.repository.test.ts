import assert from "node:assert/strict";
import { test } from "node:test";
import type { CreateProductInput } from "../schemas/product.schema.js";
import {
  InMemoryProductRepository,
} from "./in-memory-product.repository.js";
import { ProductRepositoryError } from "./product.repository.js";

const productInput: CreateProductInput = {
  slug: "test-mask",
  name: "Test Mask",
  priceInr: 1200,
  shortDescription: "A test mask.",
  imageUrl: "https://example.test/test-mask.jpg",
  maskType: "Test",
  inStock: true,
};

test("in-memory repository supports isolated list, detail, create, and update operations", async () => {
  const repository = new InMemoryProductRepository([]);

  assert.deepEqual(await repository.list(), []);

  const created = await repository.create(productInput);
  assert.equal(created.id, "1");
  assert.deepEqual(await repository.findById(created.id), created);

  const updated = await repository.update(created.id, {
    name: "Updated Test Mask",
    priceInr: 1500,
  });
  assert.equal(updated?.name, "Updated Test Mask");
  assert.equal(updated?.priceInr, 1500);
  assert.equal((await repository.list()).length, 1);
});

test("in-memory repository rejects invalid and duplicate records without partial writes", async () => {
  const repository = new InMemoryProductRepository([]);

  await assert.rejects(
    () => repository.create({ ...productInput, priceInr: -1 }),
    (error: unknown) =>
      error instanceof ProductRepositoryError && error.code === "INVALID_PRODUCT",
  );
  assert.deepEqual(await repository.list(), []);

  await repository.create(productInput);
  await assert.rejects(
    () => repository.create(productInput),
    (error: unknown) =>
      error instanceof ProductRepositoryError && error.code === "DUPLICATE_SLUG",
  );
  assert.equal((await repository.list()).length, 1);
});

test("in-memory repository preserves unrelated records for missing updates and can reset fixtures", async () => {
  const repository = new InMemoryProductRepository([]);
  const created = await repository.create(productInput);

  assert.equal(await repository.update("missing", { name: "Should not save" }), undefined);
  assert.equal((await repository.findById(created.id))?.name, productInput.name);

  repository.reset([]);
  assert.deepEqual(await repository.list(), []);
});
