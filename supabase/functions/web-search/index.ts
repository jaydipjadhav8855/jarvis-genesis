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
    const { query } = await req.json();
    console.log('Web search request:', query);

    if (!query) {
      throw new Error('Query is required');
    }

    // Use DuckDuckGo instant answer API (free, no API key needed)
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const response = await fetch(searchUrl);
    const data = await response.json();

    let result = {
      query: query,
      answer: '',
      results: [] as Array<{ title: string; url: string; description: string }>,
    };

    // Get abstract/answer
    if (data.Abstract) {
      result.answer = data.Abstract;
    } else if (data.AbstractText) {
      result.answer = data.AbstractText;
    }

    // Get related topics
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      result.results = data.RelatedTopics.slice(0, 5).map((topic: any) => ({
        title: topic.Text || 'No title',
        url: topic.FirstURL || '',
        description: topic.Text || ''
      }));
    }

    // If no results, provide a basic response
    if (!result.answer && result.results.length === 0) {
      result.answer = `I searched for "${query}" but couldn't find detailed results. Try being more specific or check the web directly.`;
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Web search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
