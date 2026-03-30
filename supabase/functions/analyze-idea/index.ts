import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisRequest {
  ideaData: {
    title: string;
    description: string;
    target_users: string;
    domain: string;
    tech_stack: string;
    timeline: string;
    budget: string;
    skill_match: string;
    primary_objective: string;
  };
  profile: {
    priority_mode: string;
    risk_tolerance: string;
    time_horizon: string;
    dimension_weights: Record<string, number>;
  };
  llmProvider: 'groq' | 'openai';
}

const DIMENSIONS = [
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
];

async function callLLM(
  messages: Array<{ role: string; content: string }>,
  provider: 'groq' | 'openai',
  apiKey: string
): Promise<string> {
  if (provider === 'groq') {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } else {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

async function extractFeatures(ideaData: any, provider: string, apiKey: string): Promise<any> {
  const prompt = `You are a technical analyst. Extract structured features from this idea.

Idea:
Title: ${ideaData.title}
Description: ${ideaData.description}
Target Users: ${ideaData.target_users}
Domain: ${ideaData.domain}
Tech Stack: ${ideaData.tech_stack}
Timeline: ${ideaData.timeline}
Budget: ${ideaData.budget}

Extract and return a JSON object with:
{
  "required_skills": ["skill1", "skill2", ...],
  "required_resources": ["resource1", "resource2", ...],
  "dependencies": ["dependency1", "dependency2", ...],
  "technical_unknowns": ["unknown1", "unknown2", ...],
  "comparable_products": ["product1", "product2", ...]
}

Be specific and grounded in the idea description. Only return valid JSON.`;

  const response = await callLLM(
    [{ role: 'user', content: prompt }],
    provider as 'groq' | 'openai',
    apiKey
  );

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(response);
  } catch (e) {
    return {
      required_skills: [],
      required_resources: [],
      dependencies: [],
      technical_unknowns: [],
      comparable_products: [],
    };
  }
}

async function scoreDimension(
  dimension: string,
  ideaData: any,
  extractedFeatures: any,
  profile: any,
  provider: string,
  apiKey: string
): Promise<any> {
  const dimensionDescriptions: Record<string, string> = {
    technical_feasibility: 'How achievable is this technically given current technology and the user\'s tech stack?',
    implementation_complexity: 'How complex is the implementation? Lower score = more complex.',
    time_to_mvp: 'How quickly can an MVP be built? Higher score = faster.',
    market_potential: 'How large is the potential market or impact?',
    competition_saturation: 'How saturated is the market? Lower score = more saturated.',
    research_novelty: 'How novel is this from a research perspective?',
    scalability: 'How well can this scale technically and business-wise?',
    monetization_viability: 'How viable are the monetization opportunities?',
    personal_fit: 'How well does this match the user\'s skills and objectives?',
    regulatory_risk: 'What regulatory or ethical risks exist? Lower score = higher risk.',
    maintenance_burden: 'How much ongoing maintenance required? Lower score = higher burden.',
    failure_probability: 'What is the probability of failure? Lower score = higher probability.',
    differentiation_strength: 'How differentiated is this from competitors?',
    learning_value: 'How much will the user learn from this?',
    long_term_optionality: 'What long-term opportunities does this create?',
  };

  const prompt = `You are evaluating an idea on the dimension: ${dimension.replace(/_/g, ' ').toUpperCase()}

${dimensionDescriptions[dimension]}

Idea Context:
Title: ${ideaData.title}
Description: ${ideaData.description}
Domain: ${ideaData.domain}
Tech Stack: ${ideaData.tech_stack}
Timeline: ${ideaData.timeline}
Budget: ${ideaData.budget}
User Skills: ${ideaData.skill_match}
Primary Objective: ${ideaData.primary_objective}

Extracted Features:
Required Skills: ${extractedFeatures.required_skills?.join(', ') || 'None'}
Technical Unknowns: ${extractedFeatures.technical_unknowns?.join(', ') || 'None'}
Comparable Products: ${extractedFeatures.comparable_products?.join(', ') || 'None'}

Evaluation Profile:
Priority Mode: ${profile.priority_mode}
Risk Tolerance: ${profile.risk_tolerance}
Time Horizon: ${profile.time_horizon}

Provide a score from 0-10 and detailed reasoning. Return JSON:
{
  "score": 7.5,
  "reasoning": "Detailed explanation grounded in the specific idea...",
  "evidence": "Specific facts supporting this score...",
  "assumptions": "What assumptions were made...",
  "uncertainties": "What is uncertain or could change the score..."
}

Be rigorous and specific. Reference actual details from the idea. Avoid generic statements. Only return valid JSON.`;

  const response = await callLLM(
    [{ role: 'user', content: prompt }],
    provider as 'groq' | 'openai',
    apiKey
  );

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(response);
  } catch (e) {
    return {
      score: 5.0,
      reasoning: 'Unable to parse AI response',
      evidence: '',
      assumptions: '',
      uncertainties: '',
    };
  }
}

