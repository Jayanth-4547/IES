import { useState } from 'react';
import { EvaluationProfile, DimensionWeights, EVALUATION_DIMENSIONS } from '../types';

interface ProfileSelectorProps {
  onProfileChange: (profile: EvaluationProfile) => void;
}

const DEFAULT_WEIGHTS: DimensionWeights = {
  technical_feasibility: 1.0,
  implementation_complexity: 1.0,
  time_to_mvp: 1.0,
  market_potential: 1.0,
  competition_saturation: 1.0,
  research_novelty: 1.0,
  scalability: 1.0,
  monetization_viability: 1.0,
  personal_fit: 1.0,
  regulatory_risk: 1.0,
  maintenance_burden: 1.0,
  failure_probability: 1.0,
  differentiation_strength: 1.0,
  learning_value: 1.0,
  long_term_optionality: 1.0,
};

const PRESET_WEIGHTS: Record<string, DimensionWeights> = {
  'career-first': {
    ...DEFAULT_WEIGHTS,
    personal_fit: 1.5,
    learning_value: 1.3,
    time_to_mvp: 1.2,
    long_term_optionality: 1.4,
    market_potential: 0.8,
  },
  'money-first': {
    ...DEFAULT_WEIGHTS,
    monetization_viability: 1.5,
    market_potential: 1.4,
    scalability: 1.3,
    competition_saturation: 1.2,
    time_to_mvp: 1.2,
  },
  'research-first': {
    ...DEFAULT_WEIGHTS,
    research_novelty: 1.5,
    learning_value: 1.3,
    differentiation_strength: 1.3,
    long_term_optionality: 1.2,
    monetization_viability: 0.7,
  },
  'balanced': DEFAULT_WEIGHTS,
};

export function ProfileSelector({ onProfileChange }: ProfileSelectorProps) {
  const [profile, setProfile] = useState<EvaluationProfile>({
    name: 'Default',
    priority_mode: 'balanced',
    risk_tolerance: 'medium',
    time_horizon: 'medium',
    dimension_weights: DEFAULT_WEIGHTS,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateProfile = (updates: Partial<EvaluationProfile>) => {
    const newProfile = { ...profile, ...updates };

    if (updates.priority_mode && updates.priority_mode !== 'custom') {
      newProfile.dimension_weights = PRESET_WEIGHTS[updates.priority_mode];
    }

    setProfile(newProfile);
    onProfileChange(newProfile);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Priority Mode
        </label>
        <select
          value={profile.priority_mode}
          onChange={(e) => updateProfile({ priority_mode: e.target.value as any })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="balanced">Balanced</option>
          <option value="career-first">Career First</option>
          <option value="money-first">Money First</option>
          <option value="research-first">Research First</option>
          <option value="custom">Custom</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          {profile.priority_mode === 'career-first' && 'Optimizes for personal growth and career advancement'}
          {profile.priority_mode === 'money-first' && 'Optimizes for monetization and market potential'}
          {profile.priority_mode === 'research-first' && 'Optimizes for novelty and learning'}
          {profile.priority_mode === 'balanced' && 'Equal weight across all dimensions'}
          {profile.priority_mode === 'custom' && 'Customize individual dimension weights'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Risk Tolerance
          </label>
          <select
            value={profile.risk_tolerance}
            onChange={(e) => updateProfile({ risk_tolerance: e.target.value as any })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Horizon
          </label>
          <select
            value={profile.time_horizon}
            onChange={(e) => updateProfile({ time_horizon: e.target.value as any })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="short">Short (0-6 months)</option>
            <option value="medium">Medium (6-18 months)</option>
            <option value="long">Long (18+ months)</option>
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
      </button>

      {showAdvanced && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <h4 className="font-medium text-gray-900 mb-3">Dimension Weights</h4>
          <div className="grid grid-cols-1 gap-3">
            {EVALUATION_DIMENSIONS.map((dim) => (
              <div key={dim} className="flex items-center justify-between">
                <label className="text-sm text-gray-700 capitalize">
                  {dim.replace(/_/g, ' ')}
                </label>
                <input
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={profile.dimension_weights[dim]}
                  onChange={(e) => {
                    const newWeights = {
                      ...profile.dimension_weights,
                      [dim]: parseFloat(e.target.value),
                    };
                    updateProfile({ dimension_weights: newWeights, priority_mode: 'custom' });
                  }}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
