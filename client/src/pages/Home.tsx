import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Package, Repeat, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Your Personalized Subscription Solution
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          CloudCart delivers your favorite products right to your door, on your schedule.
          Customize your subscription and enjoy hassle-free deliveries.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/subscription">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="space-y-4 text-center p-6 rounded-lg border bg-card">
          <Package className="w-10 h-10 mx-auto text-primary" />
          <h3 className="text-xl font-semibold">Curated Selection</h3>
          <p className="text-muted-foreground">
            Choose from top brands and products, all vetted for quality and satisfaction.
          </p>
        </div>
        <div className="space-y-4 text-center p-6 rounded-lg border bg-card">
          <Repeat className="w-10 h-10 mx-auto text-primary" />
          <h3 className="text-xl font-semibold">Flexible Delivery</h3>
          <p className="text-muted-foreground">
            Set your preferred delivery schedule - weekly, bi-weekly, or monthly.
          </p>
        </div>
        <div className="space-y-4 text-center p-6 rounded-lg border bg-card">
          <Shield className="w-10 h-10 mx-auto text-primary" />
          <h3 className="text-xl font-semibold">Secure & Reliable</h3>
          <p className="text-muted-foreground">
            Safe payments and guaranteed delivery with our trusted service.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary/10 to-purple-600/10 p-8 rounded-2xl text-center space-y-6">
        <h2 className="text-3xl font-bold">Ready to Start Your Journey?</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Join thousands of satisfied customers who have simplified their shopping
          experience with CloudCart's subscription service.
        </p>
        <Button asChild size="lg">
          <Link href="/auth">Create Account</Link>
        </Button>
      </section>
    </div>
  );
}
