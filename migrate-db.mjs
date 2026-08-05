import { Client } from 'pg';

async function migrateDb() {
  const client = new Client({
    connectionString: "postgresql://postgres.pbvaelmmyqphnqougbpw:vyntegra.website@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to DB.");

    try {
      await client.query("ALTER TABLE course_registrations ADD COLUMN progress_state JSONB NOT NULL DEFAULT '[]'::jsonb");
      console.log("Migration succeeded.");
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log("Column already exists, migration skipped.");
      } else {
        console.error("Migration failed:", err.message);
      }
    }
  } catch (err) {
    console.error("Connection failed:", err.message);
  } finally {
    await client.end();
  }
}

migrateDb();
