-- AlterEnum
ALTER TYPE "DealStatus" ADD VALUE 'AGREEMENT_PENDING';

-- AlterTable
ALTER TABLE "deals" ALTER COLUMN "status" SET DEFAULT 'AGREEMENT_PENDING';

-- CreateTable
CREATE TABLE "agreements" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "terms" TEXT NOT NULL,
    "msmeSignedAt" TIMESTAMP(3),
    "lenderSignedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agreements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agreements_dealId_key" ON "agreements"("dealId");

-- AddForeignKey
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
