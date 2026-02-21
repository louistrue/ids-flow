#!/usr/bin/env python3
"""
Fetch and parse ALL official buildingSMART Property Set Definition (PSD) XML files
from the IFC4.3.x-development GitHub repository.

This replaces the incomplete bSDD fetch with direct access to the authoritative
PSD source: 612+ property set definitions for IFC4X3.

Output: property-sets-{version}.json files in lib/generated/ifc-schema/
"""

import json
import sys
import time
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configuration
GITHUB_RAW_BASE = "https://raw.githubusercontent.com/buildingSMART/IFC4.3.x-development/master/reference_schemas/psd"
GITHUB_API_URL = "https://api.github.com/repos/buildingSMART/IFC4.3.x-development/contents/reference_schemas/psd"
OUTPUT_DIR = Path(__file__).parent.parent.parent / "lib" / "generated" / "ifc-schema"

# Valid IFC simple types (from our generated schema)
# Data types in PSD files must be mapped to these
VALID_SIMPLE_TYPES = {
    "IFCLABEL", "IFCTEXT", "IFCBOOLEAN", "IFCINTEGER", "IFCREAL",
    "IFCIDENTIFIER", "IFCLOGICAL", "IFCDATETIME", "IFCDATE", "IFCTIME",
    "IFCDURATION", "IFCLENGTHMEASURE", "IFCAREAMEASURE", "IFCVOLUMEMEASURE",
    "IFCPLANEANGLEMEASURE", "IFCSOLIDANGLEMEASURE", "IFCMASSMEASURE",
    "IFCPOWERMEASURE", "IFCPRESSUREMEASURE", "IFCTHERMALTRANSMITTANCEMEASURE",
    "IFCENERGYCONVERSIONRATE", "IFCTEMPERATUREGRADIENTMEASURE",
    "IFCHEATINGVALUEMEASURE", "IFCTHERMOCONDUCTIVITYMEASURE",
    "IFCVOLUMETRICFLOWRATEMEASURE", "IFCMOISTUREDIFFUSIVITYMEASURE",
    "IFCVAPORPERMEABILITYMEASURE", "IFCISOTHERMALMOISTURECAPACITYMEASURE",
    "IFCSPECIFICHEATCAPACITYMEASURE", "IFCMONETARYMEASURE", "IFCCOUNTMEASURE",
    "IFCTIMEMEASURE", "IFCTHERMODYNAMICTEMPERATUREMEASURE", "IFCPHMEASURE",
    "IFCFREQUENCYMEASURE", "IFCILLUMINANCEMEASURE", "IFCLUMINOUSFLUXMEASURE",
    "IFCLUMINOUSINTENSITYMEASURE", "IFCELECTRICVOLTAGEMEASURE",
    "IFCELECTRICCURRENTMEASURE", "IFCELECTRICCHARGEMEASURE",
    "IFCELECTRICRESISTANCEMEASURE", "IFCELECTRICCONDUCTANCEMEASURE",
    "IFCELECTRICCAPACITANCEMEASURE", "IFCINDUCTANCEMEASURE",
    "IFCFORCEMEASURE", "IFCMOMENTOFINERTIAMEASURE", "IFCTORQUEMEASURE",
    "IFCACCELERATIONMEASURE", "IFCLINEARVELOCITYMEASURE",
    "IFCANGULARVELOCITYMEASURE", "IFCLINEARFORCEMEASURE",
    "IFCPLANARFORCEMEASURE", "IFCLINEARSTIFFNESSMEASURE",
    "IFCROTATIONALSTIFFNESSMEASURE", "IFCWARPINGMOMENTALSTIFFNESSMEASURE",
    "IFCMODULUSOFELASTICITYMEASURE", "IFCSHEARMODULUSMEASURE",
    "IFCLINEARDENSITYMEASURE", "IFCLINEARMOMENTMEASURE",
    "IFCPLANARMOMENTMEASURE", "IFCSECTIONMODULUSMEASURE",
    "IFCSECTIONALAREAINTEGRALMEASURE", "IFCWARPING",
}

