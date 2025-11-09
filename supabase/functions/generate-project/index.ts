/// <reference types="https://deno.land/x/supabase@1.7.8/functions/types.d.ts" />

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  prompt?: string;
}

interface GeneratedFile {
  name: string;
  language?: string;
  content: string;
}

interface GeneratedProject {
  summary: string;
  files: GeneratedFile[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY is not set");
    }

    const apiBaseUrl = Deno.env.get("DEEPSEEK_API_BASE_URL")?.replace(/\/+$/, "");
    if (!apiBaseUrl) {
      throw new Error("DEEPSEEK_API_BASE_URL is not set");
    }

    const body = (await req.json()) as GenerateRequest;
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a senior full-stack engineer. Given a user's project description, respond with JSON only.
The JSON must follow this exact TypeScript interface:
{
  "summary": string;
  "files": Array<{ "name": string; "language"?: string; "content": string }>;
}

Guidelines:
- summary: concise explanation of the generated project and how to run it.
- files: produce all essential files needed to run the project. Include HTML/CSS/JS or React files as appropriate.
- Use double quotes in JSON. No Markdown fences or extra commentary. Return valid JSON only.`;

    const deepseekResponse = await fetch(`${apiBaseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-v3",
        temperature: 0.2,
        max_tokens: 4000,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      return new Response(JSON.stringify({ error: errorText }), {
        status: deepseekResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const completion = await deepseekResponse.json();
    const rawText = completion?.choices?.[0]?.message?.content;

    if (typeof rawText !== "string" || !rawText.trim()) {
      throw new Error("DeepSeek did not provide a valid JSON payload.");
    }

    const cleanedText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(cleanedText);
    } catch (_) {
      throw new Error("Failed to parse DeepSeek response as JSON. Ensure the model returns valid JSON.");
    }

    if (typeof parsedJson !== "object" || parsedJson === null) {
      throw new Error("DeepSeek response is not a JSON object.");
    }

    const { summary, files } = parsedJson as Partial<GeneratedProject>;

    const normalized: GeneratedProject = {
      summary: typeof summary === "string" ? summary : "",
      files: Array.isArray(files)
        ? files
            .filter((file): file is GeneratedFile => {
              if (!file || typeof file !== "object") return false;
              const maybeFile = file as Partial<GeneratedFile>;
              return (
                typeof maybeFile.name === "string" &&
                typeof maybeFile.content === "string" &&
                (maybeFile.language === undefined || typeof maybeFile.language === "string")
              );
            })
            .map((file) => ({
              name: file.name,
              content: file.content,
              ...(file.language ? { language: file.language } : {}),
            }))
        : [],
    };

    return new Response(JSON.stringify(normalized), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
