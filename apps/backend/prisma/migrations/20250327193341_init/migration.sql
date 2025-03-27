-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobOrder" (
    "id" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTemplate" (
    "id" TEXT NOT NULL,
    "jobOrderId" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "ProductTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTemplate_jobOrderId_key" ON "ProductTemplate"("jobOrderId");