# Map non-standard type names to valid ones
TYPE_NORMALIZATION = {
    "IFCPOSITIVERATIOMEASURE": "IFCREAL",
    "IFCNORMALISEDRATIOMEASURE": "IFCREAL",
    "IFCRATIOMEASURE": "IFCREAL",
    "IFCNUMERICMEASURE": "IFCREAL",
    "IFCPARAMETERVALUE": "IFCREAL",
    "IFCMASSDENSITYMEASURE": "IFCREAL",
    "IFCMASSFLOWRATEMEASURE": "IFCREAL",
    "IFCMASSMEASURE": "IFCMASSMEASURE",
    "IFCSOUNDPOWERMEASURE": "IFCPOWERMEASURE",
    "IFCSOUNDPOWERLEVELMEASURE": "IFCREAL",
    "IFCSOUNDPRESSUREMEASURE": "IFCPRESSUREMEASURE",
    "IFCSOUNDPRESSURELEVELMEASURE": "IFCREAL",
    "IFCELECTRICPOWERMEASURE": "IFCPOWERMEASURE",
    "IFCTHERMALCONDUCTIVITYMEASURE": "IFCTHERMOCONDUCTIVITYMEASURE",
    "IFCVOLUMETRICFLOWRATE": "IFCVOLUMETRICFLOWRATEMEASURE",
    "IFCSTRUCTURALLOADMEASURE": "IFCFORCEMEASURE",
    "IFCTORSIONALCONSTANTMEASURE": "IFCMOMENTOFINERTIAMEASURE",
    "IFCMASSVOLUMEDENSITYMEASURE": "IFCREAL",
    "IFCDIRECTIONMEASURE": "IFCPLANEANGLEMEASURE",
    "IFCPOSITIVEPLANEANGLEMEASURE": "IFCPLANEANGLEMEASURE",
    "IFCPOSITIVELENGTHMEASURE": "IFCLENGTHMEASURE",
    "IFCNONNEGATIVELENGTHMEASURE": "IFCLENGTHMEASURE",
    "IFCCOMPOUNDPLANEANGLEMEASURE": "IFCPLANEANGLEMEASURE",
    "IFCDYNAMICVISCOSITYMEASURE": "IFCREAL",
    "IFCKINEMATICVISCOSITYMEASURE": "IFCREAL",
    "IFCROTATIONALFREQUENCYMEASURE": "IFCFREQUENCYMEASURE",
    "IFCELECTRICCONDUCTIVITYMEASURE": "IFCREAL",
    "IFCELECTRICRESISTIVITYMEASURE": "IFCREAL",
    "IFCMAGNETICFLUXMEASURE": "IFCREAL",
    "IFCMAGNETICFLUXDENSITYMEASURE": "IFCREAL",
    "IFCWARPINGCONSTANTMEASURE": "IFCREAL",
    "IFCMODULUSOFSUBGRADEREACTIONMEASURE": "IFCREAL",
    "IFCROTATIONALMASSMEASURE": "IFCREAL",
    "IFCSECTIONALAREAINTEGRALMEASURE": "IFCREAL",
    "IFCHEATFLUXDENSITYMEASURE": "IFCREAL",
    "IFCMASSPERLENGTHMEASURE": "IFCREAL",
    "IFCTHERMALEXPANSIONCOEFFICIENTMEASURE": "IFCREAL",
    "IFCTHERMALRESISTANCEMEASURE": "IFCREAL",
    "IFCMODULUSOFLINEARSUBGRADEREACTIONMEASURE": "IFCREAL",
    "IFCMODULUSOFROTATIONALSUBGRADEREACTIONMEASURE": "IFCREAL",
    "IFCINTEGERCOUNTRATEMEASURE": "IFCINTEGER",
}


def normalize_type(ifc_type: str) -> str:
    """Normalize an IFC type name to a valid simple type."""
    upper = ifc_type.upper().strip()

    # Already valid
    if upper in VALID_SIMPLE_TYPES:
        return upper

    # Check normalization map
    if upper in TYPE_NORMALIZATION:
        return TYPE_NORMALIZATION[upper]

    # Try removing 'Ifc' prefix and re-adding as uppercase
    if upper.startswith("IFC"):
        pass  # Already uppercase

    # Default: if it looks like a measure, map to IFCREAL
    if "MEASURE" in upper:
        return "IFCREAL"

    # Default fallback
    return "IFCLABEL"


