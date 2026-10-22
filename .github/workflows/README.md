# Automatic Supabase database updates

The `supabase-schema-sync.yml` workflow applies `supabase_schema.sql` whenever
that file changes on the `main` or `master` branch. It can also be started
manually from GitHub Actions.

## One-time GitHub setup

1. Push this project to a private GitHub repository.
2. Open **Settings > Environments**, create an environment named `production`,
   and optionally require approval before database changes run.
3. Add this repository variable:
   - `SUPABASE_PROJECT_REF`: the project reference from the Supabase URL, for
     example `mloifpvurnppsykpjtgc`.
4. Add these repository or `production` environment secrets:
   - `SUPABASE_ACCESS_TOKEN`: a Supabase personal access token created from
     **Account > Access Tokens**.
   - `SUPABASE_DB_PASSWORD`: the database password from the Supabase project.
5. Push to `main` or `master`. The workflow will apply the schema and show the
   result in the Actions tab.

Never put either secret in HTML, JavaScript, `supabase-config.js`, or a public
repository. The browser should only use the Supabase publishable key.

## Important SQL rule

The current file is a full, rerunnable schema. Keep schema changes idempotent:

- use `CREATE ... IF NOT EXISTS`;
- use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`;
- use `DROP ... IF EXISTS`;
- use a deliberate `ON CONFLICT` clause for seed data.

For production, prefer adding a new numbered migration instead of editing old
history. Test destructive changes in a staging Supabase project first.
