from django.contrib import admin

from .models import Activite


@admin.register(Activite)
class ActiviteAdmin(admin.ModelAdmin):
    list_display = ("id", "cree_le", "modifie_le")
