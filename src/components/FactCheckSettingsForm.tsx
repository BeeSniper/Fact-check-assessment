import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Shield,
  Search,
  Bell,
  Globe,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  X,
  Sparkles,
  Lock,
  Eye,
  FileSearch,
  Languages,
  AlertTriangle,
  Scale,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { validateSettings, hasErrors, validateDomain } from '@/lib/validation';
import { SUPPORTED_LANGUAGES, SUPPORTED_LANGUAGE_LABELS } from '@/lib/constants';
import type {
  FactCheckSettings,
  FactCheckSettingsInput,
  AssessmentMode,
  SourceVerificationLevel,
} from '@/types/settings';

const ASSESSMENT_MODES: {
  value: AssessmentMode;
  label: string;
  description: string;
  icon: typeof Lock;
}[] = [
  {
    value: 'strict',
    label: 'Strict',
    description: 'Rigorous analysis with minimal false positives',
    icon: Lock,
  },
  {
    value: 'balanced',
    label: 'Balanced',
    description: 'Recommended balance of thoroughness and speed',
    icon: Scale,
  },
  {
    value: 'lenient',
    label: 'Lenient',
    description: 'Faster analysis with looser confidence thresholds',
    icon: Eye,
  },
];

const SOURCE_LEVELS: {
  value: SourceVerificationLevel;
  label: string;
  description: string;
}[] = [
  { value: 'basic', label: 'Basic', description: 'Quick domain and authorship checks' },
  { value: 'standard', label: 'Standard', description: 'Cross-reference with two independent sources' },
  { value: 'thorough', label: 'Thorough', description: 'Deep multi-source verification with reputation analysis' },
];

const DEFAULT_SETTINGS: FactCheckSettingsInput = {
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

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Shield;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="mt-0.5 text-sm text-gray-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <div>
        <span className="text-sm font-medium text-gray-800">{label}</span>
        {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  );
}

function FieldError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
      {message}
    </p>
  );
}

function inputBorderClass(hasError: boolean): string {
  return hasError
    ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100'
    : 'border-gray-200 text-gray-800 focus:border-blue-500 focus:ring-blue-100';
}

