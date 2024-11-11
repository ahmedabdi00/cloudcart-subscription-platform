import { Express } from "express";
import { setupAuth } from "./auth";
import { db } from "db";
import { products, orders, orderItems, subscriptions, subscriptionItems } from "db/schema";
import { eq, and, gte } from "drizzle-orm";
import Stripe from "stripe";
import { addDays, addWeeks, addMonths, startOfWeek, setDay, isFuture } from "date-fns";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

function calculateNextDeliveryDate(frequencyType: string, customFrequency?: number, deliveryDay?: number, baseDate: Date = new Date()) {
  const now = baseDate;
  let nextDelivery: Date;
  
  switch (frequencyType) {
    case 'weekly':
      nextDelivery = deliveryDay !== undefined 
        ? setDay(startOfWeek(addWeeks(now, 1)), deliveryDay)
        : addWeeks(now, 1);
      break;
    case 'biweekly':
      nextDelivery = deliveryDay !== undefined
        ? setDay(startOfWeek(addWeeks(now, 2)), deliveryDay)
        : addWeeks(now, 2);
      break;
    case 'monthly':
      if (deliveryDay !== undefined) {
        // Handle month end cases
        nextDelivery = new Date(now.getFullYear(), now.getMonth() + 1, Math.min(deliveryDay, 28));
      } else {
        nextDelivery = addMonths(now, 1);
      }
      break;
    case 'custom':
      nextDelivery = customFrequency 
        ? addDays(now, customFrequency)
        : addMonths(now, 1);
      break;
    default:
      nextDelivery = addMonths(now, 1);
  }

  // Ensure delivery date is in the future
  return isFuture(nextDelivery) ? nextDelivery : addDays(nextDelivery, 1);
}

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

    const { items, total, subscriptionId, scheduledDelivery } = req.body;

    try {
      const [order] = await db
        .insert(orders)
        .values({
          userId: req.user.id,
          total,
          status: "pending",
          subscriptionId: subscriptionId || null,
          scheduledDelivery: scheduledDelivery || null,
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

      // If this is a subscription order, update the subscription's lastDelivery
      if (subscriptionId) {
        await db
          .update(subscriptions)
          .set({ lastDelivery: new Date() })
          .where(eq(subscriptions.id, subscriptionId));
      }

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
      
    const subscriptionsWithItems = await Promise.all(
      userSubscriptions.map(async (sub) => {
        const items = await db
          .select()
          .from(subscriptionItems)
          .where(eq(subscriptionItems.subscriptionId, sub.id));
        return { ...sub, items };
      })
    );
    
    res.json(subscriptionsWithItems);
  });

  // Create subscription
  app.post("/api/subscriptions", async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { 
      items,
      frequencyType,
      customFrequency,
      deliveryDay 
    } = req.body;

    try {
      const nextDelivery = calculateNextDeliveryDate(
        frequencyType,
        customFrequency,
        deliveryDay
      );

      const [subscription] = await db
        .insert(subscriptions)
        .values({
          userId: req.user.id,
          frequencyType,
          customFrequency: frequencyType === 'custom' ? customFrequency : null,
          deliveryDay: ['weekly', 'biweekly', 'monthly'].includes(frequencyType) ? deliveryDay : null,
          nextDelivery,
          status: "active",
        })
        .returning();

      await db.insert(subscriptionItems).values(
        items.map((item: any) => ({
          subscriptionId: subscription.id,
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        }))
      );

      // Create first order for the subscription
      const total = items.reduce((sum: number, item: any) => 
        sum + (item.price * item.quantity), 0
      );

      await db.insert(orders).values({
        userId: req.user.id,
        subscriptionId: subscription.id,
        total,
        status: "pending",
        scheduledDelivery: nextDelivery,
      });

      res.json(subscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // Update subscription
  app.patch("/api/subscriptions/:id", async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { 
      frequencyType,
      customFrequency,
      deliveryDay,
      status 
    } = req.body;

    try {
      const nextDelivery = calculateNextDeliveryDate(
        frequencyType,
        customFrequency,
        deliveryDay
      );

      const [subscription] = await db
        .update(subscriptions)
        .set({
          frequencyType,
          customFrequency: frequencyType === 'custom' ? customFrequency : null,
          deliveryDay: ['weekly', 'biweekly', 'monthly'].includes(frequencyType) ? deliveryDay : null,
          status,
          nextDelivery,
        })
        .where(
          and(
            eq(subscriptions.id, parseInt(req.params.id)),
            eq(subscriptions.userId, req.user.id)
          )
        )
        .returning();

      if (subscription && subscription.status === 'active') {
        // Create next scheduled order
        const items = await db
          .select()
          .from(subscriptionItems)
          .where(eq(subscriptionItems.subscriptionId, subscription.id));

        const total = items.reduce((sum, item) => 
          sum + (Number(item.price) * item.quantity), 0
        );

        await db.insert(orders).values({
          userId: req.user.id,
          subscriptionId: subscription.id,
          total,
          status: "pending",
          scheduledDelivery: nextDelivery,
        });
      }

      res.json(subscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to update subscription" });
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
