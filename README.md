# IDSflow

A professional IFC specification editor with visual flow design for building information modeling (BIM) workflows.

## Overview

IDSflow is a modern web application that enables users to create, edit, and manage IFC (Industry Foundation Classes) specifications through an intuitive visual interface. Built with Next.js and React Flow, it provides a node-based editor for defining IDS (Information Delivery Specification) requirements.

## Features

- **Visual Flow Editor**: Drag-and-drop interface for building IFC specifications
- **Node-Based Design**: Support for multiple facet types:
  - Entity facets
  - Property facets
  - Attribute facets
  - Classification facets
  - Material facets
  - PartOf facets
- **Specification Management**: Create and organize multiple specifications
- **XML Import/Export**: Full support for IDS XML format
- **Template System**: Pre-built templates for common use cases
- **Dark Mode**: Built-in theme support for comfortable editing
- **Real-time Validation**: Instant feedback on specification structure

## Getting Started

### Prerequisites

- Node.js 18+ or compatible runtime
- npm, pnpm, or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ids-flow.git

# Navigate to the project directory
cd ids-flow

# Install dependencies
npm install
# or
pnpm install
```

### Development

```bash
# Run the development server
npm run dev
# or
pnpm dev

# Open http://localhost:3000 in your browser
```

### Build

```bash
# Create a production build
npm run build
# or
pnpm build

# Start the production server
npm start
# or
pnpm start
```

## Documentation

For detailed information about IDS specifications and implementation, see the [ids-docs](./ids-docs) directory:

- [Developer Guide](./ids-docs/developer-guide.md)
- [Entity Facet](./ids-docs/entity-facet.md)
- [Property Facet](./ids-docs/property-facet.md)
- [Attribute Facet](./ids-docs/attribute-facet.md)
- [Classification Facet](./ids-docs/classification-facet.md)
- [Material Facet](./ids-docs/material-facet.md)
- [PartOf Facet](./ids-docs/partof-facet.md)
- [Restrictions](./ids-docs/restrictions.md)
- [Specifications](./ids-docs/specifications.md)

## Technology Stack

- **Framework**: Next.js 15
- **UI Library**: React 19
- **Flow Editor**: React Flow (xyflow)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Type Safety**: TypeScript
- **XML Processing**: xmlbuilder2
- **Theme**: next-themes

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

Built with modern web technologies and best practices for BIM professionals.
