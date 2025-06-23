export interface SireneResponse {
  header: {
    statut: number;
    message: string;
    total: number;
    debut: number;
    nombre: number;
  };
  etablissements: Etablissement[];
}

export interface Etablissement {
  activitePrincipaleRegistreMetiersEtablissement: string | null;
  adresse2Etablissement: AdresseEtablissement | null;
  adresseEtablissement: AdresseEtablissement;
  anneeEffectifsEtablissement: string | null;
  dateCreationEtablissement: string;
  dateDernierTraitementEtablissement: string;
  etablissementSiege: boolean;
  nic: string;
  nombrePeriodesEtablissement: number;
  periodesEtablissement: PeriodeEtablissement[];
  siren: string;
  siret: string;
  statutDiffusionEtablissement: string;
  trancheEffectifsEtablissement: string | null;
  uniteLegale: UniteLegale;
}

export interface AdresseEtablissement {
  codeCedexEtablissement?: string | null;
  codeCommuneEtablissement?: string | null;
  codePaysEtrangerEtablissement?: string | null;
  codePostalEtablissement: string | null;
  complementAdresseEtablissement?: string | null;
  coordonneeLambertAbscisseEtablissement?: string | null;
  coordonneeLambertOrdonneeEtablissement?: string | null;
  dernierNumeroVoieEtablissement?: string | null;
  distributionSpecialeEtablissement?: string | null;
  identifiantAdresseEtablissement?: string | null;
  indiceRepetitionDernierNumeroVoieEtablissement?: string | null;
  indiceRepetitionEtablissement?: string | null;
  libelleCedexEtablissement?: string | null;
  libelleCommuneEtablissement: string | null;
  libelleCommuneEtrangerEtablissement?: string | null;
  libellePaysEtrangerEtablissement?: string | null;
  libelleVoieEtablissement: string | null;
  numeroVoieEtablissement: string | null;
  typeVoieEtablissement: string | null;
}

export interface PeriodeEtablissement {
  activitePrincipaleEtablissement: string;
  caractereEmployeurEtablissement: string;
  changementActivitePrincipaleEtablissement: boolean;
  changementCaractereEmployeurEtablissement: boolean;
  changementDenominationUsuelleEtablissement: boolean;
  changementEnseigneEtablissement: boolean;
  changementEtatAdministratifEtablissement: boolean;
  dateDebut: string;
  dateFin: string | null;
  denominationUsuelleEtablissement: string | null;
  enseigne1Etablissement: string | null;
  enseigne2Etablissement: string | null;
  enseigne3Etablissement: string | null;
  etatAdministratifEtablissement: string;
  nomenclatureActivitePrincipaleEtablissement: string;
}

export interface UniteLegale {
  activitePrincipaleUniteLegale: string;
  anneeCategorieEntreprise: string | null;
  anneeEffectifsUniteLegale: string | null;
  caractereEmployeurUniteLegale: string | null;
  categorieEntreprise: string | null;
  categorieJuridiqueUniteLegale: string;
  dateCreationUniteLegale: string;
  dateDernierTraitementUniteLegale: string;
  denominationUniteLegale: string;
  denominationUsuelle1UniteLegale: string | null;
  denominationUsuelle2UniteLegale: string | null;
  denominationUsuelle3UniteLegale: string | null;
  economieSocialeSolidaireUniteLegale: string;
  etatAdministratifUniteLegale: string;
  identifiantAssociationUniteLegale: string | null;
  nicSiegeUniteLegale: string;
  nomUniteLegale: string | null;
  nomUsageUniteLegale: string | null;
  nomenclatureActivitePrincipaleUniteLegale: string;
  prenom1UniteLegale: string | null;
  prenom2UniteLegale: string | null;
  prenom3UniteLegale: string | null;
  prenom4UniteLegale: string | null;
  prenomUsuelUniteLegale: string | null;
  pseudonymeUniteLegale: string | null;
  sexeUniteLegale: string | null;
  sigleUniteLegale: string | null;
  societeMissionUniteLegale: string | null;
  statutDiffusionUniteLegale: string;
  trancheEffectifsUniteLegale: string | null;
}
