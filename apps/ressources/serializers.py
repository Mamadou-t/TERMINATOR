from rest_framework import serializers

from .models import Ressource


class RessourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ressource
        fields = "__all__"
        read_only_fields = ("id", "cree_le", "modifie_le")
