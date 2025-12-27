"use client";

import { useState } from "react";

interface Tab {
  label: string;
  content: React.ReactNode;
}

interface TabbedContentProps {
  tabs: Tab[];
}

export function TabbedContent({ tabs }: TabbedContentProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="my-6">
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === index
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {tab.label}
            {activeTab === index && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs[activeTab].content}
      </div>
    </div>
  );
}
