from rest_framework import serializers

from .models import Risque


class RisqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Risque
        fields = "__all__"
        read_only_fields = ("id", "cree_le", "modifie_le")
