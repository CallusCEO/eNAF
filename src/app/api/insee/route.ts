// src/app/api/insee/route.ts
import { NextResponse } from 'next/server';

// Use secure server-side environment variable
const KEY = process.env.INSEE_API_KEY;

if (!KEY) {
    throw new Error("No INSEE API key found in environment variables");
}

// Simple type for the API response
interface CompanySearchResponse {
    header?: {
        statut: number;
        message: string;
    };
    etablissements?: Array<{
        siren: string;
        denominationUniteLegale: string;
        // Add more fields as needed
    }>;
    error?: string;
}

export async function GET(request: Request): Promise<NextResponse<CompanySearchResponse>> {
    const { searchParams } = new URL(request.url);
    const companyName = searchParams.get('companyName');

    if (!companyName) {
        return NextResponse.json(
            { error: 'Company name is required' },
            { status: 400 }
        );
    }

    // maybe due to the domain name since it is not the most recent (tried with portail-api.insee.fr)
    const url = `https://api.insee.fr/api-sirene/3.11/siret?q=denominationUniteLegale:${companyName}`;

    try {
        // Conclusion: malformation of the request
        const response = await fetch(url, {
            headers: {
                "X-INSEE-Api-Key-Integration": KEY!, // --> not due to KEY (tried)
                "Accept": "application/json"
            },
        });

        // error should happen here
        if (!response.ok) {
            if (response.status === 429) {
                return NextResponse.json(
                    { error: 'Rate limit exceeded. Please wait before making another request.' },
                    { status: 429 }
                );
            }

            // especially here || throw new Error(`HTTP Error! Status: ${response.status}`); --> throws 400 from API
            console.log(response.status)
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        const data: CompanySearchResponse = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        // leads to a 500 error due to a malformation of the request and by the return of a 400 error
        console.error(`Error searching for "${companyName}":`, error);
        return NextResponse.json(
            { error: 'Failed to fetch company data' },
            { status: 500 }
        );
    }
}
