from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from apps.core.models import BaseModel

from .managers import UtilisateurManager


class Utilisateur(AbstractBaseUser, PermissionsMixin, BaseModel):
    """Compte d'authentification de l'application Terminator."""

    email = models.EmailField(unique=True)
    nom = models.CharField(max_length=150)
    prenom = models.CharField(max_length=150)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nom', 'prenom']

    objects = UtilisateurManager()

    class Meta:
        verbose_name = 'utilisateur'
        verbose_name_plural = 'utilisateurs'

    def __str__(self):
        return self.email

    def get_full_name(self):
        return f'{self.prenom} {self.nom}'.strip()

    def get_short_name(self):
        return self.prenom
