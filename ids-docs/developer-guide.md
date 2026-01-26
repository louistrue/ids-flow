# Developer Guide

Technical information for developers working with IDSedit, integrating IDS files into workflows, or building IDS-compatible tools.

## IDS File Format

IDS (Information Delivery Specification) files are XML documents with the `.ids` extension. They follow a schema defined by buildingSMART International.

### Basic Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ids xmlns="http://standards.buildingsmart.org/IDS"
     xmlns:xs="http://www.w3.org/2001/XMLSchema"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://standards.buildingsmart.org/IDS http://standards.buildingsmart.org/IDS/1.0/ids.xsd">
  <info>
    <!-- File metadata -->
  </info>
  <specifications>
    <!-- Individual specifications -->
  </specifications>
</ids>
```

### Info Section (Metadata)

```xml
<info>
  <title>Fire Safety Requirements</title>
  <copyright>ACME Corp 2024</copyright>
  <version>1.0.0</version>
  <description>Information requirements for fire safety compliance</description>
  <author>bim@acme.com</author>
  <date>2024-01-15</date>
  <purpose>regulatory</purpose>
  <milestone>design development</milestone>
</info>
```

### Specification Structure

Each specification defines a validation rule:

```xml
<specification name="Wall Fire Rating" ifcVersion="IFC4">
  <applicability minOccurs="0" maxOccurs="unbounded">
    <entity>
      <name>
        <simpleValue>IFCWALL</simpleValue>
      </name>
    </entity>
  </applicability>
  <requirements>
    <property dataType="IFCLABEL">
      <propertySet>
        <simpleValue>Pset_WallCommon</simpleValue>
      </propertySet>
      <baseName>
        <simpleValue>FireRating</simpleValue>
      </baseName>
    </property>
  </requirements>
</specification>
```

### Cardinality (minOccurs/maxOccurs)

| minOccurs | maxOccurs | Meaning |
|-----------|-----------|---------|
| 1 | unbounded | **Required** - At least one matching element must exist |
| 0 | unbounded | **Optional** - If elements exist, they must comply |
| 0 | 0 | **Prohibited** - Matching elements must not exist |

## Value Restrictions in XML

### Simple Value
```xml
<simpleValue>IFCWALL</simpleValue>
```

### Enumeration
```xml
<restriction base="xs:string">
  <enumeration value="1HR"/>
  <enumeration value="2HR"/>
  <enumeration value="3HR"/>
</restriction>
```

### Pattern (Regex)
```xml
<restriction base="xs:string">
  <pattern value="[A-Z]{2}-[0-9]{4}"/>
</restriction>
```

### Numeric Bounds
```xml
<restriction base="xs:double">
  <minInclusive value="10"/>
  <maxInclusive value="100"/>
</restriction>
```

### Length Constraint
```xml
<restriction base="xs:string">
  <minLength value="3"/>
  <maxLength value="50"/>
</restriction>
```

## Supported IFC Versions

IDSedit supports these IFC schemas:

| Version | Schema Identifier | Description |
|---------|-------------------|-------------|
| IFC2X3 | `IFC2X3` | Legacy version, still widely used |
| IFC4 | `IFC4` | Current production version |
| IFC4X3 | `IFC4X3_ADD2` | Latest version with infrastructure support |

You can specify multiple versions per specification:
```xml
<specification ifcVersion="IFC2X3 IFC4 IFC4X3_ADD2">
```

## Validating IDS Files

### Schema Validation
IDS files must validate against the official XSD schema:

```bash
# Using xmllint (Linux/Mac)
xmllint --schema ids.xsd your-file.ids --noout

# Using Python
from lxml import etree
schema = etree.XMLSchema(etree.parse('ids.xsd'))
doc = etree.parse('your-file.ids')
schema.validate(doc)
```

### Semantic Validation
Beyond schema compliance, IDS files should be semantically correct:

- Entity names must be valid IFC classes
- Property sets should exist for the targeted IFC version
- Data types must be valid IFC types

Use these tools for comprehensive validation:
- [buildingSMART IDS Audit Tool](https://github.com/buildingSMART/IDS-Audit-tool/)
- [Xbim IDS Validator](https://www.xbim.it/ids) (browser-based, runs locally)

## IDSedit Export

IDSedit exports fully compliant IDS files:

### Export Features
- Valid XML with proper namespace declarations
- Schema-compliant structure
- Properly escaped special characters
- UTF-8 encoding

### Export Options
- **Single file** - All specifications in one `.ids` file
- **Individual files** - One specification per file (for modular requirements)

## Integration Workflows

### Model Checking Pipeline

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   IDSedit   │────▶│  IDS File   │────▶│ IDS Checker │
│  (Author)   │     │   (.ids)    │     │   (Tool)    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌─────────────┐             │
                    │  IFC Model  │─────────────┘
                    │   (.ifc)    │
                    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Report    │
                    │  (BCF/HTML) │
                    └─────────────┘
```

