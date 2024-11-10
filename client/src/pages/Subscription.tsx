import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import SubscriptionPlan from "@/components/SubscriptionPlan";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createPaymentIntent, confirmPayment } from "@/lib/stripe";

const plans = [
  {
    name: "Starter",
    price: 29.99,
    frequency: "month",
    features: [
      "Monthly delivery",
      "Up to 3 products",
      "Basic customization",
      "Email support",
    ],
  },
  {
    name: "Premium",
    price: 49.99,
    frequency: "month",
    features: [
      "Bi-weekly delivery",
      "Up to 5 products",
      "Full customization",
      "Priority support",
      "Free shipping",
    ],
  },
  {
    name: "Ultimate",
    price: 79.99,
    frequency: "month",
    features: [
      "Weekly delivery",
      "Unlimited products",
      "Premium customization",
      "24/7 support",
      "Express shipping",
      "Exclusive products",
    ],
  },
];

export default function Subscription() {
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    if (!user) {
      setLocation("/auth");
      return;
    }

    if (!selectedPlan) {
      toast({
        title: "Please select a plan",
        description: "Choose a subscription plan to continue.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { clientSecret } = await createPaymentIntent(selectedPlan.price);
      // In a real app, you'd integrate Stripe Elements here
      const { error } = await confirmPayment(clientSecret, {
        payment_method: { card: { /* card details */ } },
      });

      if (error) {
        toast({
          title: "Payment failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Subscription activated",
          description: "Your subscription has been successfully activated!",
        });
        setLocation("/profile");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process subscription",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select the subscription plan that best fits your needs. All plans include
          access to our premium products and flexible delivery options.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <SubscriptionPlan
            key={plan.name}
            plan={plan}
            isSelected={selectedPlan?.name === plan.name}
            onSelect={setSelectedPlan}
          />
        ))}
      </div>

      <div className="text-center">
        <Button size="lg" onClick={handleSubscribe}>
          {user ? "Subscribe Now" : "Sign in to Subscribe"}
        </Button>
      </div>
    </div>
  );
}
