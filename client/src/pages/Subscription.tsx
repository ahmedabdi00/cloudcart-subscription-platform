import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import SubscriptionPlan from "@/components/SubscriptionPlan";
import StripePayment from "@/components/StripePayment";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPaymentIntent } from "@/lib/stripe";

export type Plan = {
  name: string;
  price: number;
  features: string[];
};

const plans: Plan[] = [
  {
    name: "Starter",
    price: 29.99,
    features: [
      "Flexible delivery schedule",
      "Up to 3 products",
      "Basic customization",
      "Email support",
    ],
  },
  {
    name: "Premium",
    price: 49.99,
    features: [
      "Priority delivery options",
      "Up to 5 products",
      "Full customization",
      "Priority support",
      "Free shipping",
    ],
  },
  {
    name: "Ultimate",
    price: 79.99,
    features: [
      "Custom delivery schedule",
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
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [frequencyType, setFrequencyType] = useState<string>("monthly");
  const [customFrequency, setCustomFrequency] = useState<number>(30);
  const [deliveryDay, setDeliveryDay] = useState<number>(1);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
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
      setClientSecret(clientSecret);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process subscription",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ id: 1, quantity: 1, price: selectedPlan?.price }],
          frequencyType,
          customFrequency: frequencyType === "custom" ? customFrequency : undefined,
          deliveryDay: ["weekly", "biweekly", "monthly"].includes(frequencyType)
            ? deliveryDay
            : undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to create subscription");

      toast({
        title: "Subscription activated",
        description: "Your subscription has been successfully activated!",
      });
      setLocation("/profile");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate subscription",
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

      {selectedPlan && (
        <div className="max-w-md mx-auto space-y-4 border rounded-lg p-4">
          <h2 className="text-xl font-semibold">Delivery Preferences</h2>
          
          <div className="space-y-2">
            <Label htmlFor="frequency">Delivery Frequency</Label>
            <Select
              value={frequencyType}
              onValueChange={setFrequencyType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {frequencyType === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="customDays">Days between deliveries</Label>
              <Input
                id="customDays"
                type="number"
                min="1"
                max="90"
                value={customFrequency}
                onChange={(e) => setCustomFrequency(parseInt(e.target.value))}
              />
            </div>
          )}

          {["weekly", "biweekly", "monthly"].includes(frequencyType) && (
            <div className="space-y-2">
              <Label htmlFor="deliveryDay">
                Preferred {frequencyType === "monthly" ? "Day of Month" : "Day of Week"}
              </Label>
              <Input
                id="deliveryDay"
                type="number"
                min={frequencyType === "monthly" ? "1" : "0"}
                max={frequencyType === "monthly" ? "28" : "6"}
                value={deliveryDay}
                onChange={(e) => setDeliveryDay(parseInt(e.target.value))}
              />
              <p className="text-sm text-muted-foreground">
                {frequencyType === "monthly"
                  ? "Enter a day between 1-28"
                  : "Enter 0-6 (Sunday-Saturday)"}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="text-center">
        <Button size="lg" onClick={handleSubscribe}>
          {user ? "Subscribe Now" : "Sign in to Subscribe"}
        </Button>
      </div>

      <Dialog open={!!clientSecret} onOpenChange={() => setClientSecret(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete your subscription</DialogTitle>
            <DialogDescription>
              Enter your payment details to start your subscription
            </DialogDescription>
          </DialogHeader>
          {clientSecret && (
            <StripePayment
              clientSecret={clientSecret}
              onSuccess={handlePaymentSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
