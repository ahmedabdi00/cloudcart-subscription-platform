import { loadStripe } from "@stripe/stripe-js";

export const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY!);

export async function createPaymentIntent(amount: number) {
  const response = await fetch("/api/create-payment-intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount }),
  });
  
  return response.json();
}

export async function confirmPayment(clientSecret: string, paymentMethod: any) {
  const stripe = await stripePromise;
  if (!stripe) throw new Error("Stripe failed to initialize");

  return stripe.confirmCardPayment(clientSecret, {
    payment_method: paymentMethod,
  });
}
