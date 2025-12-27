import { loadMarkdownFile } from "@/lib/docs-loader";
import { MarkdownContent } from "@/components/docs/markdown-content";
import { TableOfContents } from "@/components/docs/table-of-contents";
import { notFound } from "next/navigation";

export default async function DocsPage() {
  const content = await loadMarkdownFile("README.md");

  if (!content) {
    notFound();
  }

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="flex-1 px-8 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 rounded-full">
            Getting Started
          </div>
          <h1 className="text-4xl font-bold mb-2 text-slate-900 dark:text-slate-100">
            Introduction to IDS
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Learn about Information Delivery Specifications and how to use IDSedit
          </p>
        </div>
        <MarkdownContent content={content} />
      </div>

      {/* Table of Contents */}
      <TableOfContents content={content} />
    </div>
  );
}
