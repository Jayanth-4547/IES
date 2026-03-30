import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      ideas: {
        Row: {
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
        };
        Insert: Omit<Database['public']['Tables']['ideas']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['ideas']['Insert']>;
      };
      evaluations: {
        Row: {
          id: string;
          idea_id: string;
          profile_id: string | null;
          overall_score: number;
          verdict: 'pursue' | 'park' | 'drop' | 'research_more';
          pathway: 'job' | 'paper' | 'mvp' | 'open_source' | 'grant' | 'phd' | 'startup' | null;
          action_plan: any;
          risk_map: any;
          reasoning: string;
          extracted_features: any;
          skill_gaps: any;
          comparable_products: any;
          created_at: string;
        };
      };
      dimension_scores: {
        Row: {
          id: string;
          evaluation_id: string;
          dimension_name: string;
          score: number;
          reasoning: string;
          evidence: string | null;
          assumptions: string | null;
          uncertainties: string | null;
          created_at: string;
        };
      };
      evaluation_profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          priority_mode: 'career-first' | 'money-first' | 'research-first' | 'balanced' | 'custom';
          risk_tolerance: 'low' | 'medium' | 'high';
          time_horizon: 'short' | 'medium' | 'long';
          dimension_weights: any;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['evaluation_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['evaluation_profiles']['Insert']>;
      };
    };
  };
};
