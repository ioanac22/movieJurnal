/*
  Warnings:

  - A unique constraint covering the columns `[tmdbId,mediaType]` on the table `Movie` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Movie_tmdbId_key";

-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "mediaType" TEXT NOT NULL DEFAULT 'movie';

-- CreateIndex
CREATE UNIQUE INDEX "Movie_tmdbId_mediaType_key" ON "Movie"("tmdbId", "mediaType");
