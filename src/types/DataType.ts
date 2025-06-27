export interface DataType {
    siren: string;
    siret: string;
    company: string;
    reliability: 'low' | 'medium' | 'high';
    naf: string;
    name: string;
    denominationUniteLegale: string;
}