### IDS-Compatible Checking Tools

| Tool | Type | Description |
|------|------|-------------|
| **BIMcollab ZOOM** | Desktop | Free IDS checking with BCF output |
| **Solibri** | Desktop | Enterprise model checking |
| **IfcOpenShell** | Library | Python library for IDS checking |
| **Xbim** | Library | .NET library for IDS checking |
| **BlenderBIM** | Plugin | Open-source Blender addon |

### BCF Integration

IDS checking results are typically exported as BCF (BIM Collaboration Format):

```xml
<Topic>
  <Title>Wall missing FireRating property</Title>
  <Description>Element #123 does not have required Pset_WallCommon.FireRating</Description>
  <ReferenceLink>specification:FIRE-001</ReferenceLink>
</Topic>
```

## Programming with IDS

### Python Example (IfcOpenShell)

```python
import ifcopenshell
import ifcopenshell.ids

# Load IDS and IFC
ids_file = ifcopenshell.ids.open('requirements.ids')
ifc_file = ifcopenshell.open('model.ifc')

# Check compliance
results = ids_file.validate(ifc_file)

# Process results
for spec_result in results:
    print(f"Specification: {spec_result.specification.name}")
    for element_result in spec_result.elements:
        if not element_result.is_pass:
            print(f"  FAIL: {element_result.element}")
            for req_result in element_result.requirements:
                if not req_result.is_pass:
                    print(f"    - {req_result.message}")
```

### JavaScript/TypeScript

```typescript
// Using web-ifc or similar library
import { IdsParser, IdsChecker } from 'ids-lib';

const ids = await IdsParser.parse(idsXml);
const ifc = await loadIfc(ifcFile);

const results = IdsChecker.check(ids, ifc);
results.specifications.forEach(spec => {
  console.log(`${spec.name}: ${spec.pass ? 'PASS' : 'FAIL'}`);
});
```

### .NET Example (Xbim)

```csharp
using Xbim.IDS;
using Xbim.Ifc;

var ids = IdsDocument.Load("requirements.ids");
var model = IfcStore.Open("model.ifc");

var results = ids.Validate(model);
foreach (var result in results)
{
    Console.WriteLine($"{result.Specification.Name}: {result.Status}");
}
```

## Best Practices

### IDS Authoring
1. **Use meaningful names** - Specifications should have clear, descriptive names
2. **Include instructions** - Help model authors understand how to comply
3. **Test thoroughly** - Validate against sample IFC files before deployment
4. **Version control** - Track changes to requirements over time
5. **Modular design** - Create reusable specification sets by discipline

### IDS Checking
1. **Check early, check often** - Integrate into CI/CD pipelines
2. **Report clearly** - Provide actionable feedback to model authors
3. **Track trends** - Monitor compliance improvement over time

### Interoperability
1. **Stick to the standard** - Avoid proprietary extensions
2. **Test with multiple tools** - Ensure IDS works across different checkers
3. **Document assumptions** - Note which IFC versions are targeted

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Invalid IFC class" | Typo or wrong schema | Check against IFC documentation |
| "Property not found" | Wrong property set or name | Verify exact property set/name for IFC version |
| "Schema validation failed" | Malformed XML | Use IDS Audit Tool to identify errors |
| "No elements matched" | Overly restrictive applicability | Simplify facet combinations |

### Debugging Tips
1. Start with a simple specification and add complexity gradually
2. Test with known IFC files that should pass/fail
3. Use verbose output in checking tools to see matching details
4. Validate IDS file independently before checking against IFC

## Resources

### Official buildingSMART Resources
- [IDS Specification Repository](https://github.com/buildingSMART/IDS)
- [IDS XSD Schema](https://github.com/buildingSMART/IDS/tree/development/Schema)
- [IDS Test Cases](https://github.com/buildingSMART/IDS/tree/development/Documentation/ImplementersDocumentation/TestCases)
- [IDS Implementer Documentation](https://github.com/buildingSMART/IDS/tree/development/Documentation/ImplementersDocumentation)
- [IDS Software Implementations](https://technical.buildingsmart.org/ids-software-implementations/)

### IFC Documentation
- [IFC4x3 Documentation](https://ifc43-docs.standards.buildingsmart.org/)
- [IFC4 Documentation](https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/)
- [IFC2x3 Documentation](https://standards.buildingsmart.org/IFC/RELEASE/IFC2x3/TC1/HTML/)

### Community & Support
- [buildingSMART Forums](https://forums.buildingsmart.org/)
- [IDS GitHub Issues](https://github.com/buildingSMART/IDS/issues)
- [IfcOpenShell Community](https://community.osarch.org/)

## Contributing to IDSedit

IDSedit is open source under the AGPL-3 license.

- **Report issues**: [GitHub Issues](https://github.com/louistrue/ids-flow/issues)
- **Contribute code**: [GitHub Repository](https://github.com/louistrue/ids-flow)
- **Documentation**: Help improve these docs via pull requests
