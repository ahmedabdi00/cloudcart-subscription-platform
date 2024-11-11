import { pgTable, text, integer, timestamp, decimal, boolean, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'paused', 'cancelled']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'shipped', 'delivered']);
export const frequencyTypeEnum = pgEnum('frequency_type', ['weekly', 'biweekly', 'monthly', 'custom']);

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image").notNull(),
  category: text("category").notNull(),
  brand: text("brand").notNull(),
  inStock: boolean("in_stock").default(true),
  quantity: integer("quantity").notNull().default(0),
});

export const subscriptions = pgTable("subscriptions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: subscriptionStatusEnum("status").notNull().default('active'),
  frequencyType: frequencyTypeEnum("frequency_type").notNull(),
  customFrequency: integer("custom_frequency"), // Days between deliveries for custom frequency
  nextDelivery: timestamp("next_delivery").notNull(),
  lastDelivery: timestamp("last_delivery"),
  deliveryDay: integer("delivery_day"), // Preferred day of week/month
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptionItems = pgTable("subscription_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const orders = pgTable("orders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id).notNull(),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id),
  status: orderStatusEnum("status").notNull().default('pending'),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  scheduledDelivery: timestamp("scheduled_delivery"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);
export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const selectSubscriptionSchema = createSelectSchema(subscriptions);
export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);

export type User = z.infer<typeof selectUserSchema>;
export type Product = z.infer<typeof selectProductSchema>;
export type Subscription = z.infer<typeof selectSubscriptionSchema>;
export type Order = z.infer<typeof selectOrderSchema>;
