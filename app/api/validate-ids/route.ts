import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()

        if (!body || body.trim().length === 0) {
            return NextResponse.json(
                { error: 'No IDS XML provided' },
                { status: 400 }
            )
        }

        const apiUrl = process.env.NEXT_PUBLIC_IDS_AUDIT_API_URL
        const apiKey = process.env.IDS_AUDIT_API_KEY

        if (!apiUrl || !apiKey) {
            return NextResponse.json(
                { error: 'IDS validation service not configured' },
                { status: 500 }
            )
        }

        // Create FormData to send to IfcTester-Service
        const formData = new FormData()
        const blob = new Blob([body], { type: 'application/xml' })
        formData.append('ids_file', blob, 'validation.ids')

        // Call IfcTester-Service /ids-audit endpoint
        const response = await fetch(`${apiUrl}/ids-audit`, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
            },
            body: formData,
        })

        if (!response.ok) {
            console.error('IfcTester-Service error:', response.status, response.statusText)
            return NextResponse.json(
                { error: 'Validation service unavailable' },
                { status: 502 }
            )
        }

        const result = await response.json()

        return NextResponse.json({
            status: result.status,
            message: getStatusMessage(result.status),
            timestamp: new Date().toISOString(),
        })

    } catch (error) {
        console.error('IDS validation error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

function getStatusMessage(status: number): string {
    switch (status) {
        case 0:
            return 'Valid IDS - No errors'
        case 3:
            return 'Invalid options error'
        case 4:
            return 'Resource not found'
        case 5:
            return 'XML structure errors'
        case 6:
            return 'Implementation agreement errors'
        case 7:
            return 'XSD schema error'
        case 8:
            return 'Unhandled error occurred'
        default:
            return `Unknown error (status: ${status})`
    }
}
