"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, language = "typescript", title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      {title && (
        <div className="bg-slate-800 dark:bg-slate-900 text-slate-200 px-4 py-2 text-sm font-semibold rounded-t-lg border-b border-slate-700">
          {title}
        </div>
      )}
      <div className="relative">
        <pre className={`bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 overflow-x-auto ${title ? 'rounded-b-lg' : 'rounded-lg'}`}>
          <code className={`language-${language} text-sm`}>{code}</code>
        </pre>
        <Button
          size="sm"
          variant="ghost"
          onClick={copyToClipboard}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 hover:bg-slate-700 text-slate-200"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
