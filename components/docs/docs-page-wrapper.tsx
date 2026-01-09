import { MarkdownContent } from "./markdown-content";
import { TableOfContents } from "./table-of-contents";

interface DocsPageWrapperProps {
  badge: string;
  title: string;
  description: string;
  content: string;
}

export function DocsPageWrapper({ badge, title, description, content }: DocsPageWrapperProps) {
  return (
    <div className="flex">
      {/* Main Content */}
      <div className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-4xl">
        <div className="mb-6 md:mb-8">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 rounded-full">
            {badge}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-900 dark:text-slate-100">
            {title}
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>
        <MarkdownContent content={content} />
      </div>

      {/* Table of Contents */}
      <TableOfContents content={content} />
    </div>
  );
}
