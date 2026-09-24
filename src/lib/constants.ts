export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'pt', 'ja', 'zh'] as const;
export const ASSESSMENT_MODE_VALUES = ['strict', 'balanced', 'lenient'] as const;
export const SOURCE_LEVEL_VALUES = ['basic', 'standard', 'thorough'] as const;

export const SUPPORTED_LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  ja: 'Japanese',
  zh: 'Chinese',
};
