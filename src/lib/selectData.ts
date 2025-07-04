import { DataType } from "@/types/DataType";

interface Etablissement {
    siret: string;
    siren: string;
    uniteLegale: {
        denominationUniteLegale: string;
        activitePrincipaleUniteLegale: string;
    };
}

export const selectData = (data: {
    name: string;
    company: string;
    reliability: 'low' | 'medium' | 'high';
    etablissements: Etablissement[]
}): DataType => {
    const etablissement = data.etablissements[0];
    return {
        name: data.name,
        company: data.company,
        reliability: data.reliability,
        denominationUniteLegale: etablissement.uniteLegale.denominationUniteLegale,
        siren: etablissement.siren,
        naf: etablissement.uniteLegale.activitePrincipaleUniteLegale,
        siret: etablissement.siret
    };
}