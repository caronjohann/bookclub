CREATE TYPE "public"."artifact_type" AS ENUM('url', 'text', 'image', 'video');--> statement-breakpoint
CREATE TABLE "artifact_images" (
	"artifact_id" uuid PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"mime_type" text,
	"width" integer,
	"height" integer,
	CONSTRAINT "artifact_images_width_positive_check" CHECK ("artifact_images"."width" is null or "artifact_images"."width" > 0),
	CONSTRAINT "artifact_images_height_positive_check" CHECK ("artifact_images"."height" is null or "artifact_images"."height" > 0),
	CONSTRAINT "artifact_images_image_url_format_check" CHECK ("artifact_images"."image_url" ~* '^https?://.+')
);
--> statement-breakpoint
CREATE TABLE "artifact_tags" (
	"artifact_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "artifact_tags_artifact_id_tag_id_pk" PRIMARY KEY("artifact_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "artifact_texts" (
	"artifact_id" uuid PRIMARY KEY NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "artifact_urls" (
	"artifact_id" uuid PRIMARY KEY NOT NULL,
	"target_url" text NOT NULL,
	CONSTRAINT "artifact_urls_target_url_format_check" CHECK ("artifact_urls"."target_url" ~* '^https?://.+')
);
--> statement-breakpoint
CREATE TABLE "artifact_videos" (
	"artifact_id" uuid PRIMARY KEY NOT NULL,
	"video_url" text NOT NULL,
	"mime_type" text,
	"duration_seconds" integer,
	"poster_url" text,
	CONSTRAINT "artifact_videos_duration_positive_check" CHECK ("artifact_videos"."duration_seconds" is null or "artifact_videos"."duration_seconds" > 0),
	CONSTRAINT "artifact_videos_video_url_format_check" CHECK ("artifact_videos"."video_url" ~* '^https?://.+'),
	CONSTRAINT "artifact_videos_poster_url_format_check" CHECK ("artifact_videos"."poster_url" is null or "artifact_videos"."poster_url" ~* '^https?://.+')
);
--> statement-breakpoint
CREATE TABLE "artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_user_id" uuid NOT NULL,
	"type" "artifact_type" NOT NULL,
	"title" text,
	"description" text,
	"source_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "artifacts_title_length_check" CHECK (char_length("artifacts"."title") <= 200),
	CONSTRAINT "artifacts_source_url_format_check" CHECK ("artifacts"."source_url" is null or "artifacts"."source_url" ~* '^https?://.+')
);
--> statement-breakpoint
CREATE TABLE "collection_artifacts" (
	"collection_id" uuid NOT NULL,
	"artifact_id" uuid NOT NULL,
	"saved_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collection_artifacts_collection_id_artifact_id_pk" PRIMARY KEY("collection_id","artifact_id")
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_normalized_name_unique" UNIQUE("normalized_name")
);
--> statement-breakpoint
CREATE TABLE "user_artifacts" (
	"user_id" uuid NOT NULL,
	"artifact_id" uuid NOT NULL,
	"saved_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_artifacts_user_id_artifact_id_pk" PRIMARY KEY("user_id","artifact_id")
);
--> statement-breakpoint
ALTER TABLE "artifact_images" ADD CONSTRAINT "artifact_images_artifact_id_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artifact_tags" ADD CONSTRAINT "artifact_tags_artifact_id_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artifact_tags" ADD CONSTRAINT "artifact_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artifact_texts" ADD CONSTRAINT "artifact_texts_artifact_id_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artifact_urls" ADD CONSTRAINT "artifact_urls_artifact_id_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artifact_videos" ADD CONSTRAINT "artifact_videos_artifact_id_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_creator_user_id_users_id_fk" FOREIGN KEY ("creator_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_artifacts" ADD CONSTRAINT "collection_artifacts_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_artifacts" ADD CONSTRAINT "collection_artifacts_artifact_id_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_artifacts" ADD CONSTRAINT "user_artifacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_artifacts" ADD CONSTRAINT "user_artifacts_artifact_id_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "artifact_tags_tag_id_idx" ON "artifact_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "artifacts_creator_user_id_idx" ON "artifacts" USING btree ("creator_user_id");--> statement-breakpoint
CREATE INDEX "collection_artifacts_artifact_id_idx" ON "collection_artifacts" USING btree ("artifact_id");--> statement-breakpoint
CREATE UNIQUE INDEX "collections_user_id_name_unique_idx" ON "collections" USING btree ("user_id","normalized_name");--> statement-breakpoint
CREATE INDEX "user_artifacts_artifact_id_idx" ON "user_artifacts" USING btree ("artifact_id");