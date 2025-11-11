import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, searchMode = "default" } = await req.json();
    console.log('Perplexity search request:', { query, searchMode });

    if (!query) {
      throw new Error('Query is required');
    }

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) {
      throw new Error("PERPLEXITY_API_KEY is not configured. Please add it in secrets.");
    }

    // Choose model based on search mode
    const model = searchMode === "deep" 
      ? "llama-3.1-sonar-large-128k-online"
      : "llama-3.1-sonar-small-128k-online";

    const systemPrompt = `You are a highly intelligent research assistant. Provide comprehensive, well-researched answers with:
- Direct, clear answers first
- Supporting evidence and details
- Multiple perspectives when relevant
- Source citations
- Follow-up questions the user might want to explore

Format your response in a structured way with clear sections.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: searchMode === "deep" ? 4000 : 2000,
        return_images: false,
        return_related_questions: true,
        search_recency_filter: 'month',
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "Invalid Perplexity API key." }), 
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    // Stream the response back
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error('Perplexity search error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
