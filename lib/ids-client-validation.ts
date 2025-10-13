import type { GraphNode, GraphEdge } from './graph-types'
import { validateDataType, isPropertyDataTypeValid } from './ifc-schema'

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
 * This catches common issues that the audit tool might miss
 */
export function validateGraphClientSide(
    nodes: GraphNode[],
    edges: GraphEdge[]
): ClientValidationResult {
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
        if (applicabilityEdges.length === 0) {
            issues.push({
                severity: 'warning',
                message: `Specification "${(specNode.data as any).name || 'unnamed'}" has no applicability facets`,
                nodeId: specNode.id,
                nodeType: 'spec',
            })
        }

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

    const hasErrors = issues.some(issue => issue.severity === 'error')

    return {
        isValid: !hasErrors,
        issues,
    }
}

/**
 * Enhanced list of valid IFC data types for properties
 * Based on IFC4 and IFC4x3 specifications
 */
export const VALID_IFC_DATA_TYPES = new Set([
    // Basic types
    'IFCBOOLEAN',
    'IFCINTEGER',
    'IFCREAL',
    'IFCLABEL',
    'IFCTEXT',
    'IFCIDENTIFIER',
    'IFCLOGICAL',

    // Date/Time types
    'IFCDATETIME',
    'IFCDATE',
    'IFCTIME',
    'IFCDURATION',
    'IFCTIMESTAMP',

    // Measurement types
    'IFCLENGTHMEASURE',
    'IFCAREAMEASURE',
    'IFCVOLUMEMEASURE',
    'IFCPLANEANGLEMEASURE',
    'IFCSOLIDANGLEMEASURE',
    'IFCMASSMEASURE',
    'IFCPOWERMEASURE',
    'IFCPRESSUREMEASURE',
    'IFCTHERMALTRANSMITTANCEMEASURE',
    'IFCENERGYCONVERSIONRATE',
    'IFCTEMPERATUREGRADIENTMEASURE',
    'IFCHEATINGVALUEMEASURE',
    'IFCTHERMOCONDUCTIVITYMEASURE',
    'IFCVOLUMETRICFLOWRATEMEASURE',
    'IFCMOISTUREDIFFUSIVITYMEASURE',
    'IFCVAPORPERMEABILITYMEASURE',
    'IFCISOTHERMALMOISTURECAPACITYMEASURE',
    'IFCSPECIFICHEATCAPACITYMEASURE',
    'IFCMONETARYMEASURE',
    'IFCCOUNTMEASURE',
    'IFCTIMEMEASURE',
    'IFCTHERMODYNAMICTEMPERATUREMEASURE',
    'IFCPHMEASURE',
    'IFCFREQUENCYMEASURE',
    'IFCILLUMINANCEMEASURE',
    'IFCLUMINOUSFLUXMEASURE',
    'IFCLUMINOUSINTENSITYMEASURE',
    'IFCELECTRICVOLTAGEMEASURE',
    'IFCELECTRICCURRENTMEASURE',
    'IFCELECTRICCHARGEMEASURE',
    'IFCELECTRICRESISTANCEMEASURE',
    'IFCELECTRICCONDUCTANCEMEASURE',
    'IFCELECTRICCAPACITANCEMEASURE',
    'IFCINDUCTANCEMEASURE',
    'IFCFORCEMEASURE',
    'IFCMOMENTOFINERTIAMEASURE',
    'IFCTORQUEMEASURE',
    'IFCACCELERATIONMEASURE',
    'IFCLINEARVELOCITYMEASURE',
    'IFCANGULARVELOCITYMEASURE',
    'IFCLINEARFORCEMEASURE',
    'IFCPLANARFORCEMEASURE',
    'IFCLINEARSTIFFNESSMEASURE',
    'IFCROTATIONALSTIFFNESSMEASURE',
    'IFCWARPINGMOMENTALSTIFFNESSMEASURE',
    'IFCMODULUSOFELASTICITYMEASURE',
    'IFCSHEARMODULUSMEASURE',
    'IFCLINEARDENSITYMEASURE',
    'IFCLINEARMOMENTMEASURE',
    'IFCPLANARMOMENTMEASURE',
    'IFCSECTIONMODULUSMEASURE',
    'IFCSECTIONALAREAINTEGRALMEASURE',
    'IFCWARPING',
])

export function isValidIfcDataType(dataType: string): boolean {
    return VALID_IFC_DATA_TYPES.has(dataType.toUpperCase())
}

