CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "SubmissionStatus" AS ENUM (
    'UPLOADING', 'PENDING', 'ANALYZING', 'APPROVED', 'REJECTED', 'REVIEW'
);
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');
CREATE TYPE "LeagueRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "username" TEXT,
    "bio" VARCHAR(160),
    "auraBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VideoSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "caption" VARCHAR(280),
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "totalPoints" INTEGER,
    "analysis" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VideoSubmission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "body" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuraTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "submissionId" TEXT,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuraTransaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "addresseeId" TEXT NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "League" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "inviteCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeagueMember" (
    "leagueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "LeagueRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeagueMember_pkey" PRIMARY KEY ("leagueId", "userId")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE INDEX "VideoSubmission_status_createdAt_idx"
ON "VideoSubmission"("status", "createdAt");
CREATE INDEX "VideoSubmission_userId_createdAt_idx"
ON "VideoSubmission"("userId", "createdAt");
CREATE INDEX "Comment_videoId_createdAt_idx"
ON "Comment"("videoId", "createdAt");
CREATE INDEX "Comment_parentId_createdAt_idx"
ON "Comment"("parentId", "createdAt");
CREATE INDEX "AuraTransaction_userId_createdAt_idx"
ON "AuraTransaction"("userId", "createdAt");
CREATE UNIQUE INDEX "Friendship_requesterId_addresseeId_key"
ON "Friendship"("requesterId", "addresseeId");
CREATE UNIQUE INDEX "League_slug_key" ON "League"("slug");
CREATE UNIQUE INDEX "League_inviteCode_key" ON "League"("inviteCode");

ALTER TABLE "VideoSubmission"
ADD CONSTRAINT "VideoSubmission_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment"
ADD CONSTRAINT "Comment_videoId_fkey"
FOREIGN KEY ("videoId") REFERENCES "VideoSubmission"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment"
ADD CONSTRAINT "Comment_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment"
ADD CONSTRAINT "Comment_parentId_fkey"
FOREIGN KEY ("parentId") REFERENCES "Comment"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuraTransaction"
ADD CONSTRAINT "AuraTransaction_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuraTransaction"
ADD CONSTRAINT "AuraTransaction_submissionId_fkey"
FOREIGN KEY ("submissionId") REFERENCES "VideoSubmission"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Friendship"
ADD CONSTRAINT "Friendship_requesterId_fkey"
FOREIGN KEY ("requesterId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Friendship"
ADD CONSTRAINT "Friendship_addresseeId_fkey"
FOREIGN KEY ("addresseeId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeagueMember"
ADD CONSTRAINT "LeagueMember_leagueId_fkey"
FOREIGN KEY ("leagueId") REFERENCES "League"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeagueMember"
ADD CONSTRAINT "LeagueMember_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
