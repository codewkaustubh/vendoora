-- Browse Categories taxonomy: two-level Category hierarchy (parentId),
-- curated ordering (sortOrder) and the internal-system flag (isSystem) that
-- keeps the "General" fallback out of customer-facing taxonomy responses.

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false;

-- Backfill the pre-existing "General" fallback row so the internal-system
-- contract also holds for databases seeded before this migration.
UPDATE "Category" SET "isSystem" = true WHERE "slug" = 'general';

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
