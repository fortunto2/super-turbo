-- Migration: Add GeneratedMedia table
-- Date: 2025-10-23
-- Description: Table for storing user-generated images and videos from AI tools

CREATE TABLE IF NOT EXISTS "GeneratedMedia" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid,
	"sessionId" varchar(64),
	"type" varchar NOT NULL,
	"url" text NOT NULL,
	"prompt" text NOT NULL,
	"model" varchar(128) NOT NULL,
	"settings" json NOT NULL,
	"projectId" text,
	"requestId" text,
	"fileId" text,
	"thumbnailUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraint
DO $$ BEGIN
 ALTER TABLE "GeneratedMedia" ADD CONSTRAINT "GeneratedMedia_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS "idx_generated_media_user_id" ON "GeneratedMedia" ("userId");
CREATE INDEX IF NOT EXISTS "idx_generated_media_session_id" ON "GeneratedMedia" ("sessionId");
CREATE INDEX IF NOT EXISTS "idx_generated_media_type" ON "GeneratedMedia" ("type");
CREATE INDEX IF NOT EXISTS "idx_generated_media_created_at" ON "GeneratedMedia" ("createdAt" DESC);
