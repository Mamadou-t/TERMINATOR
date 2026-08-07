from rest_framework import serializers

from .models import Activite


class ActiviteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activite
        fields = "__all__"
        read_only_fields = ("id", "cree_le", "modifie_le")
