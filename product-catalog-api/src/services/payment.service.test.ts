import assert from "node:assert/strict";
import test from "node:test";
import { PaymentServiceError, simulatePayment } from "./payment.service.js";

test("successful simulated payment returns a UUID-backed reference", () => {
  const approval = simulatePayment("tok_simulated_success", 1_000);
  assert.match(approval.reference, /^pay_[0-9a-f-]{36}$/);
});

test("decline and unknown tokens return distinct stable errors", () => {
  assert.throws(
    () => simulatePayment("tok_simulated_decline", 1_000),
    (error) => error instanceof PaymentServiceError && error.code === "PAYMENT_DECLINED",
  );
  assert.throws(
    () => simulatePayment("unknown", 1_000),
    (error) => error instanceof PaymentServiceError && error.code === "INVALID_PAYMENT_TOKEN",
  );
});

test("payment rejects invalid amounts", () => {
  for (const amount of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(
      () => simulatePayment("tok_simulated_success", amount),
      (error) => error instanceof PaymentServiceError && error.code === "INVALID_PAYMENT_AMOUNT",
    );
  }
});
