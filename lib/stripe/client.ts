import Stripe from "stripe";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripeClient = new Stripe(process.env.STRIPE_SK as string) as any;

export default stripeClient;
