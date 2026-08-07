from django.contrib import admin

from .models import Ressource


@admin.register(Ressource)
class RessourceAdmin(admin.ModelAdmin):
    list_display = ("id", "cree_le", "modifie_le")
