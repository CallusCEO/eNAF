// src/app/api/insee/route.ts
import { NextResponse } from 'next/server';

const KEY = process.env.NEXT_PUBLIC_CLIENT_KEY;

if (!KEY) {
    throw new Error("No API key found");
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const companyName = searchParams.get('companyName');

    if (!companyName) {
        return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const encodedCompanyName = encodeURIComponent(companyName);
    const url = `https://api.insee.fr/api-sirene/3.11/siren?q=denominationUniteLegale:${encodedCompanyName}`;

    try {
        const response = await fetch(url, {
            headers: {
                "X-INSEE-Api-Key-Integration": KEY!, // maybe ApiKey
                "Accept": "application/json"
            },
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP! Statut: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error(`Erreur lors de la recherche de "${companyName}":`, error);
        return NextResponse.json(
            { error: 'Failed to fetch company data' },
            { status: 500 }
        );
    }
}