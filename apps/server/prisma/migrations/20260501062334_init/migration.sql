-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "jewels" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "DreamLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "emotions" JSONB NOT NULL,
    "type" TEXT NOT NULL,
    "tarotCards" TEXT,
    "summary" TEXT,
    "analysis" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "DreamLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recentWorry" TEXT,
    "feeling" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserStatus_userId_key" ON "UserStatus"("userId");
