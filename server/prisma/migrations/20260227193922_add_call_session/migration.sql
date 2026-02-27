-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MSME', 'LENDER', 'ADMIN', 'CONTROLLER');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('NOT_SUBMITTED', 'IN_PROGRESS', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'VERIFIED', 'OPEN_FOR_FUNDING', 'FUNDED', 'SETTLED', 'CLOSED');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('ACTIVE', 'CLOSED', 'DEFAULTED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('INITIATED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "LenderType" AS ENUM ('BANK', 'NBFC', 'REGISTERED_COMPANY', 'INDIVIDUAL_INVESTOR', 'OTHER_FINANCIAL_ENTITY');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('NOT_SUBMITTED', 'IN_REVIEW', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('INITIATED', 'ONGOING', 'ENDED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MSME',
    "gstin" TEXT,
    "business_age" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "riskScore" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gstNumber" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessStartDate" TIMESTAMP(3) NOT NULL,
    "businessAddress" TEXT NOT NULL,
    "turnover" DOUBLE PRECISION NOT NULL,
    "stateCode" TEXT NOT NULL,
    "panNumber" TEXT NOT NULL,
    "gstCertificateUrl" TEXT,
    "status" "KycStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "adminRemark" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kyc_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "buyer_gstin" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "gst_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "invoice_number" TEXT,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_scores" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "risk_level" "RiskLevel" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bids" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "lender_id" TEXT NOT NULL,
    "interest_rate" DECIMAL(5,2) NOT NULL,
    "funding_percent" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "funded_amount" DECIMAL(15,2) NOT NULL,
    "interest" DECIMAL(15,2) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'INITIATED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fraud_flags" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fraud_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "featureKey" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_risk_analysis" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "creditScore" INTEGER NOT NULL,
    "fraudScore" INTEGER NOT NULL,
    "fraudProbability" DOUBLE PRECISION NOT NULL,
    "finalScore" INTEGER NOT NULL,
    "creditRiskBand" TEXT NOT NULL,
    "fraudRiskBand" TEXT NOT NULL,
    "breakdownJSON" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_risk_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lender_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lenderType" "LenderType" NOT NULL,
    "organizationName" TEXT,
    "registrationNumber" TEXT,
    "rbiLicenseNumber" TEXT,
    "gstNumber" TEXT,
    "panNumber" TEXT,
    "contactPersonName" TEXT,
    "contactPhone" TEXT,
    "officialEmail" TEXT,
    "capitalRange" TEXT,
    "riskPreference" TEXT,
    "bankAccountNumber" TEXT,
    "ifscCode" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "adminRemark" TEXT,
    "totalFundedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDealsFunded" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lender_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funding_offers" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "fundedAmount" DECIMAL(15,2) NOT NULL,
    "interestRate" DECIMAL(5,2) NOT NULL,
    "interestAmount" DECIMAL(15,2) NOT NULL,
    "platformFee" DECIMAL(15,2) NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funding_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "msmeId" TEXT NOT NULL,
    "invoiceAmount" DECIMAL(15,2) NOT NULL,
    "fundedAmount" DECIMAL(15,2) NOT NULL,
    "interestAmount" DECIMAL(15,2) NOT NULL,
    "platformFee" DECIMAL(15,2) NOT NULL,
    "totalPayableToLender" DECIMAL(15,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "DealStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_sessions" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "msmeId" TEXT NOT NULL,
    "status" "CallStatus" NOT NULL,
    "roomToken" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "durationSec" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "availableBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "lockedBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalEarnings" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_records_userId_key" ON "kyc_records"("userId");

-- CreateIndex
CREATE INDEX "invoices_user_id_idx" ON "invoices"("user_id");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE UNIQUE INDEX "credit_scores_invoice_id_key" ON "credit_scores"("invoice_id");

-- CreateIndex
CREATE INDEX "bids_invoice_id_idx" ON "bids"("invoice_id");

-- CreateIndex
CREATE INDEX "bids_lender_id_idx" ON "bids"("lender_id");

-- CreateIndex
CREATE INDEX "transactions_invoice_id_idx" ON "transactions"("invoice_id");

-- CreateIndex
CREATE INDEX "fraud_flags_userId_idx" ON "fraud_flags"("userId");

-- CreateIndex
CREATE INDEX "fraud_flags_invoiceId_idx" ON "fraud_flags"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_featureKey_key" ON "feature_flags"("featureKey");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_risk_analysis_invoiceId_key" ON "invoice_risk_analysis"("invoiceId");

-- CreateIndex
CREATE INDEX "invoice_risk_analysis_invoiceId_idx" ON "invoice_risk_analysis"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "lender_profiles_userId_key" ON "lender_profiles"("userId");

-- CreateIndex
CREATE INDEX "lender_profiles_userId_idx" ON "lender_profiles"("userId");

-- CreateIndex
CREATE INDEX "funding_offers_invoiceId_idx" ON "funding_offers"("invoiceId");

-- CreateIndex
CREATE INDEX "funding_offers_lenderId_idx" ON "funding_offers"("lenderId");

-- CreateIndex
CREATE UNIQUE INDEX "deals_invoiceId_key" ON "deals"("invoiceId");

-- CreateIndex
CREATE INDEX "deals_lenderId_idx" ON "deals"("lenderId");

-- CreateIndex
CREATE INDEX "deals_msmeId_idx" ON "deals"("msmeId");

-- CreateIndex
CREATE UNIQUE INDEX "call_sessions_dealId_key" ON "call_sessions"("dealId");

-- CreateIndex
CREATE INDEX "call_sessions_lenderId_idx" ON "call_sessions"("lenderId");

-- CreateIndex
CREATE INDEX "call_sessions_msmeId_idx" ON "call_sessions"("msmeId");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_key" ON "wallets"("userId");

-- AddForeignKey
ALTER TABLE "kyc_records" ADD CONSTRAINT "kyc_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_scores" ADD CONSTRAINT "credit_scores_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fraud_flags" ADD CONSTRAINT "fraud_flags_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fraud_flags" ADD CONSTRAINT "fraud_flags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_risk_analysis" ADD CONSTRAINT "invoice_risk_analysis_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lender_profiles" ADD CONSTRAINT "lender_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding_offers" ADD CONSTRAINT "funding_offers_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding_offers" ADD CONSTRAINT "funding_offers_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_msmeId_fkey" FOREIGN KEY ("msmeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_sessions" ADD CONSTRAINT "call_sessions_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_sessions" ADD CONSTRAINT "call_sessions_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_sessions" ADD CONSTRAINT "call_sessions_msmeId_fkey" FOREIGN KEY ("msmeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
