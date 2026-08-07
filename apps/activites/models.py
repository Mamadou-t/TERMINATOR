from django.db import models

from apps.core.models import BaseModel


class Activite(BaseModel):
    """Entite ACTIVITES du MLD Terminator."""

    code_activite = models.CharField(max_length=50)
    nom_activite = models.CharField(max_length=255)
    description_activite = models.TextField(blank=True)
    date_debut_prevue = models.DateField()
    date_fin_prevue = models.DateField()
    duree_estimee = models.PositiveIntegerField(help_text="Duree estimee, unite a confirmer (jours ?).")
    progression = models.PositiveSmallIntegerField(default=0, help_text="Pourcentage d'avancement (0-100).")
    # TODO: valeurs exactes de l'enum a confirmer (non_demarree, en_cours, terminee, ...)
    statut_activite = models.CharField(max_length=50)
    # NB: liste simple dans le MLD (pas une association a part) ; a terme, une
    # vraie relation M2M auto-referencee serait plus robuste pour gerer les
    # dependances (predecesseurs/successeurs) qu'un champ texte.
    predecesseurs = models.TextField(
        blank=True, help_text="Codes des activites predecesseurs (a structurer plus tard)."
    )
    # TODO: valeurs exactes de l'enum a confirmer (FS, SS, FF, SF)
    type_dependance = models.CharField(max_length=50, blank=True)

    wbs = models.ForeignKey(
        "wbs.WBS",
        on_delete=models.CASCADE,
        related_name="activites",
    )

    class Meta:
        verbose_name = "activite"
        verbose_name_plural = "activites"

    def __str__(self):
        return f"{self.code_activite} - {self.nom_activite}"
