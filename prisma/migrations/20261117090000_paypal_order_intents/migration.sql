-- PayPal checkout intents + webhook dedupe.
--
-- Additive only: two new tables and their indexes. No existing column is
-- altered or dropped, so current entitlements and payments are untouched.

-- CreateTable
CREATE TABLE "PaypalOrder" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planCode" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paypalOrderId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "captureId" TEXT,
    "captureStatus" TEXT,
    "payerId" TEXT,
    "merchantId" TEXT,
    "grantedAt" TIMESTAMP(3),
    "failureCode" TEXT,
    "failureDetail" TEXT,
    "refundedAt" TIMESTAMP(3),
    "refundId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaypalOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "payload" TEXT NOT NULL,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaypalOrder_ref_key" ON "PaypalOrder"("ref");
CREATE UNIQUE INDEX "PaypalOrder_paypalOrderId_key" ON "PaypalOrder"("paypalOrderId");
CREATE UNIQUE INDEX "PaypalOrder_captureId_key" ON "PaypalOrder"("captureId");
CREATE INDEX "PaypalOrder_userId_createdAt_idx" ON "PaypalOrder"("userId", "createdAt");
CREATE INDEX "PaypalOrder_status_createdAt_idx" ON "PaypalOrder"("status", "createdAt");
CREATE INDEX "WebhookEvent_processedAt_receivedAt_idx" ON "WebhookEvent"("processedAt", "receivedAt");

-- AddForeignKey
ALTER TABLE "PaypalOrder" ADD CONSTRAINT "PaypalOrder_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
