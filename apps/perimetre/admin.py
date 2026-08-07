from django.contrib import admin

from .models import Perimetre


@admin.register(Perimetre)
class PerimetreAdmin(admin.ModelAdmin):
    list_display = ("id", "cree_le", "modifie_le")
