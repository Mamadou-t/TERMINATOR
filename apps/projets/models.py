from django.db import models

from apps.core.models import BaseModel


class Projet(BaseModel):
    """Entite PROJET du MLD Terminator (entite centrale)."""

    nom_projet = models.CharField(max_length=255)
    code_projet = models.CharField(max_length=50, unique=True)
    description_projet = models.TextField(blank=True)
    # Date metier du MLD (distincte de BaseModel.cree_le, qui est la date
    # technique d'enregistrement en base).
    date_creation = models.DateField()
    date_debut_prevue = models.DateField()
    date_fin_prevue = models.DateField()
    # TODO: valeurs exactes de l'enum a confirmer (brouillon, actif, cloture, ...)
    statut_projet = models.CharField(max_length=50)
    budget_total = models.DecimalField(max_digits=16, decimal_places=2)

    # Association recursive du MLD (id_projet_1) : hierarchie projet parent /
    # sous-projets (ex: lots dans un projet BTP global, cf. fichiers
    # "betalot 2"). A confirmer : cascade ou detachement (SET_NULL) souhaite
    # a la suppression du projet parent.
    projet_parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="sous_projets",
    )

    # Associations 1:1 du MLD : chaque projet a exactement une charte, un
    # perimetre, et une racine WBS (id_charte, id_perimetre, id_wbs_).
    charte = models.OneToOneField(
        "charte.Charte",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="projet",
    )
    perimetre = models.OneToOneField(
        "perimetre.Perimetre",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="projet",
    )
    wbs_racine = models.OneToOneField(
        "wbs.WBS",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="projet_racine",
    )

    # Association N:N du MLD, materialisee par la table IMPLIQUER (cf.
    # apps.parties_prenantes). Les approvisionnements d'un projet se
    # retrouvent transitivement via SUBIR -> ACTIVITES -> WBS -> PROJET
    # (cf. apps.approvisionnement.Subir), pas par un M2M direct ici.
    parties_prenantes = models.ManyToManyField(
        "parties_prenantes.PartiePrenante",
        through="parties_prenantes.Impliquer",
        related_name="projets",
        blank=True,
    )

    class Meta:
        verbose_name = "projet"
        verbose_name_plural = "projets"

    def __str__(self):
        return f"{self.code_projet} - {self.nom_projet}"
