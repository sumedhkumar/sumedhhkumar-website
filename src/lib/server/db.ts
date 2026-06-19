import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { appConfig, isProductionPersistenceConfigured } from "@/lib/config";

type DatabaseGlobal = typeof globalThis & {
  vyntegraDbPool?: Pool;
  vyntegraDatabaseReady?: Promise<void>;
};

const databaseGlobal = globalThis as DatabaseGlobal;

function configurationError() {
  return new Error("PostgreSQL persistence is not configured.");
}

export function getDbPool() {
  if (!isProductionPersistenceConfigured()) {
    throw configurationError();
  }

  if (!databaseGlobal.vyntegraDbPool) {
    databaseGlobal.vyntegraDbPool = new Pool({
      connectionString: appConfig.databaseUrl,
      ssl: appConfig.databaseSsl ? { rejectUnauthorized: false } : undefined,
    });
  }

  return databaseGlobal.vyntegraDbPool;
}

export async function queryDb<Row extends QueryResultRow = QueryResultRow>(
  text: string,
  params: readonly unknown[] = [],
) {
  await ensureDatabaseReady();
  return getDbPool().query<Row>(text, [...params]);
}

export async function withDbClient<T>(
  callback: (client: PoolClient) => Promise<T>,
) {
  await ensureDatabaseReady();
  const client = await getDbPool().connect();

  try {
    return await callback(client);
  } finally {
    client.release();
  }
}

async function runSchemaMigration() {
  const schema = await readFile(join(process.cwd(), "db", "schema.sql"), "utf8");
  const statements = schema
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
  const client = await getDbPool().connect();

  try {
    for (const statement of statements) {
      await client.query(statement);
    }
  } finally {
    client.release();
  }
}

export async function ensureDatabaseReady() {
  if (!isProductionPersistenceConfigured()) {
    throw configurationError();
  }

  if (!appConfig.autoMigrateDb) {
    return;
  }

  if (!databaseGlobal.vyntegraDatabaseReady) {
    databaseGlobal.vyntegraDatabaseReady = runSchemaMigration().catch((error) => {
      databaseGlobal.vyntegraDatabaseReady = undefined;
      throw error;
    });
  }

  await databaseGlobal.vyntegraDatabaseReady;
}
