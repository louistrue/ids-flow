export type DocSection = {
  title: string;
  items: DocItem[];
};

export type DocItem = {
  title: string;
  href: string;
  mdFile?: string; // corresponding markdown file in ids-docs/
  /**
   * Plain-text content for pages that don't have a backing .md file (e.g.
   * Quick Start, which is rendered from inline JSX). Used by the sidebar's
   * full-text search so these pages surface on content matches, not just
   * title matches.
   */
  searchableText?: string;
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
        searchableText: `Quick Start
IDS buildingSMART standard. Build your first IDS specification in about two minutes.
Three concepts: Specification, Applicability, Requirements.
Walkthrough: walls must have a Fire Rating. Add a Specification node. Set name to Wall Fire Rating.
Add Entity, connect to Applicability. Set Name to IFCWALL.
Add Property, connect to Requirements. Set PropertySet to Pset_WallCommon and BaseName to FireRating.
Leave the value empty for a wildcard meaning must exist any value passes.
Validation pill top-right of the canvas. Export IDS.
Property data type is optional in IDS but recommended.
The default canvas already contains a working Walls-FireRating spec.
IFC entity names are upper case in IDS XML, IFCWALL not IfcWall.`,
      },
    ],
  },
  {
    title: "Using the Editor",
    items: [
      {
        title: "Editor interactions",
        href: "/docs/using-the-editor",
        mdFile: "using-the-editor.md",
      },
    ],
  },
  {
    title: "Building Specifications",
    items: [
      {
        title: "Specifications",
        href: "/docs/specifications",
        mdFile: "specifications.md",
      },
      {
        title: "Match any value",
        href: "/docs/match-any-value",
        mdFile: "match-any-value.md",
      },
      {
        title: "Restrictions",
        href: "/docs/restrictions",
        mdFile: "restrictions.md",
      },
      {
        title: "IDS Metadata",
        href: "/docs/metadata",
        mdFile: "ids-metadata.md",
      },
    ],
  },
  {
    title: "Facet Reference",
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
    title: "Integration",
    items: [
      {
        title: "Integration Guide",
        href: "/docs/integration-guide",
        mdFile: "integration-guide.md",
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
