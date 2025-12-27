import { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, Lightbulb } from "lucide-react";

interface TipBoxProps {
  type?: "info" | "tip" | "warning" | "success";
  children: ReactNode;
}

export function TipBox({ type = "info", children }: TipBoxProps) {
  const configs = {
    info: {
      icon: Info,
      bg: "bg-blue-50 dark:bg-blue-950/20",
      border: "border-blue-200 dark:border-blue-800",
      iconColor: "text-blue-600 dark:text-blue-400",
      title: "Info",
    },
    tip: {
      icon: Lightbulb,
      bg: "bg-yellow-50 dark:bg-yellow-950/20",
      border: "border-yellow-200 dark:border-yellow-800",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      title: "Tip",
    },
    warning: {
      icon: AlertCircle,
      bg: "bg-orange-50 dark:bg-orange-950/20",
      border: "border-orange-200 dark:border-orange-800",
      iconColor: "text-orange-600 dark:text-orange-400",
      title: "Warning",
    },
    success: {
      icon: CheckCircle2,
      bg: "bg-green-50 dark:bg-green-950/20",
      border: "border-green-200 dark:border-green-800",
      iconColor: "text-green-600 dark:text-green-400",
      title: "Success",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className={`my-6 p-4 rounded-lg border-l-4 ${config.bg} ${config.border}`}>
      <div className="flex gap-3">
        <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1">
          <div className={`font-semibold mb-1 ${config.iconColor}`}>
            {config.title}
          </div>
          <div className="text-sm text-slate-700 dark:text-slate-300">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
