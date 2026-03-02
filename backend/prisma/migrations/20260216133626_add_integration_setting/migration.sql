/*
  Warnings:

  - A unique constraint covering the columns `[contract_number,tenantId]` on the table `Contract` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenantId` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `ContractSigner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `SigningSession` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Contract_contract_number_key";

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "tenantId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "ContractSigner" ADD COLUMN     "tenantId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "SigningSession" ADD COLUMN     "tenantId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" UUID NOT NULL,
    "role" "Role" NOT NULL,
    "module" TEXT NOT NULL,
    "allowed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractTemplate" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "contract_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractClause" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "templateId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractClause_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractApproval" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "contractId" UUID NOT NULL,
    "requestedBy" UUID NOT NULL,
    "decidedBy" UUID,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "comment" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractSignatureRequest" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "contractId" UUID NOT NULL,
    "signerEmail" TEXT NOT NULL,
    "signerName" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "viewedAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractSignatureRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractAuditLog" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "contractId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" UUID NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractVersion" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "contractId" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "content" TEXT NOT NULL,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationTemplate" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationRule" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "eventType" TEXT NOT NULL,
    "templateId" UUID,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationDeliveryLog" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "eventType" TEXT,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "templateId" UUID,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "error" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationDeliveryLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationSetting" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "publicApiEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_role_module_key" ON "RolePermission"("role", "module");

-- CreateIndex
CREATE INDEX "ContractTemplate_tenantId_idx" ON "ContractTemplate"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ContractTemplate_id_tenantId_key" ON "ContractTemplate"("id", "tenantId");

-- CreateIndex
CREATE INDEX "ContractClause_tenantId_idx" ON "ContractClause"("tenantId");

-- CreateIndex
CREATE INDEX "ContractApproval_tenantId_idx" ON "ContractApproval"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ContractSignatureRequest_token_key" ON "ContractSignatureRequest"("token");

-- CreateIndex
CREATE INDEX "ContractSignatureRequest_tenantId_idx" ON "ContractSignatureRequest"("tenantId");

-- CreateIndex
CREATE INDEX "ContractAuditLog_tenantId_idx" ON "ContractAuditLog"("tenantId");

-- CreateIndex
CREATE INDEX "ContractVersion_tenantId_idx" ON "ContractVersion"("tenantId");

-- CreateIndex
CREATE INDEX "NotificationTemplate_tenantId_idx" ON "NotificationTemplate"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTemplate_id_tenantId_key" ON "NotificationTemplate"("id", "tenantId");

-- CreateIndex
CREATE INDEX "NotificationRule_tenantId_idx" ON "NotificationRule"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationRule_id_tenantId_key" ON "NotificationRule"("id", "tenantId");

-- CreateIndex
CREATE INDEX "NotificationDeliveryLog_tenantId_idx" ON "NotificationDeliveryLog"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationDeliveryLog_id_tenantId_key" ON "NotificationDeliveryLog"("id", "tenantId");

-- CreateIndex
CREATE INDEX "IntegrationSetting_tenantId_idx" ON "IntegrationSetting"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationSetting_id_tenantId_key" ON "IntegrationSetting"("id", "tenantId");

-- CreateIndex
CREATE INDEX "Contract_tenantId_idx" ON "Contract"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_contract_number_tenantId_key" ON "Contract"("contract_number", "tenantId");

-- CreateIndex
CREATE INDEX "ContractSigner_tenantId_idx" ON "ContractSigner"("tenantId");

-- CreateIndex
CREATE INDEX "SigningSession_tenantId_idx" ON "SigningSession"("tenantId");

-- AddForeignKey
ALTER TABLE "ContractClause" ADD CONSTRAINT "ContractClause_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ContractTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractApproval" ADD CONSTRAINT "ContractApproval_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractSignatureRequest" ADD CONSTRAINT "ContractSignatureRequest_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractAuditLog" ADD CONSTRAINT "ContractAuditLog_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractVersion" ADD CONSTRAINT "ContractVersion_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
