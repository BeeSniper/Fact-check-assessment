import {
  SUPPORTED_LANGUAGES,
  ASSESSMENT_MODE_VALUES,
  SOURCE_LEVEL_VALUES,
} from './constants';
import type { FactCheckSettingsInput } from '@/types/settings';

export type FactCheckSettingsErrors = {
  assessment_mode: string | null;
  confidence_threshold: string | null;
  source_verification_level: string | null;
  max_claims_per_assessment: string | null;
  minimum_source_count: string | null;
  language: string | null;
  excluded_domains: string | null;
};

export function validateAssessmentMode(value: string): string | null {
  if (ASSESSMENT_MODE_VALUES.includes(value as never)) return null;
  return 'Assessment mode must be one of: strict, balanced, lenient';
}

export function validateConfidenceThreshold(value: number): string | null {
  if (!Number.isInteger(value)) return 'Confidence threshold must be an integer between 0 and 100';
  if (value < 0 || value > 100) return 'Confidence threshold must be an integer between 0 and 100';
  return null;
}

export function validateSourceVerificationLevel(value: string): string | null {
  if (SOURCE_LEVEL_VALUES.includes(value as never)) return null;
  return 'Source verification level must be one of: basic, standard, thorough';
}

export function validateMaxClaimsPerAssessment(value: number): string | null {
  if (!Number.isInteger(value))
    return 'Max claims per assessment must be an integer between 1 and 500';
  if (value < 1 || value > 500)
    return 'Max claims per assessment must be an integer between 1 and 500';
  return null;
}

export function validateMinimumSourceCount(value: number): string | null {
  if (!Number.isInteger(value))
    return 'Minimum source count must be an integer between 1 and 20';
  if (value < 1 || value > 20)
    return 'Minimum source count must be an integer between 1 and 20';
  return null;
}

export function validateLanguage(value: string): string | null {
  if (!value) return 'Language is required';
  if (!SUPPORTED_LANGUAGES.includes(value as never))
    return 'Language must be one of the supported languages';
  return null;
}

export function validateDomain(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Domain is required';
  if (/\s/.test(trimmed)) return 'Domain must not contain spaces';
  if (!trimmed.includes('.')) return 'Domain must contain a dot (e.g. example.com)';
  return null;
}

export function validateExcludedDomains(value: string[]): string | null {
  for (const domain of value) {
    const err = validateDomain(domain);
    if (err) return `Invalid excluded domain "${domain}": ${err}`;
  }
  return null;
}

export function validateSettings(
  settings: FactCheckSettingsInput
): FactCheckSettingsErrors {
  return {
    assessment_mode: validateAssessmentMode(settings.assessment_mode),
    confidence_threshold: validateConfidenceThreshold(settings.confidence_threshold),
    source_verification_level: validateSourceVerificationLevel(
      settings.source_verification_level
    ),
    max_claims_per_assessment: validateMaxClaimsPerAssessment(
      settings.max_claims_per_assessment
    ),
    minimum_source_count: validateMinimumSourceCount(settings.minimum_source_count),
    language: validateLanguage(settings.language),
    excluded_domains: validateExcludedDomains(settings.excluded_domains),
  };
}

export function hasErrors(errors: FactCheckSettingsErrors): boolean {
  return Object.values(errors).some((v) => v !== null);
}

export const NO_ERRORS: FactCheckSettingsErrors = {
  assessment_mode: null,
  confidence_threshold: null,
  source_verification_level: null,
  max_claims_per_assessment: null,
  minimum_source_count: null,
  language: null,
  excluded_domains: null,
};
