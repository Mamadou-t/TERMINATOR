from django.contrib import admin

from .models import Risque


@admin.register(Risque)
class RisqueAdmin(admin.ModelAdmin):
    list_display = ("id", "cree_le", "modifie_le")
