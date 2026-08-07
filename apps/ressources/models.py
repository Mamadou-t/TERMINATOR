from django.db import models

from apps.core.models import BaseModel


class Ressource(BaseModel):
    """
    Correspond a l'entite "quantite_disponible" du MLD fourni (rattachee a
    l'app 'ressources' cree precedemment, car son contenu correspond a
    l'entite RESSOURCES du MCD). A confirmer avec Toure Mamadou si le nom
    "quantite_disponible" recouvre un concept distinct de RESSOURCES.
    """

    nom_ressource = models.CharField(max_length=255)
    # TODO: valeurs exactes de l'enum a confirmer (main_oeuvre, materiel, ...)
    role = models.CharField(max_length=100, blank=True)
    # TODO: valeurs exactes de l'enum a confirmer
    type_ressource = models.CharField(max_length=50)
    cout_unitaire = models.DecimalField(max_digits=14, decimal_places=2)
    unite_mesure = models.CharField(max_length=50)

    activite = models.ForeignKey(
        "activites.Activite",
        on_delete=models.CASCADE,
        related_name="ressources",
    )

    class Meta:
        verbose_name = "ressource"
        verbose_name_plural = "ressources"

    def __str__(self):
        return self.nom_ressource
