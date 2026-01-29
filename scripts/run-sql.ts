#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSqlFile(filePath: string) {
  try {
    const absolutePath = resolve(process.cwd(), filePath);
    console.log(`📄 Reading SQL file: ${absolutePath}`);
    
    const sql = readFileSync(absolutePath, 'utf-8');
    
    if (!sql.trim()) {
      console.warn('⚠️  Warning: SQL file is empty');
      return;
    }

    console.log(`🚀 Executing SQL...`);
    
    // Execute the SQL using the REST API
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // If the RPC function doesn't exist, try direct query execution
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.log('ℹ️  Using direct query execution...');
        
        // Split by semicolon and execute each statement
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));
        
        for (const statement of statements) {
          const result = await supabase.rpc('exec', { sql: statement });
          if (result.error) {
            console.error(`❌ Error executing statement: ${result.error.message}`);
            throw result.error;
          }
        }
        
        console.log('✅ SQL executed successfully!');
      } else {
        throw error;
      }
    } else {
      console.log('✅ SQL executed successfully!');
      if (data) {
        console.log('📊 Result:', data);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

async function executeSqlDirect(sql: string) {
  try {
    console.log(`🚀 Executing SQL...`);
    
    // For PostgreSQL, we need to use the REST API or a direct connection
    // The Supabase client doesn't directly support arbitrary SQL execution
    // We'll need to use the Management API or direct PostgreSQL connection
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ sql_query: sql })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ SQL executed successfully!');
    if (result) {
      console.log('📊 Result:', result);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: npm run sql <path-to-sql-file>');
  console.log('Example: npm run sql supabase/migrations/001_initial_schema.sql');
  console.log('\nAvailable SQL files:');
  console.log('  - supabase/migrations/001_initial_schema.sql');
  console.log('  - supabase/migrations/002_trust_and_media.sql');
  console.log('  - supabase/migrations/003_services.sql');
  console.log('  - supabase/seed.sql');
  console.log('  - supabase/create-admin-profile.sql');
  console.log('  - supabase/fix-rls-comprehensive.sql');
  process.exit(1);
}

const sqlFile = args[0];
executeSqlFile(sqlFile);
