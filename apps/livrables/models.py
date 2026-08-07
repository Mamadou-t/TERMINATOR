from django.db import models

from apps.core.models import BaseModel


class Livrable(BaseModel):
    """
    Entite LIVRABLES du MLD Terminator.

    Anciennement flaggee comme "a resoudre" (nouvelle entite ajoutee au MCD,
    association 12 non nommee) : desormais confirmee par le MLD fourni, avec
    une association N:1 explicite vers PROJET (id_projet).
    """

    nom_livrable = models.CharField(max_length=255)
    description_livrable = models.TextField(blank=True)
    # TODO: valeurs exactes de l'enum a confirmer
    type_livrable = models.CharField(max_length=50)
    date_livraison_prevue = models.DateField()
    date_livraison_reelle = models.DateField(null=True, blank=True)
    # TODO: valeurs exactes de l'enum a confirmer
    statut_livrable = models.CharField(max_length=50)

    projet = models.ForeignKey(
        "projets.Projet",
        on_delete=models.CASCADE,
        related_name="livrables",
    )

    class Meta:
        verbose_name = "livrable"
        verbose_name_plural = "livrables"

    def __str__(self):
        return self.nom_livrable
