from django.db import models

from apps.core.models import BaseModel


class Perimetre(BaseModel):
    """Entite PERIMETRE du MLD Terminator."""

    enonce_perimetre = models.TextField(blank=True)
    criteres_acceptation = models.TextField(blank=True)
    inclusions_perimetre = models.TextField(blank=True)
    exclusions_perimetre = models.TextField(blank=True)
    contraintes = models.TextField(blank=True)
    hypotheses = models.TextField(blank=True)

    class Meta:
        verbose_name = "perimetre"
        verbose_name_plural = "perimetres"

    def __str__(self):
        return str(self.id)
