# IDSedit

A visual editor for creating Information Delivery Specifications (IDS) files with automatic validation.

## Features

- **Visual Graph Editor**: Drag-and-drop interface for creating IDS specifications
- **Real-time Validation**: Automatic IDS validation in the browser via [`@ifc-lite/ids`](https://www.npmjs.com/package/@ifc-lite/ids) — no backend required
- **Multiple Node Types**: Support for all IDS facet types (Entity, Property, Attribute, Classification, Material, PartOf, Restriction)
- **Template System**: Pre-built specification templates
- **Export/Import**: Save and load canvas configurations
- **IDS XML Export**: Generate compliant IDS XML files

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd idsedit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## IDS Validation

Validation runs entirely in the browser using [`@ifc-lite/ids`](https://www.npmjs.com/package/@ifc-lite/ids):

- **Automatic Validation**: Validates 2 seconds after you stop editing
- **Manual Validation**: Click "Re-validate" on the canvas overlay or in the Inspector Panel
- **Status Indicators**:
  - 🟢 Valid IDS — no issues
  - 🟠 Warnings — non-blocking issues
  - 🔴 Invalid — parse error or blocking client-side issue

## Usage

1. **Create a Specification**: Add a specification node from the palette
2. **Add Applicability**: Connect entity, classification, or other facet nodes to the specification's applicability handle
3. **Add Requirements**: Connect property, attribute, or other facet nodes to the specification's requirements handle
4. **Configure Nodes**: Select nodes to edit their properties in the Inspector Panel
5. **Validate**: The system automatically validates your IDS structure
6. **Export**: Use the export button to download your IDS as XML

## Node Types

- **Specification**: Main container for IDS specifications
- **Entity**: IFC entity types (e.g., IfcWall, IfcDoor)
- **Property**: Property sets and properties
- **Attribute**: IFC attributes (Name, Description, etc.)
- **Classification**: Classification systems (Uniclass, ETIM, etc.)
- **Material**: Material specifications
- **PartOf**: Spatial relationships
- **Restriction**: Value constraints (enumeration, pattern, bounds, length)

## Development

### Project Structure

```
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── enumeration-editors/ # Specialized editors
│   ├── nodes/             # Node type components
│   └── ui/                # UI components
├── lib/                   # Utilities and types
├── ids-docs/              # IDS documentation
└── public/                # Static assets
```

### Key Files

- `components/specification-editor.tsx` - Main editor component
- `components/inspector-panel.tsx` - Property editor and validation display
- `components/canvas-validation-overlay.tsx` - Canvas-level validation status
- `lib/ids-xml-converter.ts` - Graph to IDS XML conversion
- `lib/use-ids-validation.ts` - Validation hook (powered by `@ifc-lite/ids`)
- `lib/ids-validation-service.ts` - Wrapper around `parseIDS` from `@ifc-lite/ids`

### Adding New Node Types

1. Create the node component in `components/nodes/`
2. Add the node type to `lib/graph-types.ts`
3. Update `getDefaultNodeData()` in `specification-editor.tsx`
4. Add field editor in `inspector-panel.tsx`
5. Update XML converter in `ids-xml-converter.ts`

## Deployment

The application is designed to deploy on Vercel:

1. **Deploy**: Push to your main branch to trigger deployment

No backend or environment variables are required — validation runs in the browser.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

AGPL-3 License
