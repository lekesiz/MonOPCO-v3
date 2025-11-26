import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://kblnyssyrmmuedpwrtup.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibG55c3N5cm1tdWVkcHdydHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE1NTg5NywiZXhwIjoyMDc5NzMxODk3fQ.UUUGbG8Jl0y6R-xCpOBi4rrDKMgZf8SBIolvBlNKUO4';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('🚀 Starting email_templates table migration...');
    
    const sql = readFileSync('./create_email_templates.sql', 'utf8');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);
      console.log(statement.substring(0, 100) + '...');
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: statement
      });
      
      if (error) {
        // Try alternative approach using direct query
        const { error: queryError } = await supabase
          .from('_migrations')
          .select('*')
          .limit(0);
        
        if (queryError) {
          console.error('❌ Error:', error.message);
          console.log('⚠️  Trying alternative approach...');
          
          // Use pg library if available
          try {
            const { default: pg } = await import('pg');
            const { Client } = pg;
            
            const client = new Client({
              connectionString: `postgresql://postgres.kblnyssyrmmuedpwrtup:${supabaseServiceKey}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
              ssl: { rejectUnauthorized: false }
            });
            
            await client.connect();
            console.log('✅ Connected to PostgreSQL directly');
            
            await client.query(statement);
            console.log('✅ Statement executed successfully');
            
            await client.end();
          } catch (pgError) {
            console.error('❌ PostgreSQL error:', pgError.message);
            throw pgError;
          }
        }
      } else {
        console.log('✅ Statement executed successfully');
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log('📊 email_templates table is ready to use');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
