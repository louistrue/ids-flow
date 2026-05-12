import { MarkdownContent } from "@/components/docs/markdown-content";
import { TableOfContents } from "@/components/docs/table-of-contents";
import { TipBox } from "@/components/docs/tip-box";
import { CodeBlock } from "@/components/docs/code-block";
import { TabbedContent } from "@/components/docs/tabbed-content";
import { ExampleBox } from "@/components/docs/example-box";

const intro = `
IDS is a buildingSMART standard for declaring information requirements on
IFC models. Instead of writing IDS XML by hand, this editor lets you build
the same document visually: drop facet nodes, wire them into a
**Specification**, and the editor produces a valid \`.ids\` file you can hand
to any conforming checker.

This page gets you to your first exported IDS in about two minutes. Once
you've done it, the [Editor interactions](/docs/using-the-editor) page
covers every shortcut and selection trick.
`;

const closing = `
## Where to next

- [**Editor interactions**](/docs/using-the-editor) — every shortcut, multi-select, duplicate, copy/paste.
- [**Match any value**](/docs/match-any-value) — leave the value field empty for existence-only checks.
- [**Restrictions**](/docs/restrictions) — enumerations, regex patterns, numeric bounds, length limits.
- [**Facet Reference**](/docs/facets/entity) — what each facet matches and how it serialises.

## A handful of practical notes

- IFC entity names are **upper case** in IDS XML: \`IFCWALL\`, not \`IfcWall\`. The editor enforces this.
- Property data type is **optional** in IDS, but recommended — the editor will suggest the right one based on the property name.
- The validation pill top-right of the canvas tells you the moment something is wrong; you don't need to export to find out.
- The default canvas already contains a working \`Walls-FireRating\` spec — feel free to edit it as a starting point rather than build from scratch.
`;

export default async function QuickStartPage() {
  return (
    <div className="flex">
      <div className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-4xl">
        <div className="mb-6 md:mb-8">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 rounded-full">
            Getting Started
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-900 dark:text-slate-100">
            Quick Start
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400">
            Build your first IDS specification in about two minutes
          </p>
        </div>

        <MarkdownContent content={intro} />

        <TipBox type="tip">
          <strong>The three concepts:</strong> a <em>Specification</em> says
          "elements matching this <em>Applicability</em> must satisfy this set
          of <em>Requirements</em>." Everything else in the editor wires up
          those three pieces.
        </TipBox>

        <ExampleBox
          title="Walkthrough: walls must have a Fire Rating"
          description="One specification end-to-end — from blank canvas to exported XML."
        >
          <TabbedContent
            tabs={[
              {
                label: "In the editor",
                content: (
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                      <div>
                        <strong>Add a Specification node</strong>
                        <p className="text-slate-600 dark:text-slate-400">Click <em>Specification</em> in the palette. Give it a name like "Wall Fire Rating".</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                      <div>
                        <strong>Add an Entity, connect to Applicability</strong>
                        <p className="text-slate-600 dark:text-slate-400">Click <em>Entity</em>, set its Name to <code className="font-mono text-xs">IFCWALL</code>, then drag from the entity's right-side port to the spec's <em>Applicability</em> port.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</div>
                      <div>
                        <strong>Add a Property, connect to Requirements</strong>
                        <p className="text-slate-600 dark:text-slate-400">Click <em>Property</em>. Set <em>Property Set</em> to <code className="font-mono text-xs">Pset_WallCommon</code> and <em>Base Name</em> to <code className="font-mono text-xs">FireRating</code>. Leave the value empty — that's a wildcard meaning "must exist, any value passes". Wire it into <em>Requirements</em>.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">✓</div>
                      <div>
                        <strong>Check the validation pill, then export</strong>
                        <p className="text-slate-600 dark:text-slate-400">Top-right of the canvas: green = your XML is valid. Toolbar → <em>Export</em> → <em>IDS (.ids)</em>.</p>
                      </div>
                    </div>
                  </div>
                )
              },
              {
                label: "What it produces",
                content: (
                  <CodeBlock
                    language="xml"
                    title="Wall Fire Rating.ids"
                    code={`<specification name="Wall Fire Rating" ifcVersion="IFC4X3_ADD2">
  <applicability>
    <entity>
      <name>
        <simpleValue>IFCWALL</simpleValue>
      </name>
    </entity>
  </applicability>
  <requirements>
    <property cardinality="required">
      <propertySet>
        <simpleValue>Pset_WallCommon</simpleValue>
      </propertySet>
      <baseName>
        <simpleValue>FireRating</simpleValue>
      </baseName>
    </property>
  </requirements>
</specification>`}
                  />
                )
              }
            ]}
          />
        </ExampleBox>

        <TipBox type="info">
          <strong>That empty value is intentional.</strong> A property requirement
          with no <code className="font-mono text-xs">&lt;value&gt;</code> means
          "this property must be present, regardless of what it's set to". To
          require a specific value (or a list of allowed values), see
          <a href="/docs/match-any-value" className="ml-1 text-blue-600 dark:text-blue-400 hover:underline">Match any value</a>
          and
          <a href="/docs/restrictions" className="ml-1 text-blue-600 dark:text-blue-400 hover:underline">Restrictions</a>.
        </TipBox>

        <MarkdownContent content={closing} />
      </div>

      <TableOfContents content={intro + closing} />
    </div>
  );
}
