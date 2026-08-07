from django.contrib import admin

from .models import Livrable


@admin.register(Livrable)
class LivrableAdmin(admin.ModelAdmin):
    list_display = ("id", "nom_livrable", "projet", "statut_livrable", "date_livraison_prevue")
    list_filter = ("statut_livrable",)
    search_fields = ("nom_livrable",)
