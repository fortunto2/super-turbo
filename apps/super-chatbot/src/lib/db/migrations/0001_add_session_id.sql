-- Add sessionId field to User table
ALTER TABLE "User"
ADD COLUMN "sessionId" varchar(64);
-- Create index for faster session lookups
CREATE INDEX IF NOT EXISTS "User_sessionId_idx" ON "User"("sessionId");
-- Add unique constraint to ensure sessions are unique
CREATE UNIQUE INDEX IF NOT EXISTS "User_sessionId_unique_idx" ON "User"("sessionId")
WHERE "sessionId" IS NOT NULL;