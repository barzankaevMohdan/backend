-- AlterTable
ALTER TABLE "events" ADD COLUMN     "cameraId" INTEGER;

-- CreateIndex
CREATE INDEX "events_cameraId_idx" ON "events"("cameraId");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "cameras"("id") ON DELETE SET NULL ON UPDATE CASCADE;
