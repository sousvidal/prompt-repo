/*
  Warnings:

  - You are about to drop the `Environment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `environmentId` on the `PublishedCommit` table. All the data in the column will be lost.
  - Added the required column `environment` to the `PublishedCommit` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Environment";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PublishedCommit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commitId" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PublishedCommit_commitId_fkey" FOREIGN KEY ("commitId") REFERENCES "Commit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PublishedCommit" ("commitId", "createdAt", "id", "updatedAt") SELECT "commitId", "createdAt", "id", "updatedAt" FROM "PublishedCommit";
DROP TABLE "PublishedCommit";
ALTER TABLE "new_PublishedCommit" RENAME TO "PublishedCommit";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
