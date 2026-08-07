from rest_framework import serializers

from .models import Cout


class CoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cout
        fields = "__all__"
        read_only_fields = ("id", "cree_le", "modifie_le")
