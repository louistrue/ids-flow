import { loadMarkdownFile } from "@/lib/docs-loader";
import { MarkdownContent } from "@/components/docs/markdown-content";
import { TableOfContents } from "@/components/docs/table-of-contents";
import { notFound } from "next/navigation";

export default async function RestrictionsPage() {
  const content = await loadMarkdownFile("restrictions.md");

  if (!content) {
    notFound();
  }

  return (
    <div className="flex">
      <div className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-4xl">
        <div className="mb-6 md:mb-8">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100 rounded-full">
            Advanced Topics
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-900 dark:text-slate-100">
            Restrictions
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400">
            Learn how to specify complex value restrictions
          </p>
        </div>
        <MarkdownContent content={content} />
      </div>
      <TableOfContents content={content} />
    </div>
  );
}
