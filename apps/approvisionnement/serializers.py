from rest_framework import serializers

from .models import Approvisionnement, Subir


class ApprovisionnementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Approvisionnement
        fields = "__all__"
        read_only_fields = ("id", "cree_le", "modifie_le")


class SubirSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subir
        fields = ("activite", "approvisionnement")
