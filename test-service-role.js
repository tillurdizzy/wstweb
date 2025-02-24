const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jvrmzhjhbzpklksujwid.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2cm16aGpoYnpwa2xrc3Vqd2lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNzI2MjAsImV4cCI6MjA1NTY0ODYyMH0.zituA2d2c5wfq3iEk4vAHPz2zZjH_FjMyVALdDnffoQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testServiceRole() {
  try {
    // Fetch from owners table (bypasses RLS with service role)
    const { data, error } = await supabase.from('owners').select('email').limit(1);
    if (error) {
      console.error('Error fetching owners:', error.message);
    } else {
      console.log('Service role works! Fetched:', data);
    }
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

testServiceRole();