export default function FactCheckSettingsForm() {
  const [settings, setSettings] = useState<FactCheckSettingsInput>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [domainInput, setDomainInput] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<FactCheckSettingsInput>(DEFAULT_SETTINGS);

  const errors = useMemo(() => validateSettings(settings), [settings]);
  const formHasErrors = hasErrors(errors);
  const domainInputError = useMemo(
    () => (domainInput.trim() ? validateDomain(domainInput) : null),
    [domainInput]
  );

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('fact_check_settings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const loaded: FactCheckSettingsInput = {
            assessment_mode: data.assessment_mode,
            confidence_threshold: data.confidence_threshold,
            auto_flag_enabled: data.auto_flag_enabled,
            source_verification_level: data.source_verification_level,
            max_claims_per_assessment: data.max_claims_per_assessment,
            enable_ai_cross_check: data.enable_ai_cross_check,
            notify_on_disputed_claims: data.notify_on_disputed_claims,
            require_multiple_sources: data.require_multiple_sources,
            minimum_source_count: data.minimum_source_count,
            language: data.language,
            excluded_domains: data.excluded_domains ?? [],
          };
          setSettings(loaded);
          setOriginalSettings(loaded);
        }
      } catch {
        // Use defaults if we can't load
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateField = useCallback(
    <K extends keyof FactCheckSettingsInput>(key: K, value: FactCheckSettingsInput[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
      setHasChanges(true);
    },
    []
  );

  const handleSave = async () => {
    if (formHasErrors) return;
    setSaveState('saving');
    setSaveError(null);
    try {
      const { data: existing } = await supabase
        .from('fact_check_settings')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let result;
      if (existing) {
        result = await supabase
          .from('fact_check_settings')
          .update({ ...settings, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select('*')
          .single();
      } else {
        result = await supabase.from('fact_check_settings').insert(settings).select('*').single();
      }

      if (result.error) throw result.error;

      setSettings(result.data as FactCheckSettings);
      setOriginalSettings(settings);
      setHasChanges(false);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 3000);
    } catch (err) {
      setSaveState('error');
      setSaveError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  const handleRevert = () => {
    setSettings(originalSettings);
    setHasChanges(false);
  };

  const addDomain = () => {
    const trimmed = domainInput.trim().toLowerCase();
    if (trimmed && !settings.excluded_domains.includes(trimmed) && !validateDomain(trimmed)) {
      updateField('excluded_domains', [...settings.excluded_domains, trimmed]);
      setDomainInput('');
    }
  };

  const removeDomain = (domain: string) => {
    updateField(
      'excluded_domains',
      settings.excluded_domains.filter((d) => d !== domain)
    );
  };

  const saveDisabled = saveState === 'saving' || !hasChanges || formHasErrors;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading assessment settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-sm">
              <FileSearch className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Fact-Check Assessment</h1>
              <p className="text-xs text-gray-500">Configure verification behavior and thresholds</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                onClick={handleRevert}
                className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 sm:flex"
              >
                <RotateCcw className="h-4 w-4" />
                Revert
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saveDisabled}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saveState === 'saving' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saveState === 'saved' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : saveState === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved!' : 'Save'}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        {/* Save status banners */}
        {saveState === 'error' && saveError && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{saveError}</p>
          </div>
        )}
        {saveState === 'saved' && (
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
            <p className="text-sm text-green-700">Settings saved successfully.</p>
          </div>
        )}
        {hasChanges && saveState === 'idle' && !formHasErrors && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <p className="text-sm text-amber-700">You have unsaved changes.</p>
          </div>
        )}
        {formHasErrors && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-sm text-red-700">
              Please fix the errors below before saving.
            </p>
          </div>
        )}

        {/* Assessment Mode */}
        <SectionCard
          icon={Shield}
          title="Assessment Mode"
          description="Controls the overall rigor and sensitivity of fact-checking"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {ASSESSMENT_MODES.map((mode) => {
              const Icon = mode.icon;
              const isSelected = settings.assessment_mode === mode.value;
              return (
                <button
                  key={mode.value}
                  onClick={() => updateField('assessment_mode', mode.value)}
                  className={`relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}
                    strokeWidth={2}
                  />
                  <span
                    className={`text-sm font-semibold ${
                      isSelected ? 'text-blue-900' : 'text-gray-800'
                    }`}
                  >
                    {mode.label}
                  </span>
                  <span className="text-xs text-gray-500">{mode.description}</span>
                  {isSelected && (
                    <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-blue-600" />
                  )}
                </button>
              );
            })}
          </div>
          <FieldError message={errors.assessment_mode} />
        </SectionCard>

        {/* Confidence Threshold */}
        <SectionCard
          icon={Sparkles}
          title="Confidence Threshold"
          description="Minimum confidence level required to issue a verdict on a claim"
        >
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-gray-700">Minimum confidence</span>
              <span
                className={`text-2xl font-bold tabular-nums ${
                  errors.confidence_threshold ? 'text-red-600' : 'text-blue-600'
                }`}
              >
                {settings.confidence_threshold}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={settings.confidence_threshold}
              onChange={(e) => updateField('confidence_threshold', parseInt(e.target.value, 10))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-blue-600"
              aria-invalid={!!errors.confidence_threshold}
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>0% (Always verdict)</span>
              <span>100% (Only certain)</span>
            </div>
            <FieldError message={errors.confidence_threshold} />
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-600">
                {settings.confidence_threshold < 50
                  ? 'Low threshold: claims may receive verdicts with weak evidence.'
                  : settings.confidence_threshold < 80
                    ? 'Moderate threshold: balanced approach between coverage and accuracy.'
                    : 'High threshold: only high-confidence claims will receive definitive verdicts.'}
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Source Verification */}
        <SectionCard
          icon={Search}
          title="Source Verification"
          description="Controls how sources are checked and validated"
        >
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-3">
              {SOURCE_LEVELS.map((level) => {
                const isSelected = settings.source_verification_level === level.value;
                return (
                  <button
                    key={level.value}
                    onClick={() => updateField('source_verification_level', level.value)}
                    className={`flex flex-col items-start gap-1.5 rounded-xl border-2 p-4 text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span
                      className={`text-sm font-semibold ${
                        isSelected ? 'text-blue-900' : 'text-gray-800'
                      }`}
                    >
                      {level.label}
                    </span>
                    <span className="text-xs text-gray-500">{level.description}</span>
                  </button>
                );
              })}
            </div>
            <FieldError message={errors.source_verification_level} />

            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">
                    Maximum claims per assessment
                  </label>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Caps how many individual claims are analyzed in a single run
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={settings.max_claims_per_assessment}
                      onChange={(e) =>
                        updateField(
                          'max_claims_per_assessment',
                          parseInt(e.target.value, 10)
                        )
                      }
                      aria-invalid={!!errors.max_claims_per_assessment}
                      className={`w-20 rounded-lg border px-3 py-2 text-right text-sm font-medium focus:outline-none focus:ring-2 ${inputBorderClass(
                        !!errors.max_claims_per_assessment
                      )}`}
                    />
                    <span className="text-sm text-gray-400">claims</span>
                  </div>
                  <FieldError message={errors.max_claims_per_assessment} />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">
                    Minimum source count
                  </label>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Number of independent sources required to corroborate a claim
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={settings.minimum_source_count}
                      onChange={(e) =>
                        updateField(
                          'minimum_source_count',
                          parseInt(e.target.value, 10)
                        )
                      }
                      aria-invalid={!!errors.minimum_source_count}
                      className={`w-20 rounded-lg border px-3 py-2 text-right text-sm font-medium focus:outline-none focus:ring-2 ${inputBorderClass(
                        !!errors.minimum_source_count
                      )}`}
                    />
                    <span className="text-sm text-gray-400">sources</span>
                  </div>
                  <FieldError message={errors.minimum_source_count} />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-2">
              <Toggle
                checked={settings.require_multiple_sources}
                onChange={(v) => updateField('require_multiple_sources', v)}
                label="Require multiple sources"
                description="Block verdicts unless the minimum source count is met"
              />
            </div>
          </div>
        </SectionCard>

        {/* AI & Automation */}
        <SectionCard
          icon={Sparkles}
          title="AI & Automation"
          description="Control how AI assists in the fact-checking pipeline"
        >
          <div className="divide-y divide-gray-100">
            <Toggle
              checked={settings.enable_ai_cross_check}
              onChange={(v) => updateField('enable_ai_cross_check', v)}
              label="AI cross-check"
              description="Run a second AI model to cross-reference primary verdicts"
            />
            <Toggle
              checked={settings.auto_flag_enabled}
              onChange={(v) => updateField('auto_flag_enabled', v)}
              label="Auto-flag low-confidence claims"
              description="Automatically flag claims that fall below the confidence threshold"
            />
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard
          icon={Bell}
          title="Notifications"
          description="Alerts and notifications for assessment outcomes"
        >
          <div className="divide-y divide-gray-100">
            <Toggle
              checked={settings.notify_on_disputed_claims}
              onChange={(v) => updateField('notify_on_disputed_claims', v)}
              label="Notify on disputed claims"
              description="Receive an alert when the AI cross-check disagrees with the primary verdict"
            />
          </div>
        </SectionCard>

        {/* Language */}
        <SectionCard
          icon={Languages}
          title="Output Language"
          description="Language used for assessment reports and verdict explanations"
        >
          <div className="space-y-2">
            <select
              value={settings.language}
              onChange={(e) => updateField('language', e.target.value)}
              aria-invalid={!!errors.language}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 ${inputBorderClass(
                !!errors.language
              )}`}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {SUPPORTED_LANGUAGE_LABELS[lang]}
                </option>
              ))}
            </select>
            <FieldError message={errors.language} />
          </div>
        </SectionCard>

        {/* Excluded Domains */}
        <SectionCard
          icon={Globe}
          title="Excluded Domains"
          description="Domains in this list will never be used as sources during verification"
        >
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addDomain();
                    }
                  }}
                  placeholder="example.com"
                  aria-invalid={!!domainInputError}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 ${inputBorderClass(
                    !!domainInputError
                  )}`}
                />
                <button
                  onClick={addDomain}
                  disabled={!domainInput.trim() || !!domainInputError}
                  className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
              <FieldError message={domainInputError} />
            </div>
            <FieldError message={errors.excluded_domains} />
            {settings.excluded_domains.length > 0 ? (
              <div
                className={`flex flex-wrap gap-2 rounded-lg p-2 ${
                  errors.excluded_domains ? 'ring-2 ring-red-200' : ''
                }`}
              >
                {settings.excluded_domains.map((domain) => (
                  <span
                    key={domain}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-4 pr-2 text-sm text-gray-700"
                  >
                    {domain}
                    <button
                      onClick={() => removeDomain(domain)}
                      className="flex h-5 w-5 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No domains excluded. All sources are eligible.</p>
            )}
          </div>
        </SectionCard>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to defaults
          </button>
          <div className="flex flex-col items-end gap-1">
            {formHasErrors && hasChanges && (
              <p className="text-xs text-red-500">Fix errors to enable saving</p>
            )}
            <button
              onClick={handleSave}
              disabled={saveDisabled}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saveState === 'saving' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saveState === 'saving' ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
