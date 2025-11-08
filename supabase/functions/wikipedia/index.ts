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
    const { query, language = 'en' } = await req.json();
    console.log('Wikipedia search:', query, 'language:', language);

    if (!query) {
      throw new Error('Query is required');
    }

    // Search Wikipedia
    const searchUrl = `https://${language}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=1`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.query?.search?.length) {
      return new Response(
        JSON.stringify({ 
          error: 'No results found',
          query: query 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pageId = searchData.query.search[0].pageid;
    const title = searchData.query.search[0].title;

    // Get page content
    const contentUrl = `https://${language}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&pageids=${pageId}&format=json`;
    const contentResponse = await fetch(contentUrl);
    const contentData = await contentResponse.json();

    const extract = contentData.query?.pages?.[pageId]?.extract || 'No content available';
    const summary = extract.split('\n')[0].substring(0, 500) + '...';

    return new Response(
      JSON.stringify({ 
        title,
        summary,
        url: `https://${language}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`,
        fullText: extract
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Wikipedia error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
