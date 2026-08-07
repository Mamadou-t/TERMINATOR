from rest_framework import serializers

from .models import Perimetre


class PerimetreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perimetre
        fields = "__all__"
        read_only_fields = ("id", "cree_le", "modifie_le")
