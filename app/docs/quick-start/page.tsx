import { MarkdownContent } from "@/components/docs/markdown-content";
import { TableOfContents } from "@/components/docs/table-of-contents";
import { FeatureCard } from "@/components/docs/feature-card";
import { TipBox } from "@/components/docs/tip-box";
import { CodeBlock } from "@/components/docs/code-block";
import { CollapsibleSection } from "@/components/docs/collapsible-section";
import { TabbedContent } from "@/components/docs/tabbed-content";
import { ExampleBox } from "@/components/docs/example-box";

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

        <TipBox type="tip">
          <strong>New to IDS?</strong> Start by understanding the three key components: Specifications, Applicability, and Requirements. Then build your first spec using the examples below.
        </TipBox>

        <ExampleBox
          title="Example: Fire Rating for Walls"
          description="This common example shows how to require all walls to have a fire rating property."
        >
          <div className="space-y-4">
            <div>
              <h5 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">What you'll create:</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <li>A specification that applies to all IfcWall elements</li>
                <li>Requires the FireRating property from Pset_WallCommon</li>
                <li>Validates that this property exists in your IFC model</li>
              </ul>
            </div>

            <TabbedContent
              tabs={[
                {
                  label: "Visual Steps",
                  content: (
                    <div className="space-y-3 text-sm">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                        <div>
                          <strong>Add Specification Node</strong>
                          <p className="text-slate-600 dark:text-slate-400">From the Node Palette, drag a "Specification" node to the canvas. Set its Name to "Wall Fire Rating Check".</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                        <div>
                          <strong>Add Entity Applicability</strong>
                          <p className="text-slate-600 dark:text-slate-400">Drag an "Entity" node and connect it to the Applicability port. Set Name to "IFCWALL".</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</div>
                        <div>
                          <strong>Add Property Requirement</strong>
                          <p className="text-slate-600 dark:text-slate-400">Drag a "Property" node and connect it to the Requirements port. Set PropertySet to "Pset_WallCommon" and BaseName to "FireRating".</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">✓</div>
                        <div>
                          <strong>Validate & Export</strong>
                          <p className="text-slate-600 dark:text-slate-400">Click "Validate IDS" to check for errors, then "Export IDS" to save your specification.</p>
                        </div>
                      </div>
                    </div>
                  )
                },
                {
                  label: "Resulting XML",
                  content: (
                    <CodeBlock
                      language="xml"
                      title="Generated IDS Output"
                      code={`<specification name="Wall Fire Rating Check">
  <applicability>
    <entity>
      <name>
        <simpleValue>IFCWALL</simpleValue>
      </name>
    </entity>
  </applicability>
  <requirements>
    <property>
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
          </div>
        </ExampleBox>

        <h2 className="text-2xl font-bold mt-12 mb-6 text-slate-900 dark:text-slate-100">
          Key Features
        </h2>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <FeatureCard
            icon="box"
            title="Visual Graph Editor"
            description="Drag and drop nodes to build specifications visually without writing XML"
            color="blue"
          />
          <FeatureCard
            icon="tag"
            title="7 Facet Types"
            description="Entity, Property, Attribute, Classification, Material, PartOf, and Restrictions"
            color="purple"
          />
          <FeatureCard
            icon="workflow"
            title="Pre-built Templates"
            description="15+ ready-to-use templates for common scenarios like fire safety and materials"
            color="green"
          />
          <FeatureCard
            icon="checkCircle"
            title="Real-time Validation"
            description="Automatic validation with detailed error messages and fix suggestions"
            color="orange"
          />
        </div>

        <h2 className="text-2xl font-bold mt-12 mb-6 text-slate-900 dark:text-slate-100">
          Common Patterns
        </h2>

        <CollapsibleSection title="Using Classification Systems (Uniclass, OmniClass)" defaultOpen={true}>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Classification facets let you specify elements based on their classification codes rather than IFC types.
          </p>
          <CodeBlock
            language="text"
            title="Example: Uniclass for Doors"
            code={`1. Add a Classification node to Applicability
2. Set System to "Uniclass 2015"
3. Set Value to "Pr_40_10_36" (doors)

This will match all elements classified with this Uniclass code.`}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Adding Value Restrictions">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Restrictions define specific allowed values for properties or attributes.
          </p>
          <TabbedContent
            tabs={[
              {
                label: "Enumeration",
                content: (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Limit values to a specific set of options (e.g., fire ratings must be "R60" or "R90"):
                    </p>
                    <CodeBlock
                      code={`1. Add a Restriction node
2. Connect it to your Property node
3. Set type to "Enumeration"
4. Add values: "R60", "R90", "R120"`}
                    />
                  </div>
                )
              },
              {
                label: "Range",
                content: (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Specify numeric ranges (e.g., area between 10-50 m²):
                    </p>
                    <CodeBlock
                      code={`1. Add a Restriction node
2. Connect it to your Property node
3. Set type to "Range"
4. Set min: 10, max: 50`}
                    />
                  </div>
                )
              },
              {
                label: "Pattern",
                content: (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Use regex patterns for text validation (e.g., naming conventions):
                    </p>
                    <CodeBlock
                      code={`1. Add a Restriction node
2. Connect it to your Attribute node
3. Set type to "Pattern"
4. Set pattern: "^WALL-[0-9]{3}$"`}
                    />
                  </div>
                )
              }
            ]}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Working with Materials">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Material facets check if elements have specific materials assigned.
          </p>
          <ExampleBox
            title="Example: Concrete Structural Elements"
            description="Ensure structural elements use concrete materials."
          >
            <CodeBlock
              code={`Applicability:
  - Entity: IFCBEAM, IFCCOLUMN, IFCSLAB

Requirements:
  - Material value: "Concrete"

This checks that beams, columns, and slabs have concrete as their material.`}
            />
          </ExampleBox>
        </CollapsibleSection>

        <CollapsibleSection title="Spatial Relationships with PartOf">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            PartOf facets filter elements based on their location in the building hierarchy.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <h5 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">Building Level</h5>
              <CodeBlock
                code={`PartOf:
  - Relation: IFCRELCONTAINEDINSPATIALSTRUCTURE
  - Entity: IFCBUILDINGSTOREY
  - Name: "Level 1"`}
              />
            </div>
            <div>
              <h5 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">Specific Space</h5>
              <CodeBlock
                code={`PartOf:
  - Relation: IFCRELCONTAINEDINSPATIALSTRUCTURE
  - Entity: IFCSPACE
  - Name: "Meeting Room A"`}
              />
            </div>
          </div>
        </CollapsibleSection>

        <h2 className="text-2xl font-bold mt-12 mb-6 text-slate-900 dark:text-slate-100">
          Quick Tips
        </h2>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <TipBox type="tip">
            <strong>Start Simple:</strong> Begin with one specification and one requirement. Add complexity gradually as you understand the structure.
          </TipBox>
          <TipBox type="info">
            <strong>Validate Early:</strong> Click "Validate IDS" frequently to catch errors before they compound.
          </TipBox>
          <TipBox type="warning">
            <strong>IFC Names:</strong> Entity names must match exact IFC class names (e.g., "IFCWALL" not "IfcWall").
          </TipBox>
          <TipBox type="success">
            <strong>Use Templates:</strong> Browse the template library for ready-made specifications you can customize.
          </TipBox>
        </div>

        <MarkdownContent content={quickStartContent} />
      </div>

      {/* Table of Contents */}
      <TableOfContents content={quickStartContent} />
    </div>
  );
}
