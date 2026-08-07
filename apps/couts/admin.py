from django.contrib import admin

from .models import Cout


@admin.register(Cout)
class CoutAdmin(admin.ModelAdmin):
    list_display = ("id", "cree_le", "modifie_le")
