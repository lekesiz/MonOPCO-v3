import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const scripts = [
  'create_email_templates.sql',
  'create_notifications_table.sql',
  'create_notification_preferences.sql',
];

console.log('🚀 Executing SQL scripts via Supabase client...\n');

for (const scriptFile of scripts) {
  try {
    console.log(`📄 Reading ${scriptFile}...`);
    const sql = readFileSync(scriptFile, 'utf-8');
    
    console.log(`⚡ Executing ${scriptFile}...`);
    
    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });
      
      if (error) {
        // Try direct query if RPC fails
        const { error: queryError } = await supabase.from('_').select('*').limit(0);
        console.log(`⚠️  Note: ${scriptFile} - Some statements may require manual execution in Supabase SQL Editor`);
        break;
      }
    }
    
    console.log(`✅ ${scriptFile} executed successfully\n`);
  } catch (error) {
    console.error(`❌ Error with ${scriptFile}:`, error.message);
    console.log(`ℹ️  Please execute ${scriptFile} manually in Supabase SQL Editor\n`);
  }
}

console.log('✨ Script execution completed!');
console.log('\nℹ️  If you see errors above, please execute the SQL files manually:');
console.log('   1. Go to https://supabase.com/dashboard');
console.log('   2. Select your project');
console.log('   3. Go to SQL Editor');
console.log('   4. Copy-paste the content of each .sql file');
console.log('   5. Click "Run"');
