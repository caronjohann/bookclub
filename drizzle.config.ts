import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: '.env' })
config({ path: '.env.local', override: true })

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is not set')

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
})
