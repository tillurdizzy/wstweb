const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jvrmzhjhbzpklksujwid.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2cm16aGpoYnpwa2xrc3Vqd2lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNzI2MjAsImV4cCI6MjA1NTY0ODYyMH0.zituA2d2c5wfq3iEk4vAHPz2zZjH_FjMyVALdDnffoQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testCreateUser() {
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      console.log(`Attempting to create user: ${testEmail}`);
      const { data, error } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'TempPass123!', // Dummy password
        email_confirm: true,
      });
  
      if (error) {
        console.error('Error:', error.message);
      } else {
        console.log('User created:', data.user.id);
      }
    } catch (error) {
      console.error('Unexpected error:', error.message);
    }
  }

testCreateUser();