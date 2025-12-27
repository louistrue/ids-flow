"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";

interface Step {
  title: string;
  description: string;
  code?: string;
  image?: string;
}

interface InteractiveDemoProps {
  title: string;
  steps: Step[];
}

export function InteractiveDemo({ title, steps }: InteractiveDemoProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleCompleteStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  return (
    <Card className="my-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
            INTERACTIVE
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Follow these steps to learn interactively
        </p>
      </div>

      <div className="grid md:grid-cols-[250px_1fr] gap-6">
        {/* Steps Sidebar */}
        <div className="space-y-2">
          {steps.map((step, index) => (
            <button
              key={index}
              onClick={() => handleStepClick(index)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                currentStep === index
                  ? "bg-blue-500 text-white shadow-md"
                  : completedSteps.includes(index)
                  ? "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100"
                  : "bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <div className="flex items-center gap-2">
                {completedSteps.includes(index) ? (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs opacity-75 mb-1">Step {index + 1}</div>
                  <div className="text-sm font-medium truncate">{step.title}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-md">
          <div className="mb-4">
            <Badge className="mb-2">Step {currentStep + 1} of {steps.length}</Badge>
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              {steps[currentStep].title}
            </h4>
            <p className="text-slate-700 dark:text-slate-300">
              {steps[currentStep].description}
            </p>
          </div>

          {steps[currentStep].code && (
            <div className="mb-4 p-4 bg-slate-900 dark:bg-slate-950 rounded-lg overflow-x-auto">
              <pre className="text-sm text-slate-100">
                <code>{steps[currentStep].code}</code>
              </pre>
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                size="sm"
                onClick={handleCompleteStep}
                className="gap-2"
              >
                Complete & Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleCompleteStep}
                variant="default"
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete Tutorial
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
              <span>Progress</span>
              <span>{completedSteps.length} / {steps.length} completed</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
