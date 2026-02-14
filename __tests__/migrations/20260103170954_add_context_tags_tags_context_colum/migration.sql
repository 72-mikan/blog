-- CreateTable
CREATE TABLE "_ContextToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ContextToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Context" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ContextToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_ContextToTag_AB_unique" ON "_ContextToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ContextToTag_B_index" ON "_ContextToTag"("B");
