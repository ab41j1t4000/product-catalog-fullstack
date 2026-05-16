import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client/index";
import { Pool } from "pg";

// The pg pool manages low-level PostgreSQL connections for Prisma's adapter.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// PrismaPg lets Prisma Client talk to PostgreSQL through the pg driver.
const adapter = new PrismaPg(pool);

// Export one shared Prisma client for the whole app to reuse.
export const prisma = new PrismaClient({ adapter });
