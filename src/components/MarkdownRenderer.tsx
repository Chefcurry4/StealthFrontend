import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Sanitize URLs used in markdown links to prevent javascript: and similar schemes
const sanitizeUrl = (rawUrl: string): string => {
  const url = rawUrl.trim();

  if (!url) {
    return "#";
  }

  // Allow relative URLs (no scheme)
  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url);
  if (!hasScheme) {
    return url;
  }

  try {
    const parsed = new URL(url, window.location.origin);
    const allowedSchemes = ["http:", "https:", "mailto:", "tel:"];
    if (allowedSchemes.includes(parsed.protocol)) {
      return url;
    }
  } catch {
    // Fall through to return safe default
  }

  return "#";
};

export const MarkdownRenderer = ({ content, className }: MarkdownRendererProps) => {
  const renderMarkdown = (text: string): React.ReactNode[] => {
    // Remove hidden semester plan data (AI internal use only)
    const cleanedText = text.replace(/<!--SEMESTERPLAN:.*?-->/gs, '').trim();
    const lines = cleanedText.split("\n");
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let listType: "ul" | "ol" | null = null;
    let codeBlock: string[] = [];
    let inCodeBlock = false;
    let codeLanguage = "";

    const flushList = () => {
      if (listItems.length > 0 && listType) {
        const ListTag = listType;
        elements.push(
          <ListTag key={`list-${elements.length}`} className={cn(
            "my-2 pl-4",
            listType === "ul" ? "list-disc" : "list-decimal"
          )}>
            {listItems.map((item, i) => (
              <li key={i} className="ml-2">{renderInline(item)}</li>
            ))}
          </ListTag>
        );
        listItems = [];
        listType = null;
      }
    };

    const flushCodeBlock = () => {
      if (codeBlock.length > 0) {
        elements.push(
          <pre key={`code-${elements.length}`} className="my-3 p-3 rounded-lg bg-muted/50 overflow-x-auto border border-border/50">
            <code className="text-sm font-mono text-foreground/90">
              {codeBlock.join("\n")}
            </code>
          </pre>
        );
        codeBlock = [];
        inCodeBlock = false;
        codeLanguage = "";
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block start/end
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          flushCodeBlock();
        } else {
          flushList();
          inCodeBlock = true;
          codeLanguage = line.slice(3).trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlock.push(line);
        continue;
      }

      // Headers
      if (line.startsWith("### ")) {
        flushList();
        elements.push(
          <h3 key={`h3-${i}`} className="text-base font-semibold mt-4 mb-2 text-foreground">
            {renderInline(line.slice(4))}
          </h3>
        );
        continue;
      }
      if (line.startsWith("## ")) {
        flushList();
        elements.push(
          <h2 key={`h2-${i}`} className="text-lg font-semibold mt-4 mb-2 text-foreground">
            {renderInline(line.slice(3))}
          </h2>
        );
        continue;
      }
      if (line.startsWith("# ")) {
        flushList();
        elements.push(
          <h1 key={`h1-${i}`} className="text-xl font-bold mt-4 mb-2 text-foreground">
            {renderInline(line.slice(2))}
          </h1>
        );
        continue;
      }

      // Unordered list
      if (line.match(/^[\-\*]\s/)) {
        if (listType !== "ul") {
          flushList();
          listType = "ul";
        }
        listItems.push(line.slice(2));
        continue;
      }

      // Ordered list
      if (line.match(/^\d+\.\s/)) {
        if (listType !== "ol") {
          flushList();
          listType = "ol";
        }
        listItems.push(line.replace(/^\d+\.\s/, ""));
        continue;
      }

      // Horizontal rule
      if (line.match(/^[\-\*_]{3,}$/)) {
        flushList();
        elements.push(<hr key={`hr-${i}`} className="my-4 border-border/50" />);
        continue;
      }

      // Blockquote
      if (line.startsWith("> ")) {
        flushList();
        elements.push(
          <blockquote key={`bq-${i}`} className="border-l-2 border-primary/30 pl-3 my-2 italic text-muted-foreground">
            {renderInline(line.slice(2))}
          </blockquote>
        );
        continue;
      }

      // Empty line
      if (line.trim() === "") {
        flushList();
        continue;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={`p-${i}`} className="my-1.5 leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }

    flushList();
    flushCodeBlock();

    return elements;
  };

  const renderInline = (text: string): React.ReactNode => {
    // Process inline elements: bold, italic, code, links
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Bold: **text** or __text__
      const boldMatch = remaining.match(/^(\*\*|__)(.+?)\1/);
      if (boldMatch) {
        parts.push(<strong key={key++} className="font-semibold">{boldMatch[2]}</strong>);
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Italic: *text* or _text_
      const italicMatch = remaining.match(/^(\*|_)(.+?)\1/);
      if (italicMatch) {
        parts.push(<em key={key++}>{italicMatch[2]}</em>);
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Inline code: `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(
          <code key={key++} className="px-1.5 py-0.5 rounded bg-muted/50 text-sm font-mono text-primary/80">
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Links: [text](url)
      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a 
            key={key++} 
            href={sanitizeUrl(linkMatch[2])} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.slice(linkMatch[0].length);
        continue;
      }

      // Regular text - find next special character or take all remaining
      const nextSpecial = remaining.search(/[\*_`\[]/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        // Special char at start but no match - treat as regular text
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return parts.length === 1 ? parts[0] : parts;
  };

  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      {renderMarkdown(content)}
    </div>
  );
};
