import { loadMarkdownFile } from "@/lib/docs-loader";
import { MarkdownContent } from "@/components/docs/markdown-content";
import { TableOfContents } from "@/components/docs/table-of-contents";
import { notFound } from "next/navigation";

export default async function ClassificationFacetPage() {
  const content = await loadMarkdownFile("classification-facet.md");

  if (!content) {
    notFound();
  }

  return (
    <div className="flex">
      <div className="flex-1 px-8 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 rounded-full">
            Facet Types
          </div>
          <h1 className="text-4xl font-bold mb-2 text-slate-900 dark:text-slate-100">
            Classification Facet
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Specify classification systems and codes
          </p>
        </div>
        <MarkdownContent content={content} />
      </div>
      <TableOfContents content={content} />
    </div>
  );
}
