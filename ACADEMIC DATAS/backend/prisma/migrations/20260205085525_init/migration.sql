-- CreateTable
CREATE TABLE "Standard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "standardId" TEXT NOT NULL,
    CONSTRAINT "Domain_standardId_fkey" FOREIGN KEY ("standardId") REFERENCES "Standard" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "standardId" TEXT NOT NULL,
    "domainId" TEXT,
    CONSTRAINT "Subject_standardId_fkey" FOREIGN KEY ("standardId") REFERENCES "Standard" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Subject_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "subjectId" TEXT NOT NULL,
    CONSTRAINT "Chapter_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    CONSTRAINT "Note_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Note_chapterId_key" ON "Note"("chapterId");
