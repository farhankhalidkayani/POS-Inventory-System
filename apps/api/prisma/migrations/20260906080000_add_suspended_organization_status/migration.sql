-- AlterEnum
ALTER TYPE "OrganizationStatus" ADD VALUE 'SUSPENDED';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "suspendedAt" TIMESTAMP(3);
