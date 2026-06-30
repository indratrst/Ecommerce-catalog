-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('NOT_APPLICABLE', 'PENDING_PICKUP', 'PICKED_UP');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "fulfillmentStatus" "FulfillmentStatus" NOT NULL DEFAULT 'NOT_APPLICABLE';
