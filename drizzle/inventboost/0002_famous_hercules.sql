ALTER TABLE "users" ADD COLUMN "benefit_card" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_ext_auth_id_unique" UNIQUE("ext_auth_id");