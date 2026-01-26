# Quick Start Guide

Get started with IDSedit in minutes. This guide walks you through creating your first Information Delivery Specification.

## Creating Your First Specification

### Step 1: Open the Editor

Launch IDSedit and you'll see the visual flow editor. The canvas is where you'll build your specifications.

### Step 2: Add a Specification Node

Click the **Add Specification** button in the toolbar to create a new specification node. Each specification defines a rule for your IFC model.

### Step 3: Configure Applicability

The left side of a specification defines **what elements it applies to**. Add facets to identify the target elements:

- **Entity Facet** - Filter by IFC class (e.g., IfcWall, IfcDoor)
- **Classification Facet** - Filter by classification system
- **Property Facet** - Filter by property values
- **Material Facet** - Filter by material
- **Attribute Facet** - Filter by IFC attributes

### Step 4: Define Requirements

The right side defines **what those elements must have**. Add requirement facets to specify:

- Required properties
- Required classifications
- Required materials
- Attribute constraints

### Step 5: Export Your IDS

Click **Export** to save your specification as a standard `.ids` file. This file can be used with any [IDS-compatible software](https://technical.buildingsmart.org/ids-software-implementations/).

## Example: Fire Rating Requirement

Let's create a specification that requires all walls to have a fire rating property:

1. **Add a new specification**
2. **Applicability**: Add an Entity Facet, set IFC Class to `IfcWall`
3. **Requirements**: Add a Property Facet with:
   - Property Set: `Pset_WallCommon`
   - Property Name: `FireRating`
4. **Export** your IDS file

## Next Steps

- Learn about [Specifications](/docs/specifications) in detail
- Explore the different [Facet Types](/docs/facets/entity)
- Check the [Developer Guide](/docs/developer-guide) for technical details

For detailed information about the IDS standard, visit the [official buildingSMART IDS documentation](https://github.com/buildingSMART/IDS/tree/development/Documentation).
