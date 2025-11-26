import type { Price } from "@reactionary/core";
// TODO: Detect user language
const locale = "en-US";

// TODO: Allow users to select region currency (usd | eur)
const regionCurrency = "usd";

export function formatPrice(price: Price | undefined) {
  if (!price) return "";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: price.unitPrice.currency,
  }).format(price.unitPrice.value);
}
