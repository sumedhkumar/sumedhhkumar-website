import { Client } from 'pg';

async function testDb() {
  const client = new Client({
    connectionString: "postgresql://postgres.pbvaelmmyqphnqougbpw:vyntegra.website@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to DB.");

    try {
      const res = await client.query("SELECT hidden_bonus_agent_access_eligible FROM course_registrations LIMIT 1");
      console.log("Query succeeded:", res.rows);
    } catch (err) {
      console.error("Query failed:", err.message);
    }
  } catch (err) {
    console.error("Connection failed:", err.message);
  } finally {
    await client.end();
  }
}

testDb();
