-- SQL Script to Check Email in Auth and Retrieve Details
DO $$
DECLARE
    user_id uuid;
    input_email text := 'owner1@example.com'; -- Replace with the email you want to check
    owner_exists boolean;
    unit_list text;
BEGIN
    -- Step 1: Check if email exists in auth.users
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = input_email;

    IF user_id IS NOT NULL THEN
        -- Step 2: Check if the user_id exists in owners table
        SELECT EXISTS (
            SELECT 1 FROM owners WHERE owner_id = user_id
        ) INTO owner_exists;

        -- Step 3: Get list of units linked to this owner_id
        SELECT STRING_AGG(unit::text, ', ') INTO unit_list
        FROM unit_owners
        WHERE owner_id = user_id;

        -- Output results
        RAISE NOTICE 'Email % found in auth.users with ID: %', input_email, user_id;
        
        IF owner_exists THEN
            RAISE NOTICE 'This ID is linked in owners table';
            IF unit_list IS NOT NULL THEN
                RAISE NOTICE 'Linked to units: %', unit_list;
            ELSE
                RAISE NOTICE 'No units linked in unit_owners table yet';
            END IF;
        ELSE
            RAISE NOTICE 'This ID is NOT in owners table yet';
        END IF;
    ELSE
        RAISE NOTICE 'Email % not found in auth.users. Please add it via Supabase Dashboard.', input_email;
    END IF;
END $$;

/* Add to owners Table:
Use the id from the Dashboard, then insert into owners with firstname, lastname, and cell. Example manual SQL (run separately): */
INSERT INTO owners (owner_id, firstname, lastname, cell)
VALUES ('12b46fd9-1db5-4527-9f0e-e2e7bb579402', 'John', 'Doe', '123-456-7890');


/* Link Units in unit_owners:
Insert the owner_id and unit number(s) into unit_owners. Example: */
INSERT INTO unit_owners (owner_id, unit)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 101);

-- For multiple units
INSERT INTO unit_owners (owner_id, unit)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 101),
    ('550e8400-e29b-41d4-a716-446655440000', 102);








SELECT 
  uo.owner_id,
  o.firstname,
  o.lastname,
  o.email,
  COUNT(*) as unit_count
FROM unit_owners uo
JOIN owners o ON uo.owner_id = o.owner_id
GROUP BY uo.owner_id, o.firstname, o.lastname, o.email
HAVING COUNT(*) > 1
ORDER BY unit_count DESC;

-- find owners by name
SELECT uo.unit, uo.owner_id, o.firstname, o.lastname, u.owner_occupied
FROM unit_owners uo
JOIN owners o ON uo.owner_id = o.owner_id
JOIN units u ON uo.unit = u.unit
WHERE o.firstname ILIKE '%Kathy%' OR o.lastname ILIKE '%Kathy%'
ORDER BY uo.unit;

--associalte owner with unit using owner_id
INSERT INTO unit_owners (unit, owner_id) VALUES
(117, '54445922-d967-4e50-8da8-12e842614b68'),
(118, '54445922-d967-4e50-8da8-12e842614b68');

--verify unit links by name
SELECT uo.unit, uo.owner_id, o.firstname, o.lastname, u.owner_occupied
FROM unit_owners uo
JOIN owners o ON uo.owner_id = o.owner_id
JOIN units u ON uo.unit = u.unit
WHERE o.firstname ILIKE '%Kathy%' OR o.lastname ILIKE '%Kathy%'
ORDER BY uo.unit;

--find owner_id by name
SELECT owner_id, firstname, lastname, email
FROM owners
WHERE firstname ILIKE '%Todd%' OR lastname ILIKE '%Todd%'
   OR firstname ILIKE '%Blake%' OR lastname ILIKE '%Blake%'
   OR email ILIKE '%salinas%';


--check for current owner
const { data: currentOwner, error: currentError } = await this.supabaseService.client
  .from('unit_owners')
  .select('owner_id')
  .eq('unit', 118)
  .single();

  