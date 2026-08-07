from rest_framework import serializers

from .models import Livrable


class LivrableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Livrable
        fields = "__all__"
        read_only_fields = ("id", "cree_le", "modifie_le")