def fetch_file_list() -> list[str]:
    """Fetch list of PSD XML files from GitHub API, with local cache fallback."""
    cache_file = Path(__file__).parent / "psd_file_list.json"

    # Try cached file list first
    if cache_file.exists():
        with open(cache_file) as f:
            cached = json.load(f)
        if cached:
            print(f"  Using cached file list: {len(cached)} PSD files")
            return cached

    print("Fetching PSD file list from GitHub API...")
    try:
        req = Request(GITHUB_API_URL)
        req.add_header("User-Agent", "ids-flow-schema-generator")
        with urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())

        xml_files = [item["name"] for item in data if item["name"].endswith(".xml")]
        print(f"  Found {len(xml_files)} PSD XML files")

        # Cache for future runs
        with open(cache_file, "w") as f:
            json.dump(xml_files, f)

        return xml_files
    except Exception as e:
        print(f"  Error fetching file list: {e}")
        return []


def fetch_psd_xml(filename: str) -> str | None:
    """Fetch a single PSD XML file from GitHub raw content."""
    url = f"{GITHUB_RAW_BASE}/{filename}"
    try:
        req = Request(url)
        req.add_header("User-Agent", "ids-flow-schema-generator")
        with urlopen(req, timeout=15) as resp:
            return resp.read().decode("utf-8")
    except Exception as e:
        print(f"  Warning: Failed to fetch {filename}: {e}")
        return None


QTO_TYPE_MAP = {
    "Q_LENGTH": "IFCLENGTHMEASURE",
    "Q_AREA": "IFCAREAMEASURE",
    "Q_VOLUME": "IFCVOLUMEMEASURE",
    "Q_COUNT": "IFCCOUNTMEASURE",
    "Q_WEIGHT": "IFCMASSMEASURE",
    "Q_TIME": "IFCTIMEMEASURE",
}


def parse_qto_xml(xml_content: str, filename: str) -> dict | None:
    """Parse a Qto (Quantity Set) XML file into our property set format."""
    try:
        root = ET.fromstring(xml_content)
    except ET.ParseError as e:
        print(f"  Warning: Failed to parse {filename}: {e}")
        return None

    # Check if this is a QtoSetDef
    if "QtoSetDef" not in root.tag and root.tag != "QtoSetDef":
        return None

    name_elem = root.find("{http://www.buildingsmart-tech.org/xml/qto/QTO_IFC4.xsd}Name")
    if name_elem is None:
        name_elem = root.find("Name")
    if name_elem is None or not name_elem.text:
        return None
    qto_name = name_elem.text.strip()

    # Extract applicable entities
    applicable_entities = []
    for ns in ["", "{http://www.buildingsmart-tech.org/xml/qto/QTO_IFC4.xsd}"]:
        for class_elem in root.findall(f".//{ns}ApplicableClasses/{ns}ClassName"):
            if class_elem.text:
                entity = class_elem.text.strip().upper()
                if "/" in entity:
                    entity = entity.split("/")[0]
                applicable_entities.append(entity)
    if not applicable_entities:
        for ns in ["", "{http://www.buildingsmart-tech.org/xml/qto/QTO_IFC4.xsd}"]:
            type_val = root.find(f"{ns}ApplicableTypeValue")
            if type_val is not None and type_val.text:
                entity = type_val.text.strip().upper()
                if "/" in entity:
                    entity = entity.split("/")[0]
                applicable_entities.append(entity)

    # Extract quantities as properties
    properties = []
    for ns in ["", "{http://www.buildingsmart-tech.org/xml/qto/QTO_IFC4.xsd}"]:
        for qto_def in root.findall(f".//{ns}QtoDefs/{ns}QtoDef"):
            name_el = qto_def.find(f"{ns}Name")
            if name_el is None or not name_el.text:
                continue
            prop_name = name_el.text.strip()

            qto_type_el = qto_def.find(f"{ns}QtoType")
            qto_type = qto_type_el.text.strip() if qto_type_el is not None and qto_type_el.text else "Q_LENGTH"
            data_type = QTO_TYPE_MAP.get(qto_type, "IFCREAL")

            properties.append({"name": prop_name, "dataType": data_type})

    if not properties:
        return None

    return {
        "name": qto_name,
        "applicableEntities": applicable_entities,
        "properties": properties,
        "ifcVersion": ["IFC4X3_ADD2"],
        "templateType": "QTO_TYPEDRIVENOVERRIDE"
    }


