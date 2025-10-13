export interface ValidationResult {
    status: number
    message: string
    timestamp: string
    error?: string
}

export interface ValidationError {
    error: string
}

export class IdsValidationService {
    private static instance: IdsValidationService
    private cache = new Map<string, ValidationResult>()

    static getInstance(): IdsValidationService {
        if (!IdsValidationService.instance) {
            IdsValidationService.instance = new IdsValidationService()
        }
        return IdsValidationService.instance
    }

    async validateIdsXml(xml: string): Promise<ValidationResult> {
        if (!xml || xml.trim().length === 0) {
            throw new Error('No IDS XML provided')
        }

        // Check cache first
        const cacheKey = this.getCacheKey(xml)
        const cached = this.cache.get(cacheKey)
        if (cached) {
            return cached
        }

        try {
            const response = await fetch('/api/validate-ids', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: xml,
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || `HTTP ${response.status}`)
            }

            const result: ValidationResult = await response.json()

            // Cache successful results
            this.cache.set(cacheKey, result)

            return result
        } catch (error) {
            console.error('Validation service error:', error)
            throw error
        }
    }

    private getCacheKey(xml: string): string {
        // Simple hash function for caching
        let hash = 0
        for (let i = 0; i < xml.length; i++) {
            const char = xml.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash // Convert to 32-bit integer
        }
        return hash.toString()
    }

    clearCache(): void {
        this.cache.clear()
    }
}
