import pkg from "pg"
const { Pool } = pkg
import { drizzle } from "drizzle-orm/node-postgres"
import { config } from "../config/env.js"
import * as schema from "./schema.js"

if (!config.databaseUrl) {
  console.warn("⚠️ DATABASE_URL is not set in environment!")
}

// Create connection pool with SSL enabled for Neon PostgreSQL
export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

// Drizzle ORM instance using standard node-postgres
export const db = drizzle(pool, { schema })

/**
 * Tagged template literal helper that emulates @neondatabase/serverless `sql` tag
 * but executes via the node-postgres connection pool.
 * Supports:
 *   await sql`SELECT * FROM users WHERE id = ${userId}`
 */
export async function sql(strings: TemplateStringsArray, ...values: any[]): Promise<any[]> {
  let queryText = ""
  const params: any[] = []

  for (let i = 0; i < strings.length; i++) {
    queryText += strings[i]
    if (i < values.length) {
      params.push(values[i])
      queryText += `$${params.length}`
    }
  }

  const client = await pool.connect()
  try {
    const res = await client.query(queryText, params)
    return res.rows
  } finally {
    client.release()
  }
}
