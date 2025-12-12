/*
  Warnings:

  - A unique constraint covering the columns `[fileId]` on the table `posts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "fileId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "posts_fileId_key" ON "posts"("fileId");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
