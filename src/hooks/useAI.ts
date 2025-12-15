import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAICourseRecommendations = () => {
  return useMutation({
    mutationFn: async ({ userInterests, savedCourses, academicLevel }: {
      userInterests?: string;
      savedCourses?: any[];
      academicLevel?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("ai-course-recommendations", {
        body: { userInterests, savedCourses, academicLevel },
      });

      if (error) throw error;
      return data;
    },
  });
};

export const useAIStudyAdvisor = () => {
  return useMutation({
    mutationFn: async ({ messages, userContext }: {
      messages: { role: string; content: string }[];
      userContext?: any;
    }) => {
      const { data, error } = await supabase.functions.invoke("ai-study-advisor", {
        body: { messages, userContext, stream: false },
      });

      if (error) throw error;
      return data;
    },
  });
};

// Streaming version for real-time token display
export const streamAIStudyAdvisor = async ({
  messages,
  userContext,
  onDelta,
  onDone,
  onSearchingDatabase,
}: {
  messages: { role: string; content: string }[];
  userContext?: any;
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onSearchingDatabase?: (searching: boolean) => void;
}) => {
  const CHAT_URL = `https://zbgcvuocupxfugtfjids.supabase.co/functions/v1/ai-study-advisor`;

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiZ2N2dW9jdXB4ZnVndGZqaWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MzE2NjgsImV4cCI6MjA3OTQwNzY2OH0.FbAlFRNtIKBapKuqp-f3CeHo3bbp_a2VThgHHqp1rwc`,
    },
    body: JSON.stringify({ messages, userContext, stream: true }),
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({ error: "Stream failed" }));
    throw new Error(errorData.error || `HTTP ${resp.status}`);
  }

  if (!resp.body) throw new Error("No response body");

  // Notify that database search might be starting
  onSearchingDatabase?.(true);

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    // Process line-by-line as data arrives
    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) {
          // First content received means search is done, now streaming
          onSearchingDatabase?.(false);
          onDelta(content);
        }
      } catch {
        // Incomplete JSON split across chunks: put it back and wait for more data
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Final flush
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore partial leftovers */ }
    }
  }

  onDone();
};

export const useAIEmailDraft = () => {
  return useMutation({
    mutationFn: async ({ purpose, recipient, context }: {
      purpose: string;
      recipient: string;
      context?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("ai-email-draft", {
        body: { purpose, recipient, context },
      });

      if (error) throw error;
      return data;
    },
  });
};
