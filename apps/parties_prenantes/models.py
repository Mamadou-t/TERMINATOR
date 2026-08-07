from django.db import models

from apps.core.models import BaseModel


class PartiePrenante(BaseModel):
    """Entite PARTIE_PRENANTE du MLD Terminator."""

    nom_entite = models.CharField(max_length=255)
    # TODO: valeurs exactes de l'enum a confirmer
    role = models.CharField(max_length=100, blank=True)
    attentes = models.TextField(blank=True)
    exigences = models.TextField(blank=True)
    # TODO: valeurs exactes de l'enum a confirmer (grille pouvoir/interet PMBOK)
    pouvoir = models.CharField(max_length=50, blank=True)
    interet = models.CharField(max_length=50, blank=True)
    strategie_engagement = models.TextField(blank=True)

    # Droits d'acces accordes a la partie prenante sur le projet (liste de
    # slugs : consulter, creer, modifier, supprimer, approuver...). L'envoi
    # d'invitation par mail et l'application effective des droits sont mis en
    # suspens (phase ulterieure).
    droits_acces = models.JSONField(default=list, blank=True)

    # Matrice RACI : dictionnaire { id_livrable: ["R" | "A" | "C" | "I"] }
    # decrivant le(s) role(s) de la partie prenante pour chaque livrable.
    raci = models.JSONField(default=dict, blank=True)

    # Signature numerique de la partie prenante, importee une fois (image en
    # base64 / data URL). Affichee en bas des documents qu'elle doit signer
    # (charte, approbations...).
    signature_image = models.TextField(blank=True)

    activites = models.ManyToManyField(
        "activites.Activite",
        through="parties_prenantes.Particier",
        related_name="parties_prenantes",
        blank=True,
    )

    class Meta:
        verbose_name = "partie prenante"
        verbose_name_plural = "parties prenantes"

    def __str__(self):
        return self.nom_entite


class Impliquer(models.Model):
    """
    Association IMPLIQUER du MLD : lien PROJET <-> PARTIE_PRENANTE.
    Table de jointure pure (aucun attribut propre dans le MLD fourni).

    NB technique : cf. Subir dans apps.approvisionnement.models pour
    l'explication du choix id technique + contrainte d'unicite plutot
    qu'une cle primaire composite.
    """

    projet = models.ForeignKey("projets.Projet", on_delete=models.CASCADE)
    partie_prenante = models.ForeignKey(PartiePrenante, on_delete=models.CASCADE)

    class Meta:
        db_table = "impliquer"
        verbose_name = "association impliquer"
        verbose_name_plural = "associations impliquer"
        constraints = [
            models.UniqueConstraint(
                fields=["projet", "partie_prenante"], name="uniq_impliquer_projet_pp"
            )
        ]

    def __str__(self):
        return f"{self.projet_id} / {self.partie_prenante_id}"


class Particier(models.Model):
    """
    Association PARTICIER du MLD (probable coquille pour "PARTICIPER" -
    a confirmer avec Toure Mamadou) : lien PARTIE_PRENANTE <-> ACTIVITES.
    Table de jointure pure (aucun attribut propre dans le MLD fourni).
    """

    partie_prenante = models.ForeignKey(PartiePrenante, on_delete=models.CASCADE)
    activite = models.ForeignKey("activites.Activite", on_delete=models.CASCADE)

    class Meta:
        db_table = "particier"
        verbose_name = "association particier"
        verbose_name_plural = "associations particier"
        constraints = [
            models.UniqueConstraint(
                fields=["partie_prenante", "activite"], name="uniq_particier_pp_activite"
            )
        ]

    def __str__(self):
        return f"{self.partie_prenante_id} / {self.activite_id}"
