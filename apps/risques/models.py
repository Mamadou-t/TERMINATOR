from django.db import models

from apps.core.models import BaseModel


class Risque(BaseModel):
    """Entite RISQUE du MLD Terminator."""

    description_risque = models.TextField()
    probabilite = models.PositiveSmallIntegerField(help_text="Echelle a confirmer (ex: 1-5).")
    impact = models.PositiveSmallIntegerField(help_text="Echelle a confirmer (ex: 1-5).")
    score_risque = models.PositiveSmallIntegerField(
        help_text="Generalement probabilite x impact, a confirmer si calcule ou saisi."
    )
    description_mitigation = models.TextField(blank=True)
    responsable_mitigation = models.CharField(max_length=255, blank=True)
    # TODO: valeurs exactes de l'enum a confirmer (technique, financier, planning, ...)
    categorie_risque = models.CharField(max_length=50)
    date_identification = models.DateField()
    # TODO: valeurs exactes de l'enum a confirmer (identifie, en_cours, cloture, ...)
    statut_risque = models.CharField(max_length=50)

    wbs = models.ForeignKey(
        "wbs.WBS",
        on_delete=models.CASCADE,
        related_name="risques",
    )

    class Meta:
        verbose_name = "risque"
        verbose_name_plural = "risques"

    def __str__(self):
        return self.description_risque[:50]
