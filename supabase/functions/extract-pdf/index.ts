import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { decompress } from "npm:pako@2.1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ExtractRequest {
  pdf_bytes: number[];
}

function extractTextFromPdf(pdfBytes: Uint8Array): string {
  const pdfStr = new TextDecoder('utf-8', { fatal: false }).decode(pdfBytes);

  let fullText = '';

  const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
  let match;

  while ((match = streamRegex.exec(pdfStr)) !== null) {
    const streamContent = match[1];

    try {
      const bytes = new Uint8Array(streamContent.length);
      for (let i = 0; i < streamContent.length; i++) {
        bytes[i] = streamContent.charCodeAt(i);
      }

      const decompressed = decompress(bytes, { to: 'string' });
      fullText += decompressed + '\n';
    } catch {
      fullText += streamContent + '\n';
    }
  }

  const lines = fullText
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 2;
    })
    .map(line => line.trim())
    .filter(line => {
      return !line.match(/^[<>%\[\]{}]+$/) &&
             !line.startsWith('<<') &&
             !line.startsWith('>>') &&
             !line.includes('endobj') &&
             !line.match(/^\/[A-Z]/);
    })
    .join('\n');

  return lines.substring(0, 10000).trim();
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { pdf_bytes }: ExtractRequest = await req.json();

    if (!pdf_bytes || !Array.isArray(pdf_bytes)) {
      return new Response(
        JSON.stringify({ error: 'Invalid PDF bytes' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const uint8Array = new Uint8Array(pdf_bytes);
    const extractedText = extractTextFromPdf(uint8Array);

    return new Response(
      JSON.stringify({
        text: extractedText,
        success: true,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('PDF extraction error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'PDF extraction failed',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
