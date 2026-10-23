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

## College IDs and one-entry-per-college rule

The registration form is populated from the supplied affiliated-college list.
The displayed format is `College name [college ID]`; the numeric ID is stored
in `registrations.college_id` and `scores.college_id`. New scores no longer
store a college name.

Before adding the unique registration index to an existing database, find
duplicates:

```sql
SELECT college_id, event_id, COUNT(*) AS total,
       array_agg(id ORDER BY created_at) AS registration_ids
FROM public.registrations
WHERE college_id IS NOT NULL AND event_id IS NOT NULL
GROUP BY college_id, event_id
HAVING COUNT(*) > 1;
```

Resolve each duplicate manually, retaining the correct registration, then run
the updated `supabase_schema.sql`. The database unique index and the browser
pre-check both enforce one registration per college per event.

For an existing database, backfill only after confirming each college mapping:

```sql
SELECT id, college_name, college_id
FROM public.registrations
ORDER BY created_at;
```

The I-card lookup queries Supabase directly by registration ID, roll number, or
chest number. A cloud query error is now reported instead of silently showing
offline demo records.

The schema migration also handles old/demo college IDs. It first matches an
existing registration's `college_name` to the authoritative college list; if
the old ID cannot be matched, it sets `college_id` to `NULL` instead of
failing the foreign-key migration. Review those rows after applying:

```sql
SELECT id, participant_name, college_name, college_id
FROM public.registrations
WHERE college_id IS NULL;
```

Do not assign an old demo number such as `2608` unless that exact ID exists in
`public.affiliated_colleges`.
