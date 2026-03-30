import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ExtractionRequest {
  description?: string;
  pdfContent?: string;
  llmProvider: 'groq' | 'openai';
}

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
        max_tokens: 2000,
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
        max_tokens: 2000,
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { description, pdfContent, llmProvider }: ExtractionRequest = await req.json();

    const textContent = description || pdfContent;

    if (!textContent || textContent.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Description or PDF content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = llmProvider === 'groq'
      ? Deno.env.get('GROQ_API_KEY')
      : Deno.env.get('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error(`Missing API key for ${llmProvider}`);
    }

    const prompt = `Extract key details from this idea description and return ONLY valid JSON:

Idea Description:
"${textContent}"

Extract and return a JSON object with exactly this structure:
{
  "title": "A concise, memorable title (max 10 words)",
  "target_users": "Who benefits from this (1 sentence)",
  "domain": "Primary domain/category",
  "tech_stack": "Inferred tech stack based on the idea (basic estimate)",
  "timeline": "Estimated time to MVP",
  "budget": "Rough budget category (low/medium/high based on description)",
  "skill_match": "Core skills needed for this",
  "primary_objective": "Infer from context: career, startup, research, learning, or phd"
}

Be concise, practical, and grounded in the description. Infer reasonable defaults where needed.
Only return valid JSON, no other text.`;

    const response = await callLLM(
      [{ role: 'user', content: prompt }],
      llmProvider as 'groq' | 'openai',
      apiKey
    );

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const extracted = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return new Response(
        JSON.stringify({
          title: extracted.title || 'Untitled Idea',
          target_users: extracted.target_users || 'Various users',
          domain: extracted.domain || 'General',
          tech_stack: extracted.tech_stack || 'TBD',
          timeline: extracted.timeline || '3-6 months',
          budget: extracted.budget || 'medium',
          skill_match: extracted.skill_match || 'Multiple disciplines',
          primary_objective: extracted.primary_objective || 'learning',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({
          title: 'Extracted Idea',
          target_users: 'Various users',
          domain: 'General',
          tech_stack: 'TBD',
          timeline: '3-6 months',
          budget: 'medium',
          skill_match: 'Multiple disciplines',
          primary_objective: 'learning',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error('Extraction error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Extraction failed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
