from django.contrib import admin

from .models import Projet


@admin.register(Projet)
class ProjetAdmin(admin.ModelAdmin):
    list_display = ("id", "cree_le", "modifie_le")
