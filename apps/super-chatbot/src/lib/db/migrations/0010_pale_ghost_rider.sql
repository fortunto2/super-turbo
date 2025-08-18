ALTER TABLE "User" ADD COLUMN "sessionId" varchar(64);--> statement-breakpoint
ALTER TABLE "User" DROP COLUMN IF EXISTS "superduperaiToken";