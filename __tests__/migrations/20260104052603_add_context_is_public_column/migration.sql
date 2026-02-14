/*
  Warnings:

  - Added the required column `isPublic` to the `Context` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Context" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Context" ("context", "createdAt", "id", "title", "updatedAt") SELECT "context", "createdAt", "id", "title", "updatedAt" FROM "Context";
DROP TABLE "Context";
ALTER TABLE "new_Context" RENAME TO "Context";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