async function synthesizeEvaluation(
  ideaData: any,
  dimensionScores: any[],
  overallScore: number,
  profile: any,
  provider: string,
  apiKey: string
): Promise<any> {
  const scoresText = dimensionScores.map(ds =>
    `${ds.dimension_name}: ${ds.score}/10 - ${ds.reasoning}`
  ).join('\n');

  const prompt = `You are synthesizing the final evaluation of an idea.

Idea: ${ideaData.title}
Overall Score: ${overallScore}/10

Dimension Scores:
${scoresText}

User Profile:
- Objective: ${ideaData.primary_objective}
- Priority: ${profile.priority_mode}
- Risk Tolerance: ${profile.risk_tolerance}
- Timeline: ${profile.time_horizon}

Based on all dimension scores and reasoning, provide:

1. VERDICT: Choose one: "pursue", "park", "drop", or "research_more"
2. PATHWAY: Best path forward: "job", "paper", "mvp", "open_source", "grant", "phd", or "startup"
3. SKILL_GAPS: Array of skills the user needs to develop
4. ACTION_PLAN: 90-day action plan with specific steps (array of {day, action, rationale})
5. RISK_MAP: Key risks (array of {category, description, severity, mitigation})
6. SYNTHESIS: Overall reasoning for the verdict and pathway

Return JSON:
{
  "verdict": "pursue",
  "pathway": "mvp",
  "skill_gaps": ["skill1", "skill2"],
  "action_plan": [
    {"day": 1, "action": "...", "rationale": "..."},
    {"day": 7, "action": "...", "rationale": "..."}
  ],
  "risk_map": [
    {"category": "technical", "description": "...", "severity": "medium", "mitigation": "..."}
  ],
  "synthesis": "Overall reasoning..."
}

Be specific, actionable, and grounded in the actual idea details. Only return valid JSON.`;

  const response = await callLLM(
    [{ role: 'user', content: prompt }],
    provider as 'groq' | 'openai',
    apiKey
  );

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(response);
  } catch (e) {
    return {
      verdict: 'research_more',
      pathway: null,
      skill_gaps: [],
      action_plan: [],
      risk_map: [],
      synthesis: 'Unable to synthesize evaluation',
    };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { ideaData, profile, llmProvider }: AnalysisRequest = await req.json();

    const apiKey = llmProvider === 'groq'
      ? Deno.env.get('GROQ_API_KEY')
      : Deno.env.get('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error(`Missing API key for ${llmProvider}`);
    }

    const { data: ideaRecord, error: ideaError } = await supabase
      .from('ideas')
      .insert({
        title: ideaData.title,
        description: ideaData.description,
        target_users: ideaData.target_users,
        domain: ideaData.domain,
        tech_stack: ideaData.tech_stack,
        timeline: ideaData.timeline,
        budget: ideaData.budget,
        skill_match: ideaData.skill_match,
        primary_objective: ideaData.primary_objective,
        status: 'analyzing',
      })
      .select()
      .single();

    if (ideaError) throw ideaError;

    const extractedFeatures = await extractFeatures(ideaData, llmProvider, apiKey);

    const dimensionScorePromises = DIMENSIONS.map(dim =>
      scoreDimension(dim, ideaData, extractedFeatures, profile, llmProvider, apiKey)
    );

    const dimensionResults = await Promise.all(dimensionScorePromises);

    const dimensionScores = DIMENSIONS.map((dim, idx) => ({
      dimension_name: dim,
      ...dimensionResults[idx],
    }));

    let totalWeightedScore = 0;
    let totalWeight = 0;

    dimensionScores.forEach(ds => {
      const weight = profile.dimension_weights[ds.dimension_name] || 1.0;
      totalWeightedScore += ds.score * weight;
      totalWeight += weight;
    });

    const overallScore = totalWeightedScore / totalWeight;

    const synthesis = await synthesizeEvaluation(
      ideaData,
      dimensionScores,
      overallScore,
      profile,
      llmProvider,
      apiKey
    );

    const { data: evaluation, error: evalError } = await supabase
      .from('evaluations')
      .insert({
        idea_id: ideaRecord.id,
        profile_id: null,
        overall_score: overallScore,
        verdict: synthesis.verdict,
        pathway: synthesis.pathway,
        action_plan: synthesis.action_plan,
        risk_map: synthesis.risk_map,
        reasoning: synthesis.synthesis,
        extracted_features: extractedFeatures,
        skill_gaps: synthesis.skill_gaps,
        comparable_products: extractedFeatures.comparable_products || [],
      })
      .select()
      .single();

    if (evalError) throw evalError;

    const dimensionScoreInserts = dimensionScores.map(ds => ({
      evaluation_id: evaluation.id,
      dimension_name: ds.dimension_name,
      score: ds.score,
      reasoning: ds.reasoning,
      evidence: ds.evidence || '',
      assumptions: ds.assumptions || '',
      uncertainties: ds.uncertainties || '',
    }));

    const { error: dimError } = await supabase
      .from('dimension_scores')
      .insert(dimensionScoreInserts);

    if (dimError) throw dimError;

    await supabase
      .from('ideas')
      .update({ status: 'evaluated' })
      .eq('id', ideaRecord.id);

    return new Response(
      JSON.stringify({
        success: true,
        idea_id: ideaRecord.id,
        evaluation_id: evaluation.id,
        overall_score: overallScore,
        verdict: synthesis.verdict,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Analysis failed',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
