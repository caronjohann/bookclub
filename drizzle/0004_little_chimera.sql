CREATE TYPE "public"."video_provider" AS ENUM('youtube', 'vimeo', 'upload');--> statement-breakpoint
ALTER TABLE "artifact_videos" DROP CONSTRAINT "artifact_videos_poster_url_format_check";--> statement-breakpoint
ALTER TABLE "artifact_videos" ADD COLUMN "provider" "video_provider";--> statement-breakpoint
ALTER TABLE "artifact_videos" ADD COLUMN "thumbnail_url" text;--> statement-breakpoint
ALTER TABLE "artifact_videos" DROP COLUMN "mime_type";--> statement-breakpoint
ALTER TABLE "artifact_videos" DROP COLUMN "poster_url";--> statement-breakpoint
ALTER TABLE "artifact_videos" ADD CONSTRAINT "artifact_videos_thumbnail_url_format_check" CHECK ("artifact_videos"."thumbnail_url" is null or "artifact_videos"."thumbnail_url" ~* '^https?://.+');