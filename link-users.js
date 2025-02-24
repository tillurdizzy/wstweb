const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jvrmzhjhbzpklksujwid.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2cm16aGpoYnpwa2xrc3Vqd2lkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA3MjYyMCwiZXhwIjoyMDU1NjQ4NjIwfQ.kWI4CTdoUznIfoRtIHP5BnfmPWzDXUhz6UYypQDcw4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function linkUsers() {
  try {
    const { data: owners, error: ownerError } = await supabase
      .from('owners')
      .select('owner_id, email, uuid');
    if (ownerError) throw ownerError;

    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) throw userError;

    for (const owner of owners) {
      const user = users.users.find(u => u.email === owner.email);
      if (user) {
        if (!owner.uuid || owner.uuid !== user.id) {
          const { error: updateError } = await supabase
            .from('owners')
            .update({ uuid: user.id })
            .eq('owner_id', owner.owner_id);
          if (updateError) {
            console.error(`Failed to link ${owner.email}: ${updateError.message}`);
          } else {
            console.log(`Linked ${owner.email} to ${user.id}`);
          }
        } else {
          console.log(`${owner.email} already linked to ${user.id}`);
        }
      } else {
        console.log(`No auth user found for ${owner.email}`);
      }
    }
    console.log('Linking complete!');
  } catch (error) {
    console.error(`Failed: ${error.message}`);
  }
}

linkUsers();