/*
  Warnings:

  - You are about to drop the column `balance` on the `Player` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "_SessionPlayers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_SessionPlayers_A_fkey" FOREIGN KEY ("A") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_SessionPlayers_B_fkey" FOREIGN KEY ("B") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Player" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Player" ("id", "name") SELECT "id", "name" FROM "Player";
DROP TABLE "Player";
ALTER TABLE "new_Player" RENAME TO "Player";
CREATE UNIQUE INDEX "Player_name_key" ON "Player"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_SessionPlayers_AB_unique" ON "_SessionPlayers"("A", "B");

-- CreateIndex
CREATE INDEX "_SessionPlayers_B_index" ON "_SessionPlayers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Session_name_key" ON "Session"("name");
