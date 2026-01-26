"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidDiagramProps {
  chart: string;
}

// Initialize mermaid with theme settings
mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "inherit",
});

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (!containerRef.current) return;

      try {
        // Generate unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

        // Check if we're in dark mode
        const isDark = document.documentElement.classList.contains("dark");

        // Update mermaid config for current theme
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? "dark" : "default",
          securityLevel: "loose",
          fontFamily: "inherit",
          themeVariables: isDark
            ? {
                primaryColor: "#3b82f6",
                primaryTextColor: "#f8fafc",
                primaryBorderColor: "#60a5fa",
                lineColor: "#94a3b8",
                secondaryColor: "#1e293b",
                tertiaryColor: "#334155",
                background: "#0f172a",
                mainBkg: "#1e293b",
                nodeBorder: "#475569",
                clusterBkg: "#1e293b",
                titleColor: "#f8fafc",
                edgeLabelBackground: "#1e293b",
              }
            : {
                primaryColor: "#3b82f6",
                primaryTextColor: "#1e293b",
                primaryBorderColor: "#2563eb",
                lineColor: "#64748b",
                secondaryColor: "#f1f5f9",
                tertiaryColor: "#e2e8f0",
              },
        });

        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
        setError(null);
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        setError("Failed to render diagram");
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="my-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        <pre className="mt-2 text-xs text-slate-600 dark:text-slate-400 overflow-x-auto">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-6 flex justify-center overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
