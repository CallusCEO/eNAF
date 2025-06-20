export const selectData = (data: any) => {
    const etablissement = data.etablissements[0]
    return {
        name: data.name,
        company: data.company,
        denominationUniteLegale: etablissement.uniteLegale.denominationUniteLegale,
        siren: etablissement.siren,
        naf: etablissement.uniteLegale.activitePrincipaleUniteLegale,
        siret: etablissement.siret
    }
}