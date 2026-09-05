import { randomUUID } from "node:crypto";

export type PaymentApproval = {
  reference: string;
};

type PaymentServiceErrorCode =
  | "PAYMENT_DECLINED"
  | "INVALID_PAYMENT_TOKEN"
  | "INVALID_PAYMENT_AMOUNT";

export class PaymentServiceError extends Error {
  readonly code: PaymentServiceErrorCode;

  constructor(code: PaymentServiceErrorCode, message: string) {
    super(message);
    this.name = "PaymentServiceError";
    this.code = code;
  }
}

export function simulatePayment(token: string, totalPriceInr: number): PaymentApproval {
  if (!Number.isSafeInteger(totalPriceInr) || totalPriceInr <= 0) {
    throw new PaymentServiceError(
      "INVALID_PAYMENT_AMOUNT",
      "Payment amount must be a positive safe integer.",
    );
  }
  if (token === "tok_simulated_decline") {
    throw new PaymentServiceError(
      "PAYMENT_DECLINED",
      "The simulated payment was declined.",
    );
  }
  if (token !== "tok_simulated_success") {
    throw new PaymentServiceError(
      "INVALID_PAYMENT_TOKEN",
      "Payment token is invalid.",
    );
  }
  return { reference: `pay_${randomUUID()}` };
}
