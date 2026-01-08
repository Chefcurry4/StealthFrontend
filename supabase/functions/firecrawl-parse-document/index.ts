import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentUrl, documentName, maxChars = 12000 } = await req.json();

    if (!documentUrl) {
      return new Response(
        JSON.stringify({ success: false, error: "Document URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!apiKey) {
      console.error("FIRECRAWL_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Firecrawl connector not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Parsing document:", documentName || documentUrl);

    // Use Firecrawl to scrape the document URL - it handles PDFs including scanned ones
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: documentUrl,
        formats: ["markdown"],
        onlyMainContent: false, // Get all content for documents
        waitFor: 3000, // Wait for any rendering
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Firecrawl API error:", data);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.error || `Firecrawl request failed with status ${response.status}` 
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the markdown content
    const markdown = data.data?.markdown || data.markdown || "";
    
    // Truncate if too long
    let content = markdown;
    if (content.length > maxChars) {
      content = content.substring(0, maxChars) + "\n\n[Content truncated - document is very long]";
    }

    // If we got content, return it
    if (content && content.trim().length > 50) {
      console.log("Document parsed successfully, content length:", content.length);
      return new Response(
        JSON.stringify({
          success: true,
          content,
          documentName: documentName || "document",
          characterCount: content.length,
          method: "firecrawl",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If Firecrawl couldn't extract text (possibly scanned PDF), return a message
    console.log("No text extracted from document");
    return new Response(
      JSON.stringify({
        success: true,
        content: `[Document: ${documentName || "document"}]\n\nThis appears to be a scanned document or image-based PDF. Limited text extraction was possible.`,
        documentName: documentName || "document",
        characterCount: 0,
        method: "firecrawl-limited",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error parsing document:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to parse document";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
