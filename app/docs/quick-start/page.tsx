import { MarkdownContent } from "@/components/docs/markdown-content";
import { TableOfContents } from "@/components/docs/table-of-contents";

const quickStartContent = `
## Quick Start Guide

Welcome to IDSedit! This guide will help you create your first Information Delivery Specification in minutes.

### What is IDSedit?

IDSedit is a visual graph-based editor for creating IDS (Information Delivery Specification) files. Instead of writing XML by hand, you can drag and drop nodes to build specifications visually.

## Creating Your First Specification

### Step 1: Start with a Specification Node

Every IDS document contains one or more **Specification** nodes. These are the root containers for your requirements.

1. Look at the left sidebar (Node Palette)
2. Find the **Specification** node under "Core Nodes"
3. Drag it onto the canvas

### Step 2: Add Applicability Facets

Applicability defines **what elements** your specification applies to. For example, "all walls" or "all windows on level 1".

Common applicability facets:
- **Entity**: IFC class types (e.g., IfcWall, IfcWindow)
- **Classification**: Classification systems (e.g., Uniclass, OmniClass)
- **PartOf**: Spatial relationships (e.g., elements in a specific building or storey)

**Example:** To specify "all walls":
1. Drag an **Entity** node onto the canvas
2. Connect it to the **Applicability** port of your Specification
3. Select the Entity node and set "Name" to "IFCWALL"

### Step 3: Add Requirement Facets

Requirements define **what information** those applicable elements must have.

Common requirement facets:
- **Property**: Property sets and properties (e.g., FireRating, LoadBearing)
- **Attribute**: IFC attributes (e.g., Name, Description)
- **Material**: Material specifications
- **Classification**: Required classification codes

**Example:** To require a fire rating property:
1. Drag a **Property** node onto the canvas
2. Connect it to the **Requirements** port of your Specification
3. Set "PropertySet" to "Pset_WallCommon"
4. Set "BaseName" to "FireRating"

### Step 4: Add Restrictions (Optional)

Restrictions define **specific values** that properties or attributes must have.

**Example:** To require fire rating to be "R60" or "R90":
1. Drag a **Restriction** node
2. Set type to "Enumeration"
3. Add values: "R60", "R90"
4. Connect it to the Property node's restriction port

## Using Templates

IDSedit comes with pre-built templates for common scenarios:

1. Click the **Templates** button in the toolbar
2. Browse categories: Safety, Structure, Space, Energy, etc.
3. Click a template to load it onto the canvas
4. Customize it for your needs

Popular templates:
- **Fire Rating Check**: Ensures elements have required fire ratings
- **Structural Material**: Specifies required structural materials
- **Space Area Requirements**: Checks minimum space areas

## Keyboard Shortcuts

- **Ctrl+Z**: Undo
- **Ctrl+Shift+Z**: Redo
- **Delete**: Remove selected nodes/edges

## Validating Your IDS

Before exporting, validate your specification:

1. Click **Validate IDS** in the toolbar
2. Review any errors or warnings in the Inspector Panel
3. Fix issues and re-validate

Common validation issues:
- Missing required fields (e.g., Specification name)
- Invalid IFC class names
- Incorrect property set names

## Exporting Your IDS

Once your specification is complete and validated:

1. Click **Export IDS** in the toolbar
2. Your .ids file will be downloaded
3. Use this file with IFC checking software

You can also:
- **Export Canvas**: Save your work as JSON to continue later
- **Import Canvas**: Load a previously saved canvas
- **Import IDS**: Load an existing .ids file for editing

## Next Steps

- Learn about specific [Facet Types](/docs/facets/entity)
- Explore [Restrictions](/docs/restrictions) for advanced value constraints
- Read about [IDS Metadata](/docs/metadata) best practices

## Tips for Success

1. **Start Simple**: Begin with one specification and add complexity gradually
2. **Use Templates**: Modify existing templates rather than building from scratch
3. **Validate Often**: Check your work frequently to catch errors early
4. **Name Things Clearly**: Use descriptive names for specifications
5. **Test with Real Models**: Try your IDS files with actual IFC models

## Getting Help

If you need assistance:
- Review the detailed [Facet Type documentation](/docs/facets/entity)
- Check the [Restrictions guide](/docs/restrictions) for value constraints
- Read the [Developer Guide](/docs/developer-guide) for XML details
`;

export default async function QuickStartPage() {
  return (
    <div className="flex">
      {/* Main Content */}
      <div className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-4xl">
        <div className="mb-6 md:mb-8">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 rounded-full">
            Getting Started
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-900 dark:text-slate-100">
            Quick Start Guide
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400">
            Create your first IDS specification in minutes
          </p>
        </div>
        <MarkdownContent content={quickStartContent} />
      </div>

      {/* Table of Contents */}
      <TableOfContents content={quickStartContent} />
    </div>
  );
}
