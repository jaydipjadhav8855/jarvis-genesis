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
    const contentType = req.headers.get('content-type');
    
    let fileData: string;
    let mimeType: string;
    let analysisType: string;

    if (contentType?.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const type = formData.get('type') as string;
      
      if (!file) {
        throw new Error('No file provided');
      }

      analysisType = type || 'general';
      mimeType = file.type;
      
      // Convert file to base64
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const base64 = btoa(String.fromCharCode(...bytes));
      fileData = base64;
      
      console.log(`Processing ${file.name} (${file.type}, ${file.size} bytes)`);
    } else {
      const json = await req.json();
      fileData = json.fileData;
      mimeType = json.mimeType;
      analysisType = json.analysisType || 'general';
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Prepare prompt based on analysis type
    let prompt = '';
    if (analysisType === 'document') {
      prompt = 'Analyze this document. Extract key information, summarize the content, identify main topics, and provide insights. Be thorough and detailed.';
    } else if (analysisType === 'image') {
      prompt = 'Analyze this image in detail. Describe what you see, identify objects, text, people, colors, and any notable features. Provide a comprehensive analysis.';
    } else if (analysisType === 'code') {
      prompt = 'Analyze this code file. Explain what it does, identify the programming language, review code quality, suggest improvements, and point out any potential issues.';
    } else {
      prompt = 'Analyze this file comprehensively. Extract all relevant information, summarize content, and provide detailed insights about what this file contains.';
    }

    // Determine if file is image
    const isImage = mimeType.startsWith('image/');
    
    // Prepare request body for Gemini API
    const requestBody: any = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    };

    // Add inline data for images and documents
    if (isImage || mimeType.includes('pdf') || mimeType.includes('document')) {
      requestBody.contents[0].parts.push({
        inline_data: {
          mime_type: mimeType,
          data: fileData
        }
      });
    } else {
      // For text files, decode and add as text
      try {
        const decoded = atob(fileData);
        requestBody.contents[0].parts.push({ text: `File content:\n\n${decoded}` });
      } catch {
        requestBody.contents[0].parts.push({
          inline_data: {
            mime_type: mimeType,
            data: fileData
          }
        });
      }
    }

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log('Calling Gemini API...');
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis generated';

    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        analysis,
        mimeType,
        analysisType
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("File analysis error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
