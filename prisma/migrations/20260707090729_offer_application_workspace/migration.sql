-- AlterTable
ALTER TABLE "JobOffer" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "coverLetter" TEXT,
ADD COLUMN     "interested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "interestedAt" TIMESTAMP(3),
ADD COLUMN     "outreachEmail" TEXT;

-- CreateIndex
CREATE INDEX "JobOffer_userId_interested_idx" ON "JobOffer"("userId", "interested");

