ALTER TABLE "artifact_images" DROP CONSTRAINT "artifact_images_width_positive_check";--> statement-breakpoint
ALTER TABLE "artifact_images" DROP CONSTRAINT "artifact_images_height_positive_check";--> statement-breakpoint
ALTER TABLE "artifact_images" ADD COLUMN "thumbnail_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "artifact_images" DROP COLUMN "mime_type";--> statement-breakpoint
ALTER TABLE "artifact_images" DROP COLUMN "width";--> statement-breakpoint
ALTER TABLE "artifact_images" DROP COLUMN "height";--> statement-breakpoint
ALTER TABLE "artifact_images" ADD CONSTRAINT "artifact_images_thumbnail_url_format_check" CHECK ("artifact_images"."thumbnail_url" ~* '^https?://.+');