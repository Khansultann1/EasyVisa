-- CreateTable
CREATE TABLE "ApplicationHistory" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ApplicationHistory" ADD CONSTRAINT "ApplicationHistory_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
