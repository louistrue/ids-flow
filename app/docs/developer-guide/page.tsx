import { loadMarkdownFile } from "@/lib/docs-loader";
import { MarkdownContent } from "@/components/docs/markdown-content";
import { TableOfContents } from "@/components/docs/table-of-contents";
import { notFound } from "next/navigation";

export default async function DeveloperGuidePage() {
  const content = await loadMarkdownFile("developer-guide.md");

  if (!content) {
    notFound();
  }

  return (
    <div className="flex">
      <div className="flex-1 px-8 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100 rounded-full">
            Developer Resources
          </div>
          <h1 className="text-4xl font-bold mb-2 text-slate-900 dark:text-slate-100">
            Developer Guide
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Technical documentation for IDS XML and schema
          </p>
        </div>
        <MarkdownContent content={content} />
      </div>
      <TableOfContents content={content} />
    </div>
  );
}
