/*
  Warnings:

  - A unique constraint covering the columns `[id,tenantId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId]` on the table `Quote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenantId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `QuoteItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'APPROVAL_PENDING', 'APPROVED', 'REJECTED', 'ACCEPTED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "tenantId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "tenantId" UUID NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "QuoteStatus" NOT NULL;

-- AlterTable
ALTER TABLE "QuoteItem" ADD COLUMN     "tenantId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "QuoteApproval" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "quoteId" UUID NOT NULL,
    "requestedBy" UUID NOT NULL,
    "decidedBy" UUID,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteApproval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuoteApproval_tenantId_idx" ON "QuoteApproval"("tenantId");

-- CreateIndex
CREATE INDEX "Product_tenantId_idx" ON "Product"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_id_tenantId_key" ON "Product"("id", "tenantId");

-- CreateIndex
CREATE INDEX "Quote_tenantId_idx" ON "Quote"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_id_tenantId_key" ON "Quote"("id", "tenantId");

-- CreateIndex
CREATE INDEX "QuoteItem_tenantId_idx" ON "QuoteItem"("tenantId");

-- AddForeignKey
ALTER TABLE "QuoteApproval" ADD CONSTRAINT "QuoteApproval_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
