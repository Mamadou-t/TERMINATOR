from django.contrib import admin

from .models import Approvisionnement, Subir


@admin.register(Approvisionnement)
class ApprovisionnementAdmin(admin.ModelAdmin):
    list_display = ("id", "type_materiel", "fournisseur", "statut_appro")
    list_filter = ("statut_appro",)
    search_fields = ("type_materiel", "fournisseur")


@admin.register(Subir)
class SubirAdmin(admin.ModelAdmin):
    list_display = ("id", "activite", "approvisionnement")
