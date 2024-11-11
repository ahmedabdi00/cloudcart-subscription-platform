import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CheckoutFormProps {
  onSuccess: () => void;
}

function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/profile`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Payment failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        onSuccess();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || isLoading} className="w-full">
        {isLoading ? "Processing..." : "Pay now"}
      </Button>
    </form>
  );
}

interface StripePaymentProps {
  clientSecret: string;
  onSuccess: () => void;
}

export default function StripePayment({ clientSecret, onSuccess }: StripePaymentProps) {
  const [stripePromise] = useState(() => 
    loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  );

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm onSuccess={onSuccess} />
    </Elements>
  );
}
