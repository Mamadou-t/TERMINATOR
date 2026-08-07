from django.contrib import admin

from .models import Charte


@admin.register(Charte)
class CharteAdmin(admin.ModelAdmin):
    list_display = ("id", "cree_le", "modifie_le")
