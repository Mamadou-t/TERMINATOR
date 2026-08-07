from django.contrib import admin

from .models import WBS


@admin.register(WBS)
class WBSAdmin(admin.ModelAdmin):
    list_display = ("id", "cree_le", "modifie_le")
