# Event-Managment-CDLU

## Registration and Supabase deployment

Deploy the contents of this folder, including `assets/`, `uploaded_contents/`, and
the root HTML files. The public registration flow requires the Supabase browser
client and the tables in `supabase_schema.sql`.

Before accepting registrations, run this check in the Supabase SQL Editor:

```sql
SELECT
    to_regclass('public.events') AS events_table,
    to_regclass('public.registrations') AS registrations_table;

SELECT COUNT(*) AS registration_count
FROM public.registrations;
```

After a successful registration, verify that the returned ID exists:

```sql
SELECT id, participant_name, roll_no, created_at
FROM public.registrations
ORDER BY created_at DESC
LIMIT 10;
```

The browser now treats Supabase as authoritative for new registrations. It
stores a local cache only after Supabase confirms the insert, so a database
failure is shown as an error instead of being reported as a successful
local-only registration.

If GitHub Pages is used, publish the `Event-Managment-CDLU` folder itself (not
only its parent directory), then use a hard refresh (`Ctrl+Shift+R`) after each
deployment. In the browser console, `DBService.getCloudStatus()` must report
`isCloudConnected: true`.
