-- Add status and error handling fields to UserProject table
ALTER TABLE "UserProject" 
ADD COLUMN IF NOT EXISTS "status" varchar(20) NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS "creditsUsed" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "errorMessage" text,
ADD COLUMN IF NOT EXISTS "updatedAt" timestamp NOT NULL DEFAULT now();

-- Update existing projects to have 'completed' status (assuming they were successful)
UPDATE "UserProject" SET "status" = 'completed' WHERE "status" = 'pending';

-- Create index for faster status lookups
CREATE INDEX IF NOT EXISTS "UserProject_status_idx" ON "UserProject"("status");
CREATE INDEX IF NOT EXISTS "UserProject_userId_status_idx" ON "UserProject"("userId", "status");




