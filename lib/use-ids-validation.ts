import { useState, useEffect, useCallback, useRef } from 'react'
import type { GraphNode, GraphEdge } from './graph-types'
import { convertGraphToIdsXml } from './ids-xml-converter'
import { IdsValidationService, type ValidationResult } from './ids-validation-service'
import { validateGraphClientSide, type ValidationIssue } from './ids-client-validation'

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

    // Check if validation should be disabled
    const isDisabled = nodes.length === 0 || !nodes.some(node => node.type === 'spec')

    const validateIds = useCallback(async () => {
        if (isDisabled) {
            return
        }

        try {
            setValidationState(prev => ({ ...prev, status: 'loading', error: null, clientIssues: [] }))

            // First, run client-side validation
            const clientValidation = validateGraphClientSide(nodes, edges)

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

            setValidationState({
                status: 'success',
                result,
                error: null,
                lastValidated: new Date(),
                clientIssues: clientValidation.issues, // Include warnings
            })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Validation failed'
            setValidationState({
                status: 'error',
                result: null,
                error: errorMessage,
                lastValidated: new Date(),
                clientIssues: [],
            })
        }
    }, [nodes, edges, isDisabled, validationService])

    // Debounced validation
    useEffect(() => {
        if (isDisabled) {
            return
        }

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
