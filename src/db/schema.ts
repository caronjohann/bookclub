import { sql } from 'drizzle-orm'
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

export const artifactTypeEnum = pgEnum('artifact_type', ['url', 'text', 'image', 'video'])
export const videoProviderEnum = pgEnum('video_provider', ['youtube', 'vimeo', 'upload'])

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('sessions_user_id_idx').on(table.userId),
    index('sessions_expires_at_idx').on(table.expiresAt),
  ],
)

export const collections = pgTable(
  'collections',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    normalizedName: text('normalized_name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('collections_user_id_name_unique_idx').on(table.userId, table.normalizedName),
  ],
)

export const artifacts = pgTable(
  'artifacts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    creatorUserId: uuid('creator_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: artifactTypeEnum('type').notNull(),
    title: text('title'),
    description: text('description'),
    sourceUrl: text('source_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('artifacts_creator_user_id_idx').on(table.creatorUserId),
    check('artifacts_title_length_check', sql`char_length(${table.title}) <= 200`),
    check(
      'artifacts_source_url_format_check',
      sql`${table.sourceUrl} is null or ${table.sourceUrl} ~* '^https?://.+'`,
    ),
  ],
)

export const collectionArtifacts = pgTable(
  'collection_artifacts',
  {
    collectionId: uuid('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade' }),
    artifactId: uuid('artifact_id')
      .notNull()
      .references(() => artifacts.id, { onDelete: 'cascade' }),
    savedAt: timestamp('saved_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.collectionId, table.artifactId] }),
    index('collection_artifacts_artifact_id_idx').on(table.artifactId),
  ],
)

export const userArtifacts = pgTable(
  'user_artifacts',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    artifactId: uuid('artifact_id')
      .notNull()
      .references(() => artifacts.id, { onDelete: 'cascade' }),
    savedAt: timestamp('saved_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.artifactId] }),
    index('user_artifacts_artifact_id_idx').on(table.artifactId),
  ],
)

export const artifactUrls = pgTable(
  'artifact_urls',
  {
    artifactId: uuid('artifact_id')
      .primaryKey()
      .references(() => artifacts.id, { onDelete: 'cascade' }),
    targetUrl: text('target_url').notNull(),
  },
  (table) => [
    check('artifact_urls_target_url_format_check', sql`${table.targetUrl} ~* '^https?://.+'`),
  ],
)

export const artifactTexts = pgTable('artifact_texts', {
  artifactId: uuid('artifact_id')
    .primaryKey()
    .references(() => artifacts.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
})

export const artifactImages = pgTable(
  'artifact_images',
  {
    artifactId: uuid('artifact_id')
      .primaryKey()
      .references(() => artifacts.id, { onDelete: 'cascade' }),
    imageUrl: text('image_url').notNull(),
    thumbnailUrl: text('thumbnail_url').notNull(),
  },
  (table) => [
    check('artifact_images_image_url_format_check', sql`${table.imageUrl} ~* '^https?://.+'`),
    check(
      'artifact_images_thumbnail_url_format_check',
      sql`${table.thumbnailUrl} ~* '^https?://.+'`,
    ),
  ],
)

export const artifactVideos = pgTable(
  'artifact_videos',
  {
    artifactId: uuid('artifact_id')
      .primaryKey()
      .references(() => artifacts.id, { onDelete: 'cascade' }),
    videoUrl: text('video_url').notNull(),
    provider: videoProviderEnum('provider'),
    durationSeconds: integer('duration_seconds'),
    thumbnailUrl: text('thumbnail_url'),
  },
  (table) => [
    check(
      'artifact_videos_duration_positive_check',
      sql`${table.durationSeconds} is null or ${table.durationSeconds} > 0`,
    ),
    check('artifact_videos_video_url_format_check', sql`${table.videoUrl} ~* '^https?://.+'`),
    check(
      'artifact_videos_thumbnail_url_format_check',
      sql`${table.thumbnailUrl} is null or ${table.thumbnailUrl} ~* '^https?://.+'`,
    ),
  ],
)

export const tags = pgTable('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  normalizedName: text('normalized_name').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const artifactTags = pgTable(
  'artifact_tags',
  {
    artifactId: uuid('artifact_id')
      .notNull()
      .references(() => artifacts.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.artifactId, table.tagId] }),
    index('artifact_tags_tag_id_idx').on(table.tagId),
  ],
)
