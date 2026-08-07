from django.db import models

from apps.core.models import BaseModel


class Cout(BaseModel):
    """Entite COUTS du MLD Terminator."""

    poste_budgetaire = models.CharField(max_length=255)
    montant_estime = models.DecimalField(max_digits=14, decimal_places=2)
    montant_reel = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    # TODO: devise par defaut a confirmer (XOF probable, contexte BTP Cote d'Ivoire)
    devise = models.CharField(max_length=3)
    # TODO: valeurs exactes de l'enum a confirmer (materiaux, main_oeuvre, ...)
    type_cout = models.CharField(max_length=50)

    # FK optionnelle vers ACTIVITES : une activite genere plusieurs lignes de
    # cout (0,n - 1,1). Nullable : un cout peut aussi rester un poste
    # budgetaire libre, non rattache a une activite precise.
    activite = models.ForeignKey(
        "activites.Activite",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="couts",
    )

    class Meta:
        verbose_name = "cout"
        verbose_name_plural = "couts"

    def __str__(self):
        return self.poste_budgetaire
