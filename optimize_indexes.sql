-- Optimizing for dashboard and voronka filters
CREATE INDEX IF NOT EXISTS "idx_order_status" ON "Order" ("status");
CREATE INDEX IF NOT EXISTS "idx_order_created_at" ON "Order" ("createdAt");
CREATE INDEX IF NOT EXISTS "idx_customer_phone" ON "Customer" ("phone");
CREATE INDEX IF NOT EXISTS "idx_customer_created_at" ON "Customer" ("createdAt");
CREATE INDEX IF NOT EXISTS "idx_order_item_product" ON "OrderItem" ("productId");
