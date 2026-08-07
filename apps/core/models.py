import uuid

from django.db import models


class BaseModel(models.Model):
    """
    Modele abstrait commun a toutes les entites du MCD/MLD Terminator.
    Fournit un identifiant UUID (plus sur pour une API publique qu'un id
    auto-incremente) ainsi que les dates de creation/modification.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cree_le = models.DateTimeField(auto_now_add=True)
    modifie_le = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
