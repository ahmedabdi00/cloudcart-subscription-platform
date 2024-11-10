import { Express } from "express";
import { setupAuth } from "./auth";
import { db } from "db";
import { products, orders, orderItems, subscriptions } from "db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export function registerRoutes(app: Express) {
  setupAuth(app);

  // Products
  app.get("/api/products", async (req, res) => {
    const allProducts = await db.select().from(products);
    res.json(allProducts);
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, req.user.id));
    res.json(userOrders);
  });

  // Create order
  app.post("/api/orders", async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { items, total } = req.body;

    try {
      const [order] = await db
        .insert(orders)
        .values({
          userId: req.user.id,
          total,
          status: "pending",
        })
        .returning();

      await db.insert(orderItems).values(
        items.map((item: any) => ({
          orderId: order.id,
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        }))
      );

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Subscriptions
  app.get("/api/subscriptions", async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, req.user.id));
    res.json(userSubscriptions);
  });

  // Create subscription
  app.post("/api/subscriptions", async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { frequency, nextDelivery } = req.body;

    try {
      const [subscription] = await db
        .insert(subscriptions)
        .values({
          userId: req.user.id,
          frequency,
          nextDelivery,
          status: "active",
        })
        .returning();

      res.json(subscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // Stripe payment intent
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { amount } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "usd",
        metadata: { userId: req.user.id },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(500).json({ message: "Payment initialization failed" });
    }
  });
}
