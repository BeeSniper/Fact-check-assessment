/*
# Create fact_check_settings table (single-tenant, no auth)

1. New Tables
- `fact_check_settings`
  - `id` (uuid, primary key)
  - `assessment_mode` (text) — strictness mode: "strict", "balanced", "lenient"
  - `confidence_threshold` (integer) — minimum confidence percentage (0-100) for a verdict
  - `auto_flag_enabled` (boolean) — whether claims are auto-flagged when below threshold
  - `source_verification_level` (text) — depth of source checks: "basic", "standard", "thorough"
  - `max_claims_per_assessment` (integer) — cap on claims analyzed per assessment
  - `enable_ai_cross_check` (boolean) — whether AI cross-references are run
  - `notify_on_disputed_claims` (boolean) — whether to alert on disputed verdicts
  - `require_multiple_sources` (boolean) — whether multiple sources must corroborate
  - `minimum_source_count` (integer) — minimum number of sources required
  - `language` (text) — assessment output language
  - `excluded_domains` (text[]) — domains to exclude from source pool
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

2. Security
- Enable RLS on `fact_check_settings`.
- Allow anon + authenticated CRUD (single-tenant app, no sign-in).
*/

CREATE TABLE IF NOT EXISTS fact_check_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_mode text NOT NULL DEFAULT 'balanced',
  confidence_threshold integer NOT NULL DEFAULT 75,
  auto_flag_enabled boolean NOT NULL DEFAULT true,
  source_verification_level text NOT NULL DEFAULT 'standard',
  max_claims_per_assessment integer NOT NULL DEFAULT 50,
  enable_ai_cross_check boolean NOT NULL DEFAULT true,
  notify_on_disputed_claims boolean NOT NULL DEFAULT true,
  require_multiple_sources boolean NOT NULL DEFAULT false,
  minimum_source_count integer NOT NULL DEFAULT 2,
  language text NOT NULL DEFAULT 'en',
  excluded_domains text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE fact_check_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_fact_check_settings" ON fact_check_settings;
CREATE POLICY "anon_select_fact_check_settings" ON fact_check_settings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_fact_check_settings" ON fact_check_settings;
CREATE POLICY "anon_insert_fact_check_settings" ON fact_check_settings
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_fact_check_settings" ON fact_check_settings;
CREATE POLICY "anon_update_fact_check_settings" ON fact_check_settings
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_fact_check_settings" ON fact_check_settings;
CREATE POLICY "anon_delete_fact_check_settings" ON fact_check_settings
  FOR DELETE TO anon, authenticated USING (true);
