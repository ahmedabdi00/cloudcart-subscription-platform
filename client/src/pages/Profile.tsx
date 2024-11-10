import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Settings, CreditCard } from "lucide-react";
import type { Subscription } from "db/schema";

export default function Profile() {
  const { user, logout } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: subscription } = useSWR<Subscription>("/api/subscriptions");

  if (!user) {
    setLocation("/auth");
    return null;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">My Profile</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue={user.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user.email} />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
            <CardDescription>Manage your subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status</span>
                  <span className="text-sm capitalize">{subscription.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Next Delivery</span>
                  <span className="text-sm">
                    {new Date(subscription.nextDelivery).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Frequency</span>
                  <span className="text-sm capitalize">
                    {subscription.frequency}
                  </span>
                </div>
                <Button variant="outline" className="w-full">
                  Manage Subscription
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No active subscription</p>
                <Button asChild className="mt-4">
                  <a href="/subscription">Start Subscription</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Button variant="destructive" onClick={() => logout()}>
        Sign Out
      </Button>
    </div>
  );
}
