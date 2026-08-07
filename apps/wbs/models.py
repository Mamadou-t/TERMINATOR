from django.db import models

from apps.core.models import BaseModel


class WBS(BaseModel):
    """Entite WBS (Work Breakdown Structure) du MLD Terminator."""

    code_wbs = models.CharField(max_length=50)
    nom_travail = models.CharField(max_length=255)
    description_travail = models.TextField(blank=True)
    niveau_hierarchie = models.PositiveSmallIntegerField(
        help_text="Niveau dans l'arborescence WBS (0 = racine)."
    )
    date_debut_prevue = models.DateField()
    date_fin_prevue = models.DateField()
    duree_estimee = models.PositiveIntegerField(help_text="Duree estimee, unite a confirmer (jours ?).")

    # Association recursive du MLD (id_wbs_1) : un noeud WBS peut avoir un
    # noeud WBS parent, formant l'arborescence de decomposition du projet.
    wbs_parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="enfants",
    )

    # FK directe vers PROJET (en plus de projet.wbs_racine) : chaque noeud de
    # l'arborescence porte son projet pour permettre un filtrage simple
    # (?projet=) sans avoir a parcourir recursivement wbs_parent/enfants.
    projet = models.ForeignKey(
        "projets.Projet",
        on_delete=models.CASCADE,
        related_name="wbs_elements",
    )

    class Meta:
        verbose_name = "element WBS"
        verbose_name_plural = "elements WBS"

    def __str__(self):
        return f"{self.code_wbs} - {self.nom_travail}"
