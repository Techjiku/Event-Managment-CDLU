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

## Updated affiliated-college list

The current XLSX contains 31 unique colleges. Its unique Team Codes are used
consistently by registration,
judge score entry, scoreboards, final results, and the Supabase seed.

To update an existing Supabase database manually, run this after taking a
backup of registrations and scores:

```sql
BEGIN;

UPDATE public.affiliated_colleges
SET is_active = FALSE
WHERE id NOT IN (
  2601, 2644, 2628, 2661, 2639, 2633, 2647, 2606, 2638, 2660,
  2654, 2632, 2617, 2669, 2614, 2635, 2618, 2636, 2655, 2607,
  2622, 2619, 2640, 2641, 2620, 2657, 2643, 2645, 2637
);

INSERT INTO public.affiliated_colleges (id, name, is_active)
VALUES
  (2601, 'JCD M College of Education, Sirsa', TRUE),
  (2644, 'Shah Satnam Ji Boys College, Sirsa', TRUE),
  (2628, 'M.M. College of Education, Fatehabad', TRUE),
  (2661, 'CKRM Degree College, Jamal, Sirsa', TRUE),
  (2639, 'JCDM College of Engineering, Sirsa (Haryana)', TRUE),
  (2633, 'Dr. B.R. Ambedkar College, Mandi Dabwali', TRUE),
  (2647, 'Government College, Bhuna', TRUE),
  (2606, 'CMK National PG College, Sirsa', TRUE),
  (2638, 'Shri Guru Hari Singh College, Jiwan Nagar', TRUE),
  (2660, 'Shah Satnam Ji College of Education, Sirsa', TRUE),
  (2654, 'Government College for Girls, Rania', TRUE),
  (2632, 'Shaheed Baba Deep Singh College of Education, Aherwan, Ratia', TRUE),
  (2617, 'K.T. Government College, Ratia', TRUE),
  (2669, 'Shah Satnam Ji Girls College, Sirsa', TRUE),
  (2614, 'Lala Hansraj Phutela College of Law', TRUE),
  (2635, 'Mata Harki Devi College', TRUE),
  (2618, 'Janta Girls P.G. College', TRUE),
  (2636, 'SDS/GCW, Ratia', TRUE),
  (2655, 'Government National College, Sirsa', TRUE),
  (2607, 'JCD Institute of Business Management, Sirsa', TRUE),
  (2622, 'CMG/GCW Bhodia, Fatehabad', TRUE),
  (2619, 'JCD Memorial College, Sirsa', TRUE),
  (2640, 'Mata Harki Devi College of Education, Odhan', TRUE),
  (2641, 'Government College, Kalawali', TRUE),
  (2620, 'Government College for Women, Sirsa', TRUE),
  (2657, 'MP College Mandi Dabwali', TRUE),
  (2643, 'GOVT. College Bhattu Kallan, Fatehabad', TRUE),
  (2645, 'Shaheed Bhagat Singh College of Education, Kalawali, Sirsa', TRUE),
  (2637, 'M.M.P.G College Fatehabad', TRUE)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, is_active = TRUE;

UPDATE public.registrations r
SET college_name = c.name
FROM public.affiliated_colleges c
WHERE r.college_id = c.id;

COMMIT;
```

Verify the final list:

```sql
SELECT COUNT(*) AS active_colleges
FROM public.affiliated_colleges
WHERE is_active = TRUE;

SELECT id, name
FROM public.affiliated_colleges
WHERE is_active = TRUE
ORDER BY id;
```

The active count must be `31`. Run the updated
`supabase_schema.sql` through GitHub Actions after this manual update so new
deployments remain synchronized.

If schema apply reports `affiliated_colleges_name_key` for Nehru College, run
this repair once in Supabase SQL Editor. It moves the old serial-ID references
to the final team code `2652` before removing the obsolete directory row:

```sql
BEGIN;

ALTER TABLE public.registrations
  DROP CONSTRAINT IF EXISTS registrations_college_id_fkey;

ALTER TABLE public.scores
  DROP CONSTRAINT IF EXISTS scores_college_id_fkey;

DROP TRIGGER IF EXISTS prevent_finalized_score_update ON public.scores;
DROP TRIGGER IF EXISTS prevent_finalized_score_change ON public.scores;

DO $$
DECLARE
  old_id INTEGER;
BEGIN
  SELECT id
  INTO old_id
  FROM public.affiliated_colleges
  WHERE lower(trim(name)) =
    lower(trim('Nehru College of Education, Vill. Alikan, Teh. Dabwali, Distt. Sirsa (SFS)'))
    AND id <> 2652
  LIMIT 1;

  IF old_id IS NOT NULL THEN
    UPDATE public.registrations
    SET college_id = 2652
    WHERE college_id = old_id;

    UPDATE public.scores
    SET college_id = 2652
    WHERE college_id = old_id;

    DELETE FROM public.affiliated_colleges
    WHERE id = old_id;
  END IF;
END;
$$;

ALTER TABLE public.registrations
  ADD CONSTRAINT registrations_college_id_fkey
  FOREIGN KEY (college_id) REFERENCES public.affiliated_colleges(id);

ALTER TABLE public.scores
  ADD CONSTRAINT scores_college_id_fkey
  FOREIGN KEY (college_id) REFERENCES public.affiliated_colleges(id);

CREATE TRIGGER prevent_finalized_score_change
BEFORE UPDATE OR DELETE ON public.scores
FOR EACH ROW
EXECUTE FUNCTION public.prevent_finalized_score_change();

COMMIT;
```

After this repair, rerun the workflow. The schema seed will find no old
duplicate Nehru row and will complete normally.

## Uploading future college Excel files

The Super Admin portal now has **Database -> Update affiliated colleges**.
Upload an `.xlsx` or `.xls` file whose first sheet contains columns named
`College Name` and `Team Code` (the importer also accepts `Name`, `Institute`,
`College ID`, or `Code`). Click **Preview Excel**, resolve any duplicate or
empty values, then click **Publish to database**.

The publish operation validates the whole file, adds new colleges, updates
changed IDs/names, deactivates colleges no longer in the uploaded file, updates
`registrations.college_name` for existing college IDs, and reloads the portal.
This is a smart replacement of the active directory: historical registrations
and scores are preserved, and old college rows are deactivated instead of
deleted. Therefore, an old college reference remains available for history but
will no longer appear in new registration selectors or active result filters.
All public portals load the active list from Supabase at startup, so no code
change or manual SQL command is needed for future uploads.

One-time setup is required: apply the current `supabase_schema.sql` once so
the `replace_affiliated_colleges(jsonb)` RPC exists. The upload tool will show
a clear Supabase error if that setup has not been applied.

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
