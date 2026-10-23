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

## If the schema workflow says `affiliated_colleges` does not exist

That message means GitHub Actions is running an older or different
`supabase_schema.sql`; the current file creates `public.affiliated_colleges`
before the cleanup statements (line 49 before line 197). Do not run the
cleanup `UPDATE` by itself.

1. Commit and push the root `supabase_schema.sql` and
   `.github/workflows/supabase-schema-sync.yml` from this folder:
   `Event-Managment-CDLU`.
2. Open the failed workflow run. It must show `Schema preflight passed` and
   print the first 25 lines containing the schema header, not a cleanup query.
3. If it does not, the wrong folder was pushed. The GitHub repository root must
   contain these paths:
   `supabase_schema.sql`, `.github/workflows/supabase-schema-sync.yml`,
   `index.html`, and `assets/`.
4. Re-run the workflow only after the preflight passes.
5. In Supabase SQL Editor, verify:

```sql
SELECT to_regclass('public.affiliated_colleges') AS affiliated_colleges;
SELECT COUNT(*) AS college_count FROM public.affiliated_colleges;
```

The expected result is a non-null table name and 63 colleges. Do not manually
insert `2608`; it is an old/demo ID and is intentionally cleared when it
cannot be matched to the official list.

## If schema apply reports `Finalized judge scores cannot be changed or deleted`

This is caused by an older database trigger blocking the migration's
`college_id` backfill or the removal of obsolete demo judges. The corrected
schema temporarily drops only that trigger during the migration, does not
change finalized score values, and recreates the protection before the schema
finishes.

If you need to repair the database manually, first back up the affected rows:

```sql
CREATE TABLE IF NOT EXISTS public.scores_schema_backup_20261023 AS
SELECT * FROM public.scores;

CREATE TABLE IF NOT EXISTS public.judges_schema_backup_20261023 AS
SELECT * FROM public.judges;
```

Then run this one-time repair in the Supabase SQL Editor:

```sql
BEGIN;

DROP TRIGGER IF EXISTS prevent_finalized_score_update ON public.scores;
DROP TRIGGER IF EXISTS prevent_finalized_score_change ON public.scores;

ALTER TABLE public.scores
  ADD COLUMN IF NOT EXISTS college_id INT;

UPDATE public.scores s
SET college_id = r.college_id
FROM public.registrations r
WHERE s.registration_id = r.id
  AND s.college_id IS NULL;

UPDATE public.scores s
SET college_id = NULL
WHERE s.college_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.affiliated_colleges c
    WHERE c.id = s.college_id
  );

ALTER TABLE public.scores
  DROP CONSTRAINT IF EXISTS scores_college_id_fkey;

ALTER TABLE public.scores
  ADD CONSTRAINT scores_college_id_fkey
  FOREIGN KEY (college_id)
  REFERENCES public.affiliated_colleges(id);

CREATE OR REPLACE FUNCTION public.prevent_finalized_score_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD.is_locked THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.registrations
      WHERE id = OLD.registration_id
    ) THEN
      RETURN OLD;
    END IF;
    RAISE EXCEPTION 'Finalized judge scores cannot be changed or deleted.';
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.is_locked THEN
    RAISE EXCEPTION 'Finalized judge scores cannot be changed or deleted.';
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

CREATE TRIGGER prevent_finalized_score_change
BEFORE UPDATE OR DELETE ON public.scores
FOR EACH ROW
EXECUTE FUNCTION public.prevent_finalized_score_change();

COMMIT;
```

Verify that the protection was restored:

```sql
SELECT tgname
FROM pg_trigger
WHERE tgrelid = 'public.scores'::regclass
  AND tgname = 'prevent_finalized_score_change'
  AND NOT tgisinternal;
```

Do not permanently delete this trigger and do not run `DELETE FROM scores` to
solve the migration error. If an obsolete judge must be removed, remove the
judge only after the trigger is temporarily dropped inside a transaction, and
verify the backup first.
