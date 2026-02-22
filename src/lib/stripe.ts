import Stripe from "stripe";

export function getStripe(secretKey: string): Stripe {
  return new Stripe(secretKey, {
    // Workers-compatible: use fetch instead of Node http
    httpClient: Stripe.createFetchHttpClient(),
  });
}

export const REPORT_PRICE_CENTS = 799;
export const REPORT_PRICE_DISPLAY = "$7.99";
