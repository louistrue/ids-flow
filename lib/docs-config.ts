export type DocSection = {
  title: string;
  items: DocItem[];
};

export type DocItem = {
  title: string;
  href: string;
  mdFile?: string; // corresponding markdown file in ids-docs/
};

export const docsConfig: DocSection[] = [
  {
    title: "Getting Started",
    items: [
      {
        title: "Introduction",
        href: "/docs",
        mdFile: "README.md",
      },
      {
        title: "Quick Start",
        href: "/docs/quick-start",
      },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      {
        title: "Specifications",
        href: "/docs/specifications",
        mdFile: "specifications.md",
      },
      {
        title: "IDS Metadata",
        href: "/docs/metadata",
        mdFile: "ids-metadata.md",
      },
    ],
  },
  {
    title: "Facet Types",
    items: [
      {
        title: "Entity Facet",
        href: "/docs/facets/entity",
        mdFile: "entity-facet.md",
      },
      {
        title: "Property Facet",
        href: "/docs/facets/property",
        mdFile: "property-facet.md",
      },
      {
        title: "Attribute Facet",
        href: "/docs/facets/attribute",
        mdFile: "attribute-facet.md",
      },
      {
        title: "Classification Facet",
        href: "/docs/facets/classification",
        mdFile: "classification-facet.md",
      },
      {
        title: "Material Facet",
        href: "/docs/facets/material",
        mdFile: "material-facet.md",
      },
      {
        title: "PartOf Facet",
        href: "/docs/facets/partof",
        mdFile: "partof-facet.md",
      },
    ],
  },
  {
    title: "Advanced Topics",
    items: [
      {
        title: "Restrictions",
        href: "/docs/restrictions",
        mdFile: "restrictions.md",
      },
    ],
  },
  {
    title: "Developer Resources",
    items: [
      {
        title: "Developer Guide",
        href: "/docs/developer-guide",
        mdFile: "developer-guide.md",
      },
    ],
  },
];

// Flatten all docs for easy lookup
export const allDocs = docsConfig.flatMap((section) => section.items);

// Helper to get doc by href
export function getDocByHref(href: string): DocItem | undefined {
  return allDocs.find((doc) => doc.href === href);
}
