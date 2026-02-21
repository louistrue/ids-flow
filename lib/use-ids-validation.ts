import { useState, useEffect, useCallback, useRef } from 'react'
import type { GraphNode, GraphEdge } from './graph-types'
import { convertGraphToIdsXml } from './ids-xml-converter'
import { IdsValidationService, type ValidationResult } from './ids-validation-service'
import { validateGraphClientSide, type ValidationIssue } from './ids-client-validation'
import type { IFCVersion } from './ifc-schema'

export interface ValidationState {
    status: 'idle' | 'loading' | 'success' | 'error'
    result: ValidationResult | null
    error: string | null
    lastValidated: Date | null
    clientIssues?: ValidationIssue[]
}

export interface UseIdsValidationReturn {
    validationState: ValidationState
    validateNow: () => Promise<void>
    clearValidation: () => void
    isValidating: boolean
    hasErrors: boolean
    isDisabled: boolean
}

export function useIdsValidation(
    nodes: GraphNode[],
    edges: GraphEdge[],
    ifcVersion: IFCVersion = "IFC4X3_ADD2",
    debounceMs: number = 2000
): UseIdsValidationReturn {
    const [validationState, setValidationState] = useState<ValidationState>({
        status: 'idle',
        result: null,
        error: null,
        lastValidated: null,
    })

    const debounceRef = useRef<NodeJS.Timeout>()
    const validationService = IdsValidationService.getInstance()

    // Generation counter to prevent stale async validation results from
    // overwriting newer results. Incremented both when the debounce effect
    // fires (to immediately invalidate in-flight validations) and when
    // validateIds starts (to guard against concurrent calls).
    const validationGenRef = useRef(0)

    // Check if validation should be disabled
    const isDisabled = nodes.length === 0 || !nodes.some(node => node.type === 'spec')

    const validateIds = useCallback(async () => {
        if (isDisabled) {
            return
        }

        // Increment generation counter — any in-flight validation with an
        // older generation will discard its result.
        const thisGen = ++validationGenRef.current

        try {
            setValidationState(prev => ({ ...prev, status: 'loading', error: null, clientIssues: [] }))

            // Run client-side validation (async — it builds its own
            // property data-type cache internally before checking types).
            const clientValidation = await validateGraphClientSide(nodes, edges, ifcVersion)

            // Check if a newer validation started while we were running
            if (thisGen !== validationGenRef.current) return

            // If there are critical client-side errors, don't proceed to server validation
            if (!clientValidation.isValid) {
                const errorMessages = clientValidation.issues
                    .filter(issue => issue.severity === 'error')
                    .map(issue => issue.message)
                    .join('; ')

                setValidationState({
                    status: 'error',
                    result: null,
                    error: errorMessages || 'Client-side validation failed',
                    lastValidated: new Date(),
                    clientIssues: clientValidation.issues,
                })
                return
            }

            // Convert graph to IDS XML
            const xml = convertGraphToIdsXml(nodes, edges, {
                pretty: false, // No need for pretty formatting for validation
                author: 'IDS Flow Editor',
                date: new Date().toISOString().split('T')[0]
            })

            // Validate the XML with the audit service
            const result = await validationService.validateIdsXml(xml)

            // Only apply server result if this is still the latest validation.
            // A newer validation (e.g., after the user changed a data type) may
            // have already set the state to 'error' — don't overwrite it.
            if (thisGen !== validationGenRef.current) return

            setValidationState({
                status: 'success',
                result,
                error: null,
                lastValidated: new Date(),
                clientIssues: clientValidation.issues, // Include warnings
            })
        } catch (error) {
            // Only apply error if this is still the latest validation
            if (thisGen !== validationGenRef.current) return

            const errorMessage = error instanceof Error ? error.message : 'Validation failed'
            setValidationState({
                status: 'error',
                result: null,
                error: errorMessage,
                lastValidated: new Date(),
                clientIssues: [],
            })
        }
    }, [nodes, edges, ifcVersion, isDisabled, validationService])

    // Debounced validation — runs whenever nodes/edges change.
    useEffect(() => {
        if (isDisabled) {
            return
        }

        // IMPORTANT: Immediately invalidate any in-flight validation so that
        // a stale server response (from BEFORE the user changed something)
        // cannot overwrite the state with an outdated "valid" result.
        // Without this, there is a race condition: old server response arrives
        // during the debounce period and shows green even though data changed.
        validationGenRef.current++

        // Also clear stale "success" result immediately so the badge doesn't
        // keep showing green while we wait for the debounced re-validation.
        setValidationState(prev => {
            if (prev.result !== null || prev.status === 'success') {
                return { ...prev, status: 'idle', result: null }
            }
            return prev
        })

        // Clear existing timeout
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        // Set new timeout
        debounceRef.current = setTimeout(() => {
            validateIds()
        }, debounceMs)

        // Cleanup
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }
        }
    }, [nodes, edges, validateIds, debounceMs, isDisabled])

    const validateNow = useCallback(async () => {
        // Clear any pending debounced validation
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }
        await validateIds()
    }, [validateIds])

    const clearValidation = useCallback(() => {
        setValidationState({
            status: 'idle',
            result: null,
            error: null,
            lastValidated: null,
        })
    }, [])

    return {
        validationState,
        validateNow,
        clearValidation,
        isValidating: validationState.status === 'loading',
        hasErrors: validationState.status === 'error' || (validationState.result !== null && validationState.result.status !== 0),
        isDisabled,
    }
}
