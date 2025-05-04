import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: +process.env.PG_PORT!,
});

export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
});
