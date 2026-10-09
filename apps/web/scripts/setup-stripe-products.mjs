// One-time setup: creates the "MedPrep Institute Membership" Stripe Product
// and its three recurring Prices (monthly / quarterly / yearly), each with a
// 7-day trial. Safe to re-run — it looks for an existing product/price by
// name first instead of creating duplicates.
//
// Usage: node --env-file=.env.local scripts/setup-stripe-products.mjs
// Requires STRIPE_SECRET_KEY in .env.local. Prints the price ids to paste
// into .env.local as STRIPE_PRICE_ID_MONTHLY / _QUARTERLY / _YEARLY.
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Missing STRIPE_SECRET_KEY in .env.local');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRODUCT_NAME = 'MedPrep Institute Membership';

const PRICES = [
  // Monthly and Quarterly got new nicknames so this creates fresh Price
  // objects instead of matching (by nickname) the old $40 / $110 ones.
  // Stripe Prices are immutable once created, so a price change always needs
  // a new object, never an edit of the old one. The old prices are left
  // alone (not archived) so any subscriber still on them keeps billing
  // normally. Yearly is unchanged, so it keeps its original nickname and
  // reuses the existing price.
  { key: 'MONTHLY', nickname: 'Monthly v2 (2026-10)', unitAmount: 8000, interval: 'month', intervalCount: 1 },
  { key: 'QUARTERLY', nickname: '3-Month v2 (2026-10)', unitAmount: 13000, interval: 'month', intervalCount: 3 },
  { key: 'YEARLY', nickname: 'Annual', unitAmount: 40000, interval: 'year', intervalCount: 1 },
];

async function findExistingProduct() {
  const products = await stripe.products.search({ query: `name:'${PRODUCT_NAME}'` });
  return products.data[0] ?? null;
}

async function findExistingPrice(productId, nickname) {
  const prices = await stripe.prices.list({ product: productId, limit: 100 });
  return prices.data.find((p) => p.nickname === nickname) ?? null;
}

async function main() {
  let product = await findExistingProduct();
  if (product) {
    console.log('Using existing product:', product.id);
  } else {
    product = await stripe.products.create({ name: PRODUCT_NAME });
    console.log('Created product:', product.id);
  }

  const results = {};
  for (const { key, nickname, unitAmount, interval, intervalCount } of PRICES) {
    let price = await findExistingPrice(product.id, nickname);
    if (price) {
      console.log(`Using existing price for ${nickname}:`, price.id);
    } else {
      price = await stripe.prices.create({
        product: product.id,
        nickname,
        currency: 'usd',
        unit_amount: unitAmount,
        recurring: { interval, interval_count: intervalCount },
      });
      console.log(`Created price for ${nickname}:`, price.id);
    }
    results[key] = price.id;
  }

  console.log('\nPaste these into apps/web/.env.local:\n');
  console.log(`STRIPE_PRICE_ID_MONTHLY=${results.MONTHLY}`);
  console.log(`STRIPE_PRICE_ID_QUARTERLY=${results.QUARTERLY}`);
  console.log(`STRIPE_PRICE_ID_YEARLY=${results.YEARLY}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