def parse_psd_xml(xml_content: str, filename: str) -> dict | None:
    """Parse a PSD XML file into our property set format."""
    try:
        root = ET.fromstring(xml_content)
    except ET.ParseError as e:
        print(f"  Warning: Failed to parse {filename}: {e}")
        return None

    # Extract property set name
    name_elem = root.find("Name")
    if name_elem is None or not name_elem.text:
        return None
    pset_name = name_elem.text.strip()

    # Extract applicable entities
    applicable_entities = []
    for class_elem in root.findall(".//ApplicableClasses/ClassName"):
        if class_elem.text:
            entity = class_elem.text.strip()
            # Normalize: "IfcWall" -> "IFCWALL"
            if entity.startswith("Ifc"):
                entity = entity.upper()
            # Handle "IfcWall/STANDARD" format
            if "/" in entity:
                entity = entity.split("/")[0]
            applicable_entities.append(entity)

    # Also check ApplicableTypeValue
    if not applicable_entities:
        type_val = root.find("ApplicableTypeValue")
        if type_val is not None and type_val.text:
            entity = type_val.text.strip()
            if entity.startswith("Ifc"):
                entity = entity.upper()
            if "/" in entity:
                entity = entity.split("/")[0]
            applicable_entities.append(entity)

    # Extract properties
    properties = []
    for prop_def in root.findall(".//PropertyDefs/PropertyDef"):
        prop_name_elem = prop_def.find("Name")
        if prop_name_elem is None or not prop_name_elem.text:
            continue

        prop_name = prop_name_elem.text.strip()

        # Extract data type
        data_type = "IFCLABEL"  # default

        # TypePropertySingleValue
        single_val = prop_def.find(".//TypePropertySingleValue/DataType")
        if single_val is not None:
            raw_type = single_val.get("type", "")
            if raw_type:
                data_type = normalize_type(raw_type)

        # TypePropertyBoundedValue
        bounded_val = prop_def.find(".//TypePropertyBoundedValue/DataType")
        if bounded_val is not None:
            raw_type = bounded_val.get("type", "")
            if raw_type:
                data_type = normalize_type(raw_type)

        # TypePropertyEnumeratedValue -> IFCLABEL
        enum_val = prop_def.find(".//TypePropertyEnumeratedValue")
        if enum_val is not None:
            data_type = "IFCLABEL"

        # TypePropertyReferenceValue -> IFCLABEL
        ref_val = prop_def.find(".//TypePropertyReferenceValue")
        if ref_val is not None:
            data_type = "IFCLABEL"

        # TypePropertyListValue
        list_val = prop_def.find(".//TypePropertyListValue/ListValue/DataType")
        if list_val is not None:
            raw_type = list_val.get("type", "")
            if raw_type:
                data_type = normalize_type(raw_type)

        # TypePropertyTableValue (use defining value type)
        table_val = prop_def.find(".//TypePropertyTableValue/DefiningValue/DataType")
        if table_val is not None:
            raw_type = table_val.get("type", "")
            if raw_type:
                data_type = normalize_type(raw_type)

        properties.append({
            "name": prop_name,
            "dataType": data_type
        })

    if not properties:
        return None

    # Extract template type
    template_type = root.get("templatetype", "PSET_TYPEDRIVENOVERRIDE")

    return {
        "name": pset_name,
        "applicableEntities": applicable_entities,
        "properties": properties,
        "ifcVersion": ["IFC4X3_ADD2"],  # These PSD files are for IFC4X3
        "templateType": template_type.upper() if template_type else "PSET_TYPEDRIVENOVERRIDE"
    }


