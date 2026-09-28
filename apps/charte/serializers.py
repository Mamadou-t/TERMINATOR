from rest_framework import serializers

from .models import Charte, LigneBudgetairePrevisionnelle, LigneCalendrierPrevisionnel


class LigneBudgetairePrevisionnelleSerializer(serializers.ModelSerializer):
    total = serializers.DecimalField(max_digits=16, decimal_places=2, read_only=True)

    class Meta:
        model = LigneBudgetairePrevisionnelle
        fields = "__all__"
        read_only_fields = ("id", "cree_le", "modifie_le")


class LigneCalendrierPrevisionnelSerializer(serializers.ModelSerializer):
    class Meta:
        model = LigneCalendrierPrevisionnel
        fields = "__all__"
        read_only_fields = ("id", "cree_le", "modifie_le")


class CharteSerializer(serializers.ModelSerializer):
    budget_previsionnel_total = serializers.SerializerMethodField()

    class Meta:
        model = Charte
        fields = "__all__"
        read_only_fields = ("id", "cree_le", "modifie_le")

    def get_budget_previsionnel_total(self, obj):
        # Total = somme des lignes feuilles uniquement (une tache avec des
        # sous-taches est un conteneur : son montant est le cumul des enfants).
        lignes = list(obj.lignes_budgetaires.all())
        parents = {ligne.tache_parent_id for ligne in lignes if ligne.tache_parent_id}
        return sum((ligne.total for ligne in lignes if ligne.id not in parents), 0)
