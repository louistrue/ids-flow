import type { GraphNode, GraphEdge } from './graph-types'
import { validateDataType, isPropertyDataTypeValid, getAllSimpleTypes, ensurePropertyDataTypeCache, type IFCVersion } from './ifc-schema'

export interface ValidationIssue {
    severity: 'error' | 'warning'
    message: string
    nodeId?: string
    nodeType?: string
}

export interface ClientValidationResult {
    isValid: boolean
    issues: ValidationIssue[]
}

/**
 * Client-side validation that runs before sending to IDS-Audit-Tool
 * This catches common issues that the audit tool might miss.
 *
 * The ifcVersion parameter is required for property data-type semantic
 * validation (e.g. LoadBearing must be IFCBOOLEAN, not IFCDATE).
 * The function ensures the property-to-datatype cache is populated before
 * checking, so it is fully self-contained — no external initialisation needed.
 */
export async function validateGraphClientSide(
    nodes: GraphNode[],
    edges: GraphEdge[],
    ifcVersion: IFCVersion = "IFC4X3_ADD2"
): Promise<ClientValidationResult> {
    const issues: ValidationIssue[] = []

    // Check for specification nodes
    const specNodes = nodes.filter(node => node.type === 'spec')
    if (specNodes.length === 0) {
        issues.push({
            severity: 'error',
            message: 'At least one specification node is required',
        })
        return { isValid: false, issues }
    }

    // Build the property data-type cache so that isPropertyDataTypeValid()
    // can detect semantic mismatches (e.g. LoadBearing ≠ IFCDATE).
    // This is a no-op if the cache is already populated for this version.
    await ensurePropertyDataTypeCache(ifcVersion)

    // Validate each property node
    const propertyNodes = nodes.filter(node => node.type === 'property')
    for (const node of propertyNodes) {
        const data = node.data as any

        // Validate data type syntactically (is it a valid IFC type?)
        if (data.dataType) {
            const isValidDataType = validateDataType(data.dataType)
            if (!isValidDataType) {
                issues.push({
                    severity: 'error',
                    message: `Invalid IFC data type "${data.dataType}" in property "${data.baseName || 'unnamed'}"`,
                    nodeId: node.id,
                    nodeType: 'property',
                })
            }
        }

        // Validate data type semantically (is it the right type for this property?)
        if (data.dataType && data.baseName) {
            const validation = isPropertyDataTypeValid(data.baseName, data.dataType)
            if (!validation.valid && validation.expectedTypes) {
                issues.push({
                    severity: 'error',
                    message: `Property "${data.baseName}" should have data type ${validation.expectedTypes.join(' or ')}, not "${data.dataType}"`,
                    nodeId: node.id,
                    nodeType: 'property',
                })
            }
        }

        // Check for required fields
        if (!data.propertySet) {
            issues.push({
                severity: 'warning',
                message: `Property node is missing propertySet`,
                nodeId: node.id,
                nodeType: 'property',
            })
        }

        if (!data.baseName) {
            issues.push({
                severity: 'warning',
                message: `Property node is missing baseName`,
                nodeId: node.id,
                nodeType: 'property',
            })
        }
    }

    // Validate entity nodes
    const entityNodes = nodes.filter(node => node.type === 'entity')
    for (const node of entityNodes) {
        const data = node.data as any
        if (!data.name) {
            issues.push({
                severity: 'error',
                message: 'Entity node is missing name',
                nodeId: node.id,
                nodeType: 'entity',
            })
        }
    }

    // Validate classification nodes
    const classificationNodes = nodes.filter(node => node.type === 'classification')
    for (const node of classificationNodes) {
        const data = node.data as any
        if (!data.system) {
            issues.push({
                severity: 'warning',
                message: 'Classification node is missing system',
                nodeId: node.id,
                nodeType: 'classification',
            })
        }
    }

    // Validate that specifications have applicability
    for (const specNode of specNodes) {
        const applicabilityEdges = edges.filter(
            edge => edge.target === specNode.id && edge.targetHandle === 'applicability'
        )

        // Skip validation for completely empty applicability (intentional wildcard pattern)
        // Only validate if there are some applicability facets but missing entity
        if (applicabilityEdges.length > 0) {
            // Check if applicability has at least one entity
            const applicabilityNodeIds = applicabilityEdges.map(e => e.source)
            const hasEntity = applicabilityNodeIds.some(id =>
                nodes.find(n => n.id === id && n.type === 'entity')
            )
            if (!hasEntity) {
                issues.push({
                    severity: 'warning',
                    message: `Specification "${(specNode.data as any).name || 'unnamed'}" applicability should include at least one entity`,
                    nodeId: specNode.id,
                    nodeType: 'spec',
                })
            }
        }
        // If applicabilityEdges.length === 0, skip validation (empty applicability is valid as wildcard)
    }

    const hasErrors = issues.some(issue => issue.severity === 'error')

    return {
        isValid: !hasErrors,
        issues,
    }
}

/**
 * Valid IFC data types for properties - loaded from generated schema
 * Populated lazily via loadValidDataTypes() from simple-types JSON files
 */
let VALID_IFC_DATA_TYPES: Set<string> | null = null

export async function loadValidDataTypes(version: IFCVersion): Promise<void> {
    if (VALID_IFC_DATA_TYPES) return
    try {
        const simpleTypes = await getAllSimpleTypes(version)
        VALID_IFC_DATA_TYPES = new Set(simpleTypes.map(t => t.name.toUpperCase()))
    } catch (error) {
        console.warn('Failed to load valid data types from schema:', error)
        VALID_IFC_DATA_TYPES = new Set()
    }
}

export function isValidIfcDataType(dataType: string): boolean {
    if (!VALID_IFC_DATA_TYPES) {
        // Before cache is loaded, fall back to validateDataType from ifc-schema
        return validateDataType(dataType)
    }
    return VALID_IFC_DATA_TYPES.has(dataType.toUpperCase())
}
