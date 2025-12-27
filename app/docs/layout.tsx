import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { MobileDocsNav } from "@/components/docs/mobile-docs-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation - Desktop */}
      <DocsSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-[90] border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 md:px-8 py-4">
            <div className="flex items-center gap-4">
              <MobileDocsNav />
              <div>
                <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100">
                  IDSedit Documentation
                </h1>
                <p className="hidden sm:block text-sm text-slate-600 dark:text-slate-400">
                  Learn how to create Information Delivery Specifications
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
