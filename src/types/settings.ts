export type AssessmentMode = 'strict' | 'balanced' | 'lenient';
export type SourceVerificationLevel = 'basic' | 'standard' | 'thorough';

export interface FactCheckSettings {
  id: string;
  assessment_mode: AssessmentMode;
  confidence_threshold: number;
  auto_flag_enabled: boolean;
  source_verification_level: SourceVerificationLevel;
  max_claims_per_assessment: number;
  enable_ai_cross_check: boolean;
  notify_on_disputed_claims: boolean;
  require_multiple_sources: boolean;
  minimum_source_count: number;
  language: string;
  excluded_domains: string[];
  created_at: string;
  updated_at: string;
}

export interface FactCheckSettingsInput {
  assessment_mode: AssessmentMode;
  confidence_threshold: number;
  auto_flag_enabled: boolean;
  source_verification_level: SourceVerificationLevel;
  max_claims_per_assessment: number;
  enable_ai_cross_check: boolean;
  notify_on_disputed_claims: boolean;
  require_multiple_sources: boolean;
  minimum_source_count: number;
  language: string;
  excluded_domains: string[];
}
