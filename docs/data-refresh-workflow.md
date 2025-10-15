# Data Refresh Workflow

This document describes how to refresh the IFC schema data used by the application.

## Overview

The application uses comprehensive IFC schema data including:
- **Entities**: 653/776/876 entities for IFC2X3/IFC4/IFC4X3_ADD2
- **Property Sets**: 66/66/76 property sets for IFC2X3/IFC4/IFC4X3_ADD2
- **Simple Types**: 60+ data types per version

## Data Sources

### Entities
- **Source**: IfcOpenShell schema definitions
- **Script**: `scripts/export-complete-ifc-schema.py`
- **Output**: `lib/generated/ifc-schema/entities-{version}.json`

### Property Sets
- **Source**: Comprehensive buildingSMART specifications
- **Script**: `scripts/psd/generate-comprehensive-property-sets.py`
- **Output**: `lib/generated/ifc-schema/property-sets-{version}.json`

### Simple Types
- **Source**: IfcOpenShell schema definitions
- **Script**: `scripts/export-complete-ifc-schema.py`
- **Output**: `lib/generated/ifc-schema/simple-types-{version}.json`

## Refresh Process

### 1. Full Schema Generation
```bash
npm run generate-schema
```

This command runs:
1. `python3 scripts/psd/generate-comprehensive-property-sets.py` - Generate 76 property sets
2. `python3 scripts/export-complete-ifc-schema.py` - Export entities and simple types
3. `python3 scripts/psd/update-schema-index.py` - Update schema index with correct counts
4. `cp -r lib/generated/ifc-schema/* public/generated/` - Copy to public directory

### 2. Individual Scripts

#### Generate Property Sets Only
```bash
python3 scripts/psd/generate-comprehensive-property-sets.py
```

#### Export Entities Only
```bash
python3 scripts/export-complete-ifc-schema.py
```

#### Update Schema Index Only
```bash
python3 scripts/psd/update-schema-index.py
```

### 3. Copy to Public Directory
```bash
cp -r lib/generated/ifc-schema/* public/generated/
```

## File Structure

```
lib/generated/ifc-schema/
├── entities-ifc2x3.json          # 653 entities
├── entities-ifc4.json            # 776 entities
├── entities-ifc4x3_add2.json     # 876 entities
├── property-sets-ifc2x3.json     # 66 property sets
├── property-sets-ifc4.json       # 66 property sets
├── property-sets-ifc4x3_add2.json # 76 property sets
├── simple-types-ifc2x3.json      # 60+ data types
├── simple-types-ifc4.json        # 60+ data types
├── simple-types-ifc4x3_add2.json # 60+ data types
└── schema-index.json             # Schema metadata and counts

public/generated/
└── [same files as above]        # Browser-accessible copies
```

## Schema Index

The `schema-index.json` file contains:
- Version information
- Entity counts per version
- Property set counts per version
- Category definitions
- Last generated timestamp

## Verification

### Check Entity Counts
```bash
curl -s http://localhost:3003/generated/schema-index.json | jq '.entityCounts'
```

### Check Property Set Counts
```bash
curl -s http://localhost:3003/generated/schema-index.json | jq '.propertySetCounts'
```

### List Property Sets
```bash
curl -s http://localhost:3003/generated/property-sets-ifc4x3_add2.json | jq '.[].name'
```

### Filter Property Sets by Entity
```bash
curl -s http://localhost:3003/generated/property-sets-ifc4x3_add2.json | jq '.[] | select(.applicableEntities[] | contains("IFCWALL")) | .name'
```

## Troubleshooting

### Property Sets Not Loading
1. Check if files exist in `public/generated/`
2. Verify schema index has correct counts
3. Check browser console for fetch errors

### Entity Filtering Not Working
1. Verify `applicableEntities` field in property sets
2. Check entity names match exactly (case-sensitive)
3. Test with curl commands above

### Performance Issues
1. Check file sizes in `public/generated/`
2. Monitor browser network tab for slow requests
3. Consider implementing lazy loading for large datasets

## Adding New Property Sets

To add new property sets:

1. Edit `scripts/psd/generate-comprehensive-property-sets.py`
2. Add new property set definition to `generate_all_property_sets()`
3. Run `npm run generate-schema`
4. Test in browser

Example property set definition:
```python
{
    "name": "Pset_NewElementCommon",
    "applicableEntities": ["IFCNEWELEMENT"],
    "properties": [
        {"name": "Reference", "dataType": "IFCLABEL"},
        {"name": "Category", "dataType": "IFCLABEL"}
    ],
    "ifcVersion": ["IFC4X3_ADD2"],
    "templateType": "PSET_TYPEDRIVENOVERRIDE"
}
```

## Dependencies

- **Python 3.9+**
- **IfcOpenShell** (for entity export)
- **requests** (for API calls)
- **json** (for data processing)

Install Python dependencies:
```bash
pip install ifcopenshell requests
```