def main():
    print("=" * 60)
    print("IFC Property Set Generator - Full PSD Coverage")
    print("=" * 60)

    # Step 1: Get file list
    xml_files = fetch_file_list()
    if not xml_files:
        print("ERROR: Could not fetch PSD file list. Aborting.")
        sys.exit(1)

    # Step 2: Download and parse all PSD files
    print(f"\nDownloading and parsing {len(xml_files)} PSD files...")
    property_sets = []
    failed = []

    # Use thread pool for parallel downloads (rate-limited)
    batch_size = 20
    for batch_start in range(0, len(xml_files), batch_size):
        batch = xml_files[batch_start:batch_start + batch_size]
        batch_end = min(batch_start + batch_size, len(xml_files))
        print(f"  Batch {batch_start + 1}-{batch_end} of {len(xml_files)}...")

        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = {executor.submit(fetch_psd_xml, f): f for f in batch}
            for future in as_completed(futures):
                filename = futures[future]
                xml_content = future.result()
                if xml_content:
                    # Try parsing as Pset first, then as Qto
                    pset = parse_psd_xml(xml_content, filename)
                    if not pset:
                        pset = parse_qto_xml(xml_content, filename)
                    if pset:
                        property_sets.append(pset)
                    else:
                        failed.append(filename)
                else:
                    failed.append(filename)

        # Rate limiting between batches
        if batch_end < len(xml_files):
            time.sleep(0.5)

    print(f"\n  Successfully parsed: {len(property_sets)} property sets")
    if failed:
        print(f"  Failed: {len(failed)} files")

    # Step 3: Deduplicate (some psets may appear in multiple files)
    seen = {}
    unique_psets = []
    for pset in property_sets:
        name = pset["name"]
        if name not in seen:
            seen[name] = pset
            unique_psets.append(pset)
        else:
            # Merge properties from duplicate
            existing_props = {p["name"] for p in seen[name]["properties"]}
            for prop in pset["properties"]:
                if prop["name"] not in existing_props:
                    seen[name]["properties"].append(prop)
                    existing_props.add(prop["name"])

    print(f"  Unique property sets: {len(unique_psets)}")

    # Count stats
    total_props = sum(len(ps["properties"]) for ps in unique_psets)
    unique_prop_names = set()
    for ps in unique_psets:
        for p in ps["properties"]:
            unique_prop_names.add(p["name"])
    print(f"  Total properties: {total_props}")
    print(f"  Unique property names: {len(unique_prop_names)}")

    # Step 4: Write output files
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # For IFC4X3_ADD2: use all parsed property sets
    ifc4x3_file = OUTPUT_DIR / "property-sets-ifc4x3_add2.json"
    with open(ifc4x3_file, "w") as f:
        json.dump(unique_psets, f, indent=2)
        f.write("\n")
    print(f"\n  Wrote {ifc4x3_file}")

    # For IFC4 and IFC2X3: use a filtered subset
    # (most IFC4X3 psets also apply to IFC4, and many to IFC2X3)
    # Filter out IFC4X3-only psets (infrastructure, etc.)
    ifc4x3_only_prefixes = [
        "Pset_Bridge", "Pset_Road", "Pset_Railway", "Pset_Marine",
        "Pset_Facility", "Pset_Alignment", "Pset_Course", "Pset_Earth",
        "Pset_Pavement", "Pset_Kerb", "Pset_Sign", "Pset_Signal",
    ]

    ifc4_psets = []
    ifc2x3_psets = []
    for pset in unique_psets:
        is_4x3_only = any(pset["name"].startswith(p) for p in ifc4x3_only_prefixes)

        if not is_4x3_only:
            ifc4_pset = {**pset, "ifcVersion": ["IFC4", "IFC4X3_ADD2"]}
            ifc4_psets.append(ifc4_pset)

            # IFC2X3 has fewer psets - exclude MEP-specific ones too
            mep_prefixes = [
                "Pset_Sensor", "Pset_Actuator", "Pset_Controller",
                "Pset_Alarm", "Pset_Distribution", "Pset_ElectricAppliance",
            ]
            is_mep_only = any(pset["name"].startswith(p) for p in mep_prefixes)
            if not is_mep_only:
                ifc2x3_pset = {**pset, "ifcVersion": ["IFC2X3", "IFC4", "IFC4X3_ADD2"]}
                ifc2x3_psets.append(ifc2x3_pset)

    ifc4_file = OUTPUT_DIR / "property-sets-ifc4.json"
    with open(ifc4_file, "w") as f:
        json.dump(ifc4_psets, f, indent=2)
        f.write("\n")
    print(f"  Wrote {ifc4_file}")

    ifc2x3_file = OUTPUT_DIR / "property-sets-ifc2x3.json"
    with open(ifc2x3_file, "w") as f:
        json.dump(ifc2x3_psets, f, indent=2)
        f.write("\n")
    print(f"  Wrote {ifc2x3_file}")

    # Step 5: Summary
    print(f"\n{'=' * 60}")
    print(f"SUMMARY")
    print(f"{'=' * 60}")
    print(f"  IFC4X3_ADD2: {len(unique_psets)} property sets")
    print(f"  IFC4:        {len(ifc4_psets)} property sets")
    print(f"  IFC2X3:      {len(ifc2x3_psets)} property sets")
    print(f"  Total unique properties: {total_props}")
    print(f"  Unique property names: {len(unique_prop_names)}")
    print(f"\nDone!")


if __name__ == "__main__":
    main()
