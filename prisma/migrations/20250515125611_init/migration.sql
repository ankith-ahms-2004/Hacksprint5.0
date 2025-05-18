-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disease_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "diseaseDetected" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "diagnosisDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disease_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soil_health_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ph" DOUBLE PRECISION NOT NULL,
    "nitrogen" DOUBLE PRECISION NOT NULL,
    "phosphorus" DOUBLE PRECISION NOT NULL,
    "potassium" DOUBLE PRECISION NOT NULL,
    "organicMatter" DOUBLE PRECISION NOT NULL,
    "region" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soil_health_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_queries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "crop" TEXT,
    "queriedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gptAdvice" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weather_queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commodity_queries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "dateRange" TEXT NOT NULL,
    "queriedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commodity_queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gpt_alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gpt_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "disease_reports_userId_idx" ON "disease_reports"("userId");

-- CreateIndex
CREATE INDEX "soil_health_reports_userId_idx" ON "soil_health_reports"("userId");

-- CreateIndex
CREATE INDEX "weather_queries_userId_idx" ON "weather_queries"("userId");

-- CreateIndex
CREATE INDEX "commodity_queries_userId_idx" ON "commodity_queries"("userId");

-- CreateIndex
CREATE INDEX "gpt_alerts_userId_idx" ON "gpt_alerts"("userId");

-- AddForeignKey
ALTER TABLE "disease_reports" ADD CONSTRAINT "disease_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soil_health_reports" ADD CONSTRAINT "soil_health_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weather_queries" ADD CONSTRAINT "weather_queries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commodity_queries" ADD CONSTRAINT "commodity_queries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gpt_alerts" ADD CONSTRAINT "gpt_alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
