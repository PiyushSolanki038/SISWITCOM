/*
  Warnings:

  - A unique constraint covering the columns `[id,tenantId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId]` on the table `Activity` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId]` on the table `Note` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId]` on the table `Opportunity` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "tenantId" UUID;

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "tenantId" UUID;

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "tenantId" UUID;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "tenantId" UUID;

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "tenantId" UUID;

-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "pipelineStageId" UUID,
ADD COLUMN     "tenantId" UUID;

-- CreateTable
CREATE TABLE "PipelineStage" (
    "id" UUID NOT NULL,
    "tenantId" UUID,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PipelineStage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PipelineStage_id_tenantId_key" ON "PipelineStage"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_id_tenantId_key" ON "Account"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_id_tenantId_key" ON "Activity"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_id_tenantId_key" ON "Contact"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_id_tenantId_key" ON "Lead"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Note_id_tenantId_key" ON "Note"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Opportunity_id_tenantId_key" ON "Opportunity"("id", "tenantId");

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_pipelineStageId_fkey" FOREIGN KEY ("pipelineStageId") REFERENCES "PipelineStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
