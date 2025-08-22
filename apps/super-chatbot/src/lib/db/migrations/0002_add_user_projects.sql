-- Add UserProject table for storing user projects
CREATE TABLE IF NOT EXISTS "UserProject" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "userId" uuid NOT NULL,
    "projectId" text NOT NULL,
    "createdAt" timestamp NOT NULL DEFAULT now()
);
-- Add foreign key constraint
DO $$ BEGIN
ALTER TABLE "UserProject"
ADD CONSTRAINT "UserProject_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "UserProject_userId_idx" ON "UserProject"("userId");
CREATE INDEX IF NOT EXISTS "UserProject_projectId_idx" ON "UserProject"("projectId");