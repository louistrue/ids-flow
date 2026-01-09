"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X, FileText, Box, Tag, Layers, Package, GitBranch, Filter, Database } from "lucide-react";
import { FACET_COLORS } from "@/lib/facet-colors";
import type { IFCVersion } from "@/lib/ifc-schema";

interface MobileNodePaletteProps {
  onAddNode: (type: string, position: { x: number; y: number }) => void;
  ifcVersion: IFCVersion;
}

const nodeCategories = [
  {
    title: "Core",
    nodes: [
      { type: "spec", label: "Specification", icon: FileText },
      { type: "entity", label: "Entity", icon: Box },
      { type: "property", label: "Property", icon: Tag },
    ],
  },
  {
    title: "Advanced",
    nodes: [
      { type: "attribute", label: "Attribute", icon: Database },
      { type: "classification", label: "Classification", icon: Layers },
      { type: "material", label: "Material", icon: Package },
      { type: "partOf", label: "Part Of", icon: GitBranch },
    ],
  },
  {
    title: "Restrictions",
    nodes: [{ type: "restriction", label: "Restriction", icon: Filter }],
  },
];

export function MobileNodePalette({ onAddNode, ifcVersion }: MobileNodePaletteProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddNode = (type: string) => {
    onAddNode(type, { x: 200, y: 200 });
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-30 h-14 w-14 rounded-full shadow-lg"
        size="icon"
        title="Add Node"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Mobile Drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <div className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-semibold">Add Node</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Select a node type to add to canvas
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                {nodeCategories.map((category) => (
                  <div key={category.title}>
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      {category.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {category.nodes.map((node) => {
                        const Icon = node.icon;
                        const facetColor = FACET_COLORS[node.type as keyof typeof FACET_COLORS];
                        return (
                          <Button
                            key={node.type}
                            variant="outline"
                            className="h-auto flex-col gap-2 py-4 hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => handleAddNode(node.type)}
                          >
                            <Icon
                              className="h-6 w-6"
                              style={{ color: facetColor?.border || "currentColor" }}
                            />
                            <span className="text-sm">{node.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </>
      )}
    </>
  );
}
