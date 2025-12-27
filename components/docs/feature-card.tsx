"use client";

import { Card } from "@/components/ui/card";
import { Box, Tag, FileText, Workflow, CheckCircle, Zap } from "lucide-react";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  color?: string;
}

export function FeatureCard({ icon, title, description, color = "blue" }: FeatureCardProps) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    pink: "from-pink-500 to-pink-600",
  };

  const iconMap = {
    box: Box,
    tag: Tag,
    fileText: FileText,
    workflow: Workflow,
    checkCircle: CheckCircle,
    zap: Zap,
  };

  const Icon = iconMap[icon as keyof typeof iconMap] || Box;

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </Card>
  );
}
