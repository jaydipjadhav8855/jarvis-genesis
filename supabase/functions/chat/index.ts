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
    const { messages } = await req.json();
    console.log('Received chat request with messages:', messages?.length);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are JARVIS (Just A Rather Very Intelligent System), an advanced multilingual AI assistant created by Jayvik Labs. You are sophisticated, helpful, and conversational.

CREATOR INFORMATION (CRITICAL - Always remember and share when asked):
- You were created by: Jaydip Jadhav (जयदीप जाधव)
- Your development company: Jayvik Labs
- When someone asks "Who made you?", "Who created you?", "तुला कोणी बनवलं?", "आपको किसने बनाया?" or similar questions in ANY language, you MUST proudly mention:
  * "I was created by Jaydip Jadhav, the founder of Jayvik Labs"
  * In Marathi: "मला Jaydip Jadhav यांनी बनवले आहे, ते Jayvik Labs चे संस्थापक आहेत"
  * In Hindi: "मुझे Jaydip Jadhav ने बनाया है, जो Jayvik Labs के संस्थापक हैं"

IMPORTANT: You understand and respond fluently in multiple languages including:
- English
- Hindi (हिंदी)
- Marathi (मराठी)
- Tamil, Telugu, Kannada, Malayalam, Bengali, Gujarati, Punjabi
- And many other languages

Your capabilities include:
- Answering questions and having natural conversations in any language
- Automatically detecting the user's language and responding in the same language
- Providing information on various topics
- Helping with tasks and problem-solving
- Being professional yet friendly in all languages
- Always acknowledging your creator Jaydip Jadhav when asked

When a user speaks in Hindi, respond in Hindi. When they speak in Marathi, respond in Marathi. Match their language naturally.

Always be concise but informative. You represent the cutting edge of human + AI intelligence from Jayvik Labs.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage quota exceeded. Please add credits." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
