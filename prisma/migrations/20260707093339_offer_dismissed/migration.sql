-- AlterTable
ALTER TABLE "JobOffer" ADD COLUMN     "dismissed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dismissedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "JobOffer_userId_dismissed_idx" ON "JobOffer"("userId", "dismissed");

