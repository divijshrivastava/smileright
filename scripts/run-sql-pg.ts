#!/usr/bin/env tsx

/**
 * Direct PostgreSQL SQL execution script
 * Uses pg library to connect directly to Supabase PostgreSQL database
 */

import { Client } from 'pg';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Get database connection string from environment
const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (!databaseUrl) {
  console.error('❌ Error: Missing DATABASE_URL or SUPABASE_DB_URL environment variable');
  console.error('\nYou can find your connection string in Supabase Dashboard:');
  console.error('Project Settings > Database > Connection string > URI');
  console.error('\nAdd it to your .env.local file:');
  console.error('DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres');
  process.exit(1);
}

async function executeSqlFile(filePath: string) {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log(`📄 Reading SQL file: ${filePath}`);
    const absolutePath = resolve(process.cwd(), filePath);
    const sql = readFileSync(absolutePath, 'utf-8');
    
    if (!sql.trim()) {
      console.warn('⚠️  Warning: SQL file is empty');
      return;
    }

    console.log(`🔌 Connecting to database...`);
    await client.connect();
    console.log(`✅ Connected!`);

    console.log(`🚀 Executing SQL...`);
    const result = await client.query(sql);
    
    console.log('✅ SQL executed successfully!');
    
    if (result.rows && result.rows.length > 0) {
      console.log(`📊 Rows affected: ${result.rowCount}`);
      console.log('📋 Sample results:', result.rows.slice(0, 5));
    } else if (result.rowCount !== null) {
      console.log(`📊 Rows affected: ${result.rowCount}`);
    }
  } catch (error: any) {
    console.error('❌ Error executing SQL:');
    console.error(error.message);
    if (error.position) {
      console.error(`Position: ${error.position}`);
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database');
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: npm run sql <path-to-sql-file>');
  console.log('\nExamples:');
  console.log('  npm run sql supabase/migrations/001_initial_schema.sql');
  console.log('  npm run sql supabase/seed.sql');
  console.log('  npm run sql supabase/create-admin-profile.sql');
  console.log('\nAvailable SQL files:');
  console.log('  Migrations:');
  console.log('    - supabase/migrations/001_initial_schema.sql');
  console.log('    - supabase/migrations/002_trust_and_media.sql');
  console.log('    - supabase/migrations/003_services.sql');
  console.log('  Utilities:');
  console.log('    - supabase/seed.sql');
  console.log('    - supabase/create-admin-profile.sql');
  console.log('    - supabase/fix-rls-comprehensive.sql');
  console.log('    - supabase/fix-admin-role.sql');
  process.exit(1);
}

const sqlFile = args[0];
executeSqlFile(sqlFile);
