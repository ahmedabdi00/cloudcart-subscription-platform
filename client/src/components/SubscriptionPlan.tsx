import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface Plan {
  name: string;
  price: number;
  features: string[];
}

interface SubscriptionPlanProps {
  plan: Plan;
  isSelected: boolean;
  onSelect: (plan: Plan) => void;
}

export default function SubscriptionPlan({
  plan,
  isSelected,
  onSelect,
}: SubscriptionPlanProps) {
  return (
    <Card className={`relative ${isSelected ? "border-primary" : ""}`}>
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">${plan.price}</span>
          <span className="text-muted-foreground ml-2">/month</span>
        </div>
        <ul className="mt-4 space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          variant={isSelected ? "secondary" : "default"}
          className="w-full"
          onClick={() => onSelect(plan)}
        >
          {isSelected ? "Selected" : "Choose Plan"}
        </Button>
      </CardFooter>
    </Card>
  );
}
