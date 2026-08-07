from django.db import models

from apps.core.models import BaseModel


class Charte(BaseModel):
    """Entite CHARTE (Charte de Projet) du MLD Terminator."""

    nom_charte = models.CharField(max_length=255)
    description_charte = models.TextField(blank=True)
    probleme_opportunite = models.TextField(blank=True)
    justification_projet = models.TextField(blank=True)
    # TODO: valeurs exactes de l'enum a confirmer (brouillon, en_revue, approuvee, ...)
    statut_charte = models.CharField(max_length=50)
    date_approbation = models.DateField(null=True, blank=True)
    commentaires_approbation = models.TextField(blank=True)
    version_charte = models.CharField(max_length=20)
    alignement_strategique = models.TextField(blank=True)

    # Informations complementaires de cadrage (contexte BTP).
    localisation = models.CharField(max_length=255, blank=True)
    type_projet = models.CharField(max_length=100, blank=True)
    # Sponsor / Maitre d'ouvrage et chef de projet : saisie texte libre pour
    # l'instant (le rattachement aux parties prenantes est mis en suspens).
    sponsor_ouvrage = models.CharField(max_length=255, blank=True)
    chef_projet = models.CharField(max_length=255, blank=True)

    # Objectifs du projet.
    objectif_general = models.TextField(blank=True)
    objectifs_specifiques = models.TextField(blank=True)

    # Signature numerique de l'approbation (chef de projet ou sponsor) :
    # image tracee au canvas, stockee en base64 (data URL).
    signature_image = models.TextField(blank=True)
    signataire_nom = models.CharField(max_length=255, blank=True)
    signataire_role = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name = "charte de projet"
        verbose_name_plural = "chartes de projet"

    def __str__(self):
        return self.nom_charte


class LigneBudgetairePrevisionnelle(BaseModel):
    """
    Ligne du budget previsionnel etabli au demarrage, rattachee a la CHARTE.

    Estimation initiale (type ROM) distincte des COUTS detailles de la
    planification : chaque ligne porte une designation, un prix unitaire et
    une quantite ; le total previsionnel du projet est la somme des lignes.
    """

    charte = models.ForeignKey(
        "charte.Charte",
        on_delete=models.CASCADE,
        related_name="lignes_budgetaires",
    )
    designation = models.CharField(max_length=255)
    prix_unitaire = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    quantite = models.DecimalField(max_digits=12, decimal_places=2, default=1)
    ordre = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "ligne budgetaire previsionnelle"
        verbose_name_plural = "lignes budgetaires previsionnelles"
        ordering = ["ordre", "cree_le"]

    @property
    def total(self):
        return (self.prix_unitaire or 0) * (self.quantite or 0)

    def __str__(self):
        return self.designation


class LigneCalendrierPrevisionnel(BaseModel):
    """
    Ligne du calendrier previsionnel etabli au demarrage, rattachee a la
    CHARTE : une phase du projet avec sa duree, ses dates et ses activites
    cles (planning macro figé au cadrage, distinct de l'echeancier detaille).
    """

    charte = models.ForeignKey(
        "charte.Charte",
        on_delete=models.CASCADE,
        related_name="lignes_calendrier",
    )
    phase = models.CharField(max_length=255)
    # Duree libre (ex: "2 s" pour 2 semaines) pour rester fidele au document
    # source; la normalisation eventuelle est reportee.
    duree = models.CharField(max_length=50, blank=True)
    date_debut = models.DateField(null=True, blank=True)
    date_fin = models.DateField(null=True, blank=True)
    activites_cles = models.TextField(blank=True)
    ordre = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "ligne calendrier previsionnel"
        verbose_name_plural = "lignes calendrier previsionnel"
        ordering = ["ordre", "cree_le"]

    def __str__(self):
        return self.phase
