from django.contrib import admin

from .models import Impliquer, Particier, PartiePrenante


@admin.register(PartiePrenante)
class PartiePrenanteAdmin(admin.ModelAdmin):
    list_display = ("id", "nom_entite", "role", "pouvoir", "interet")
    search_fields = ("nom_entite",)


@admin.register(Impliquer)
class ImpliquerAdmin(admin.ModelAdmin):
    list_display = ("id", "projet", "partie_prenante")


@admin.register(Particier)
class ParticierAdmin(admin.ModelAdmin):
    list_display = ("id", "partie_prenante", "activite")
