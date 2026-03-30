export interface IdeaFormData {
  title: string;
  description: string;
  target_users: string;
  domain: string;
  tech_stack: string;
  timeline: string;
  budget: string;
  skill_match: string;
  primary_objective: 'career' | 'startup' | 'phd' | 'research' | 'learning' | '';
}

export interface EvaluationProfile {
  id?: string;
  user_id?: string;
  name: string;
  priority_mode: 'career-first' | 'money-first' | 'research-first' | 'balanced' | 'custom';
  risk_tolerance: 'low' | 'medium' | 'high';
  time_horizon: 'short' | 'medium' | 'long';
  dimension_weights: DimensionWeights;
}

export interface DimensionWeights {
  technical_feasibility: number;
  implementation_complexity: number;
  time_to_mvp: number;
  market_potential: number;
  competition_saturation: number;
  research_novelty: number;
  scalability: number;
  monetization_viability: number;
  personal_fit: number;
  regulatory_risk: number;
  maintenance_burden: number;
  failure_probability: number;
  differentiation_strength: number;
  learning_value: number;
  long_term_optionality: number;
}

export interface DimensionScore {
  dimension_name: string;
  score: number;
  reasoning: string;
  evidence: string;
  assumptions: string;
  uncertainties: string;
}

export interface Evaluation {
  id: string;
  idea_id: string;
  profile_id: string | null;
  overall_score: number;
  verdict: 'pursue' | 'park' | 'drop' | 'research_more';
  pathway: 'job' | 'paper' | 'mvp' | 'open_source' | 'grant' | 'phd' | 'startup' | null;
  action_plan: ActionItem[];
  risk_map: RiskItem[];
  reasoning: string;
  extracted_features: ExtractedFeatures;
  skill_gaps: string[];
  comparable_products: string[];
  dimension_scores?: DimensionScore[];
  created_at: string;
}

export interface ActionItem {
  day: number;
  action: string;
  rationale: string;
}

export interface RiskItem {
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface ExtractedFeatures {
  required_skills: string[];
  required_resources: string[];
  dependencies: string[];
  technical_unknowns: string[];
}

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_users: string | null;
  domain: string | null;
  tech_stack: string | null;
  timeline: string | null;
  budget: string | null;
  skill_match: string | null;
  primary_objective: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  evaluation?: Evaluation;
}

export const EVALUATION_DIMENSIONS = [
  'technical_feasibility',
  'implementation_complexity',
  'time_to_mvp',
  'market_potential',
  'competition_saturation',
  'research_novelty',
  'scalability',
  'monetization_viability',
  'personal_fit',
  'regulatory_risk',
  'maintenance_burden',
  'failure_probability',
  'differentiation_strength',
  'learning_value',
  'long_term_optionality',
] as const;

export const DIMENSION_LABELS: Record<string, string> = {
  technical_feasibility: 'Technical Feasibility',
  implementation_complexity: 'Implementation Complexity',
  time_to_mvp: 'Time to MVP',
  market_potential: 'Market Potential',
  competition_saturation: 'Competition Saturation',
  research_novelty: 'Research Novelty',
  scalability: 'Scalability',
  monetization_viability: 'Monetization Viability',
  personal_fit: 'Personal Fit',
  regulatory_risk: 'Regulatory Risk',
  maintenance_burden: 'Maintenance Burden',
  failure_probability: 'Failure Probability',
  differentiation_strength: 'Differentiation Strength',
  learning_value: 'Learning Value',
  long_term_optionality: 'Long-term Optionality',
};
