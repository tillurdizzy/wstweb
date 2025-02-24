const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase URL and SERVICE_ROLE key (from Supabase dashboard > Settings > API)
const SUPABASE_URL = 'https://jvrmzhjhbzpklksujwid.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2cm16aGpoYnpwa2xrc3Vqd2lkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA3MjYyMCwiZXhwIjoyMDU1NjQ4NjIwfQ.kWI4CTdoUznIfoRtIHP5BnfmPWzDXUhz6UYypQDcw4I';

// Initialize Supabase client with service role (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function populateAuthUsers() {
    try {
      // Step 1: Fetch all owners
      const { data: owners, error: fetchError } = await supabase
        .from('owners')
        .select('owner_id, email, uuid');
  
      if (fetchError) {
        throw new Error(`Failed to fetch owners: ${fetchError.message}`);
      }
  
      console.log(`Found ${owners.length} owners to process.`);
  
      // Step 2: Process each owner
      for (const owner of owners) {
        const { email, owner_id, uuid } = owner;
  
        // Skip if email is empty or invalid
        if (!email || !email.includes('@')) {
          console.log(`Skipping owner ${owner_id}: Invalid email (${email})`);
          continue;
        }
  
        // Attempt to create the user in auth.users
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
        });
  
        let userId;
        if (createError) {
          // If user already exists, fetch their ID instead
          if (createError.message.includes('already registered')) {
            console.log(`User already exists for ${email}, fetching ID...`);
            const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
            
            if (listError) {
              console.error(`Failed to list users: ${listError.message}`);
              continue;
            }
  
            const existingUser = userList.users.find(u => u.email === email);
            if (existingUser) {
              userId = existingUser.id;
              console.log(`Found existing user ID for ${email}: ${userId}`);
            } else {
              console.error(`Could not find existing user for ${email}`);
              continue;
            }
          } else {
            console.error(`Failed to create user for ${email}: ${createError.message}`);
            continue;
          }
        } else {
          userId = newUser.user.id;
          console.log(`Created user for ${email} with ID: ${userId}`);
        }
  
        // Step 3: Update owners.uuid if not already set
        if (!uuid || uuid !== userId) {
          const { error: updateError } = await supabase
            .from('owners')
            .update({ uuid: userId })
            .eq('owner_id', owner_id);
  
          if (updateError) {
            console.error(`Failed to update uuid for owner ${owner_id}: ${updateError.message}`);
          } else {
            console.log(`Linked owners.uuid for owner ${owner_id} to ${userId}`);
          }
        } else {
          console.log(`Owner ${owner_id} already linked to ${uuid}`);
        }
      }
  
      console.log('Population complete!');
    } catch (error) {
      console.error(`Script failed: ${error.message}`);
    }
  }
  
  populateAuthUsers();