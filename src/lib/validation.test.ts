import { describe, it, expect } from 'vitest';
import {
  validateAssessmentMode,
  validateConfidenceThreshold,
  validateSourceVerificationLevel,
  validateMaxClaimsPerAssessment,
  validateMinimumSourceCount,
  validateLanguage,
  validateDomain,
  validateExcludedDomains,
  validateSettings,
  hasErrors,
  NO_ERRORS,
} from './validation';
import type { FactCheckSettingsInput } from '@/types/settings';

const VALID_SETTINGS: FactCheckSettingsInput = {
  assessment_mode: 'balanced',
  confidence_threshold: 75,
  auto_flag_enabled: true,
  source_verification_level: 'standard',
  max_claims_per_assessment: 50,
  enable_ai_cross_check: true,
  notify_on_disputed_claims: true,
  require_multiple_sources: false,
  minimum_source_count: 2,
  language: 'en',
  excluded_domains: [],
};

describe('validateAssessmentMode', () => {
  it.each(['strict', 'balanced', 'lenient'])('returns null for valid mode "%s"', (mode) => {
    expect(validateAssessmentMode(mode)).toBeNull();
  });

  it.each(['', 'STRICT', 'moderate', 'xyz', 'balanced ', 'nuclear'])(
    'returns an error string for invalid mode "%s"',
    (mode) => {
      expect(validateAssessmentMode(mode)).not.toBeNull();
    }
  );
});

describe('validateConfidenceThreshold', () => {
  it.each([0, 50, 100])('returns null for valid threshold %i', (v) => {
    expect(validateConfidenceThreshold(v)).toBeNull();
  });

  it.each([-1, 101, 50.5, NaN])('returns error for invalid threshold %s', (v) => {
    expect(validateConfidenceThreshold(v)).not.toBeNull();
  });
});

describe('validateSourceVerificationLevel', () => {
  it.each(['basic', 'standard', 'thorough'])('returns null for valid level "%s"', (level) => {
    expect(validateSourceVerificationLevel(level)).toBeNull();
  });

  it.each(['', 'BASIC', 'deep', 'ultra', 'standard '])(
    'returns error for invalid level "%s"',
    (level) => {
      expect(validateSourceVerificationLevel(level)).not.toBeNull();
    }
  );
});

describe('validateMaxClaimsPerAssessment', () => {
  it.each([1, 250, 500])('returns null for valid value %i', (v) => {
    expect(validateMaxClaimsPerAssessment(v)).toBeNull();
  });

  it.each([0, 501, -5, 3.14, NaN])('returns error for invalid value %s', (v) => {
    expect(validateMaxClaimsPerAssessment(v)).not.toBeNull();
  });
});

describe('validateMinimumSourceCount', () => {
  it.each([1, 10, 20])('returns null for valid value %i', (v) => {
    expect(validateMinimumSourceCount(v)).toBeNull();
  });

  it.each([0, 21, -1, 2.5, NaN])('returns error for invalid value %s', (v) => {
    expect(validateMinimumSourceCount(v)).not.toBeNull();
  });
});

describe('validateLanguage', () => {
  it.each(['en', 'es', 'fr', 'de', 'pt', 'ja', 'zh'])(
    'accepts supported language "%s"',
    (lang) => {
      expect(validateLanguage(lang)).toBeNull();
    }
  );

  it('rejects empty string', () => {
    expect(validateLanguage('')).not.toBeNull();
  });

  it('rejects unsupported language', () => {
    expect(validateLanguage('xx')).not.toBeNull();
  });
});

describe('validateDomain', () => {
  it.each(['example.com', 'sub.example.co.uk', 'foo.bar.org'])(
    'accepts valid domain "%s"',
    (d) => {
      expect(validateDomain(d)).toBeNull();
    }
  );

  it.each(['no spaces here.com', 'nodot', '', '  ', 'has .spaces'])(
    'rejects invalid domain "%s"',
    (d) => {
      expect(validateDomain(d)).not.toBeNull();
    }
  );
});

describe('validateExcludedDomains', () => {
  it('returns null for an empty array', () => {
    expect(validateExcludedDomains([])).toBeNull();
  });

  it('returns null when all domains are valid', () => {
    expect(validateExcludedDomains(['a.com', 'b.org'])).toBeNull();
  });

  it('returns an error when any domain is invalid', () => {
    expect(validateExcludedDomains(['good.com', 'bad one'])).not.toBeNull();
  });
});

describe('validateSettings', () => {
  it('returns all-null errors for a fully valid settings object', () => {
    const errors = validateSettings(VALID_SETTINGS);
    expect(Object.values(errors).every((v) => v === null)).toBe(true);
  });

  it('reports errors for every invalid field simultaneously', () => {
    const invalid: FactCheckSettingsInput = {
      ...VALID_SETTINGS,
      assessment_mode: 'nuclear' as never,
      confidence_threshold: 150,
      source_verification_level: 'ultra' as never,
      max_claims_per_assessment: 999,
      minimum_source_count: 0,
      language: 'xx',
      excluded_domains: ['bad domain'],
    };
    const errors = validateSettings(invalid);
    expect(errors.assessment_mode).not.toBeNull();
    expect(errors.confidence_threshold).not.toBeNull();
    expect(errors.source_verification_level).not.toBeNull();
    expect(errors.max_claims_per_assessment).not.toBeNull();
    expect(errors.minimum_source_count).not.toBeNull();
    expect(errors.language).not.toBeNull();
    expect(errors.excluded_domains).not.toBeNull();
  });

  it('passes through NaN values from failed parseInt', () => {
    const withNaN: FactCheckSettingsInput = {
      ...VALID_SETTINGS,
      max_claims_per_assessment: NaN,
    };
    const errors = validateSettings(withNaN);
    expect(errors.max_claims_per_assessment).not.toBeNull();
  });
});

describe('hasErrors', () => {
  it('returns false when all errors are null', () => {
    expect(hasErrors(NO_ERRORS)).toBe(false);
  });

  it('returns true when any error is non-null', () => {
    expect(
      hasErrors({ ...NO_ERRORS, confidence_threshold: 'bad value' })
    ).toBe(true);
  });

  it('returns true when multiple errors are non-null', () => {
    expect(
      hasErrors({
        ...NO_ERRORS,
        confidence_threshold: 'bad',
        language: 'also bad',
      })
    ).toBe(true);
  });
});
