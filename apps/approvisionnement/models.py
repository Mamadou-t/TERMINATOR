from django.db import models

from apps.core.models import BaseModel


class Approvisionnement(BaseModel):
    """Entite APPROVISIONNEMENT du MLD Terminator."""

    # TODO: valeurs exactes de l'enum a confirmer
    type_materiel = models.CharField(max_length=100)
    quantite = models.DecimalField(max_digits=12, decimal_places=2)
    unite_mesure = models.CharField(max_length=50)
    fournisseur = models.CharField(max_length=255)
    date_commande = models.DateField()
    date_livraison_prevue = models.DateField()
    date_livraison_reelle = models.DateField(null=True, blank=True)
    montant = models.DecimalField(max_digits=14, decimal_places=2)
    # TODO: valeurs exactes de l'enum a confirmer
    statut_appro = models.CharField(max_length=50)

    class Meta:
        verbose_name = "approvisionnement"
        verbose_name_plural = "approvisionnements"

    def __str__(self):
        return f"{self.type_materiel} ({self.fournisseur})"


class Subir(models.Model):
    """
    Association SUBIR du MLD : lien ACTIVITES <-> APPROVISIONNEMENT (un
    approvisionnement peut alimenter plusieurs activites).
    Table de jointure pure (aucun attribut propre dans le MLD fourni).

    NB technique : le MLD montre une cle primaire composite (activite,
    approvisionnement). Django gere mal les cles composites des lors qu'il y
    a une dependance circulaire entre apps. On garde donc un id technique
    auto-incremente, avec une contrainte d'unicite sur le couple qui
    reproduit exactement la meme regle d'integrite que la cle composite du
    diagramme.
    """

    activite = models.ForeignKey("activites.Activite", on_delete=models.CASCADE)
    approvisionnement = models.ForeignKey(Approvisionnement, on_delete=models.CASCADE)

    class Meta:
        db_table = "subir"
        verbose_name = "association subir"
        verbose_name_plural = "associations subir"
        constraints = [
            models.UniqueConstraint(
                fields=["activite", "approvisionnement"], name="uniq_subir_activite_appro"
            )
        ]

    def __str__(self):
        return f"{self.activite_id} / {self.approvisionnement_id}"
