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

  