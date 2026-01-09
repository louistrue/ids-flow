"use client";

import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface ExampleBoxProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function ExampleBox({ title, description, children }: ExampleBoxProps) {
  return (
    <Card className="my-6 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-l-4 border-amber-500 p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
              {title}
            </h4>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {description}
            </p>
          </div>
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-slate-950">
        {children}
      </div>
    </Card>
  );
}
