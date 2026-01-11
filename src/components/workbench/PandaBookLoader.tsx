import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface PandaBookLoaderProps {
  size?: number;
  className?: string;
  mode?: "thinking" | "searching" | "planning" | "generating";
}

/**
 * Animated panda-to-book loader inspired by stroke-dash animations
 * The panda draws first then morphs into a book
 */
export const PandaBookLoader = ({ 
  size = 48, 
  className = "",
  mode = "thinking"
}: PandaBookLoaderProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Initialize stroke-dash animation on mount
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    
    const paths = svg.querySelectorAll("path");
    paths.forEach((p) => {
      const len = Math.ceil(p.getTotalLength());
      p.style.setProperty("--len", String(len));
      p.style.strokeDasharray = String(len);
      p.style.strokeDashoffset = String(len);
    });
  }, []);
  
  // Different color themes based on mode
  const colorClass = {
    thinking: "text-primary",
    searching: "text-primary",
    planning: "text-amber-500 dark:text-amber-400",
    generating: "text-emerald-500 dark:text-emerald-400"
  }[mode];

  return (
    <div 
      className={cn("icon-wrap inline-flex items-center justify-center", className)}
      style={{ 
        width: size, 
        height: size,
        ["--size" as string]: `${size}px`,
        ["--dur" as string]: "2800ms"
      }}
      aria-label="Panda morphs into a book"
    >
      <svg
        ref={svgRef}
        id="pandaBook"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        role="img"
        className={cn("w-full h-full", colorClass)}
        style={{ overflow: "visible" }}
      >
        <style>{`
          path {
            fill: none;
            stroke: currentColor;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
            stroke-dashoffset: var(--len);
          }
          
          /* Panda draws first, then fades out */
          .panda path {
            animation: pandaDraw var(--dur) ease-in-out infinite forwards;
          }
          
          /* Book starts later, draws in, stays */
          .book path {
            animation: bookDraw var(--dur) ease-in-out infinite forwards;
          }
          
          @keyframes pandaDraw {
            0%   { stroke-dashoffset: var(--len); opacity: 0; transform: scale(0.98); }
            8%   { opacity: 1; }
            30%  { stroke-dashoffset: 0; opacity: 1; transform: scale(1); }
            55%  { stroke-dashoffset: 0; opacity: 1; }
            70%  { stroke-dashoffset: 0; opacity: 0; }
            100% { stroke-dashoffset: 0; opacity: 0; }
          }
          
          @keyframes bookDraw {
            0%   { stroke-dashoffset: var(--len); opacity: 0; transform: scale(0.98); }
            45%  { stroke-dashoffset: var(--len); opacity: 0; }
            60%  { opacity: 1; }
            88%  { stroke-dashoffset: 0; opacity: 1; transform: scale(1); }
            100% { stroke-dashoffset: 0; opacity: 1; }
          }
          
          /* Respect reduced-motion: show final (book) */
          @media (prefers-reduced-motion: reduce) {
            .panda { display: none; }
            .book path { animation: none; stroke-dashoffset: 0; opacity: 1; }
          }
        `}</style>
        
        {/* PANDA (with X eyes) */}
        <g className="panda">
          {/* mouth */}
          <path d="M11.25 17.25h1.5L12 18z" />
          
          {/* X eyes (left) */}
          <path d="M7.8 11.2l1.8 1.8" />
          <path d="M9.6 11.2l-1.8 1.8" />
          
          {/* X eyes (right) */}
          <path d="M14.4 11.2l1.8 1.8" />
          <path d="M16.2 11.2l-1.8 1.8" />
          
          {/* head/body outline */}
          <path d="M18 6.5a.5.5 0 0 0-.5-.5" />
          <path d="M20.69 9.67a4.5 4.5 0 1 0-7.04-5.5 8.35 8.35 0 0 0-3.3 0 4.5 4.5 0 1 0-7.04 5.5C2.49 11.2 2 12.88 2 14.5 2 19.47 6.48 22 12 22s10-2.53 10-7.5c0-1.62-.48-3.3-1.3-4.83" />
          <path d="M6 6.5a.495.495 0 0 1 .5-.5" />
        </g>
        
        {/* BOOK (Lucide book icon) */}
        <g className="book">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </g>
      </svg>
    </div>
  );
};

export default PandaBookLoader;
